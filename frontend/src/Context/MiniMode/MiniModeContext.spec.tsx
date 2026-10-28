import { act, render as renderBase, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, type ReactElement } from 'react';
import { EventEmitter } from 'node:events';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import type { Publisher, Subscriber } from '@vonage/client-sdk-video';
import { makeTestProvider, providers } from '@test/providers';
import type {
  SessionContextInitialValue,
  SessionContextType,
} from '@Context/SessionProvider/session';
import type { PublisherContextInitialValue } from '@Context/PublisherProvider/usePublisher/usePublisher';
import frontendLogger from '../../logger';
import { env } from '../../env';
import { MiniModeProvider, useMiniMode, type MiniModeContextType } from './MiniModeContext';
import type { SubscriberWrapper } from '../../types/session';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

const validSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

describe('MiniModeContext', () => {
  let pipWindow: ReturnType<typeof makePictureInPictureWindow>;
  let requestWindow: ReturnType<typeof vi.fn>;
  let setActionHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    env.partialUpdate({ ALLOW_MINI_MODE: true });
    setupWindowNavigatorMock({ mediaDevices: { enumerateDevices: Promise.resolve([]) } });
    vi.spyOn(navigator.permissions, 'query').mockResolvedValue({
      state: 'granted',
    } as PermissionStatus);

    setActionHandler = vi.fn();
    Object.defineProperty(navigator, 'mediaSession', {
      value: { setActionHandler },
      configurable: true,
    });

    pipWindow = makePictureInPictureWindow();
    requestWindow = vi.fn().mockResolvedValue(pipWindow);
    vi.stubGlobal('documentPictureInPicture', { requestWindow });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('useMiniMode throws outside of a MiniModeProvider', () => {
    const Probe = (): ReactElement | null => {
      useMiniMode();
      return null;
    };

    expect(() => renderBase(<Probe />)).toThrow(
      'useMiniMode must be used within a MiniModeProvider'
    );
  });

  it('shows the publisher when alone, and puts the video back when exiting', async () => {
    const publisherVideoElement = mountInTile(document.createElement('video'));
    const tile = publisherVideoElement.parentElement;
    const { miniMode } = render({ publisherInitialValue: { publisherVideoElement } });

    await act(() => miniMode.current!.enter());

    expect(requestWindow).toHaveBeenCalledWith({ width: 360, height: 260 });
    expect(pipWindow.document.body.contains(publisherVideoElement)).toBe(true);
    expect(pipWindow.document.body.textContent).toContain('Publisher Name');

    act(() => miniMode.current!.exit());

    expect(publisherVideoElement.parentElement).toBe(tile);
    expect(miniMode.current?.isOpen).toBe(false);
  });

  it('follows the active speaker, skipping screenshares, and returns videos when the browser closes it', async () => {
    const screenshare = makeSubscriberWrapper('screenshare', 'Screen', true);
    const alice = makeSubscriberWrapper('alice', 'Alice');
    const bob = makeSubscriberWrapper('bob', 'Bob');
    const bobTile = bob.element.parentElement;
    const { miniMode, sessionContext, rerender } = render({
      sessionInitialValue: { subscriberWrappers: [screenshare, alice, bob] },
      publisherInitialValue: { isVideoEnabled: false },
    });

    await act(() => miniMode.current!.enter());
    expect(pipWindow.document.body.contains(alice.element)).toBe(true);

    sessionContext.current.activeSpeakerId = 'bob';
    rerender();

    expect(pipWindow.document.body.contains(bob.element)).toBe(true);
    expect(pipWindow.document.body.textContent).not.toContain('BO');
    expect(document.body.contains(alice.element)).toBe(true);

    act(() => pipWindow.close());

    expect(bob.element.parentElement).toBe(bobTile);
    expect(miniMode.current?.isOpen).toBe(false);
  });

  it('shows the recording indicator for a recording, not for a transcription alone', async () => {
    const { miniMode, sessionContext, rerender } = render({
      sessionInitialValue: { archiveId: 'transcription' },
      onSessionCreated: (context) => {
        context.transcriptionArchiveId = 'transcription';
      },
    });
    await act(() => miniMode.current!.enter());

    expect(findRecordingIndicator(pipWindow.document)).toBeNull();

    sessionContext.current.recordingArchiveId = 'recording';
    rerender();

    expect(findRecordingIndicator(pipWindow.document)).not.toBeNull();
  });

  it('leave closes the window, disconnects, and navigates to goodbye', async () => {
    const { miniMode, sessionContext, backgroundPublisherContext } = render();

    await act(() => miniMode.current!.enter());
    act(() => {
      within(pipWindow.document.body).getByTestId('mini-mode-leave').click();
    });

    expect(pipWindow.closed).toBe(true);
    expect(sessionContext.current.disconnect).toHaveBeenCalledOnce();
    expect(backgroundPublisherContext.current.destroyBackgroundPublisher).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith(`/goodbye/${validSessionKey}`);
  });

  it('reports an error and stays closed when the window cannot open', async () => {
    const reportError = vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
    requestWindow.mockRejectedValue(new Error('denied'));
    const { miniMode } = render();

    await act(() => miniMode.current!.enter());

    expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
      eventSource: 'miniMode.enter.error',
    });
    expect(miniMode.current?.isOpen).toBe(false);
  });

  it('opens when the browser triggers automatic picture-in-picture, only with a publisher', async () => {
    render({ publisherInitialValue: { publisher: null } });
    expect(setActionHandler).not.toHaveBeenCalled();

    const { miniMode } = render();
    const [, enterPictureInPicture] = setActionHandler.mock.calls[0] as [string, () => void];

    await act(async () => {
      enterPictureInPicture();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(miniMode.current?.isOpen).toBe(true);
  });
});

type MiniModeRef = { current: MiniModeContextType | null };
type OnMiniModeRender = (context: MiniModeContextType) => void;

type RenderOptions = {
  sessionInitialValue?: SessionContextInitialValue;
  publisherInitialValue?: PublisherContextInitialValue;
  onSessionCreated?: (context: SessionContextType) => void;
};

function MiniModeUnderTest({ onRender }: { onRender: OnMiniModeRender }): ReactElement {
  return (
    <MiniModeProvider>
      <Probe onRender={onRender} />
    </MiniModeProvider>
  );
}

function Probe({ onRender }: { onRender: OnMiniModeRender }): null {
  const context = useMiniMode();
  useEffect(() => {
    onRender(context);
  });
  return null;
}

function render({
  sessionInitialValue,
  publisherInitialValue,
  onSessionCreated,
}: RenderOptions = {}) {
  const miniMode: MiniModeRef = { current: null };
  const captureMiniMode: OnMiniModeRender = (context) => {
    miniMode.current = context;
  };
  const { wrapper, sessionContext, backgroundPublisherContext } = makeTestProvider(
    [
      providers.runtime,
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
    ],
    {
      runtimeContext: undefined,
      userContext: undefined,
      sessionContext: {
        initialValue: { sessionKey: validSessionKey, ...sessionInitialValue },
        __onCreated: (context) => {
          context.disconnect = vi.fn();
          onSessionCreated?.(context);
        },
      },
      publisherContext: {
        initialValue: { publisher: makePublisher(), ...publisherInitialValue },
      },
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.destroyBackgroundPublisher = vi.fn();
        },
      },
    }
  );

  const result = renderBase(<MiniModeUnderTest onRender={captureMiniMode} />, { wrapper });
  const rerender = () => result.rerender(<MiniModeUnderTest onRender={captureMiniMode} />);

  return { ...result, rerender, miniMode, sessionContext, backgroundPublisherContext };
}

function makePictureInPictureWindow() {
  const pipWindow = Object.assign(new EventTarget(), {
    document: document.implementation.createHTMLDocument(''),
    closed: false,
    close: () => {
      pipWindow.closed = true;
      pipWindow.dispatchEvent(new Event('pagehide'));
    },
  });
  return pipWindow;
}

function findRecordingIndicator(target: Document): Element | null {
  return target.querySelector('[data-testid="mini-mode-recording-indicator"]');
}

function mountInTile<Element extends HTMLElement>(element: Element): Element {
  document.body.appendChild(document.createElement('div')).appendChild(element);
  return element;
}

function makeSubscriberWrapper(id: string, name: string, isScreenshare = false): SubscriberWrapper {
  return {
    id,
    element: mountInTile(document.createElement('video')),
    subscriber: {
      stream: { name, initials: name.slice(0, 2).toUpperCase(), hasVideo: true },
    } as unknown as Subscriber,
    isScreenshare,
    isPinned: false,
  };
}

function makePublisher(): Publisher {
  return Object.assign(new EventEmitter(), {
    stream: { name: 'Publisher Name', initials: 'PN' },
  }) as unknown as Publisher;
}
