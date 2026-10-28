import { act, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, type ReactElement } from 'react';
import { EventEmitter } from 'node:events';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import {
  isDocumentPictureInPictureSupported,
  registerEnterPictureInPictureAction,
  useDocumentPictureInPicture,
} from '@web/documentPictureInPicture';
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

vi.mock('@web/documentPictureInPicture', () => ({
  isDocumentPictureInPictureSupported: vi.fn(() => false),
  registerEnterPictureInPictureAction: vi.fn(() => vi.fn()),
  useDocumentPictureInPicture: vi.fn(),
}));

const validSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

type ActiveSpeakerHandler = (subscriberId: string | undefined) => void;

let enterPictureInPictureHandler: (() => void) | undefined;
let capturedOnClose: (() => void) | undefined;
const mockUnregisterEnterPictureInPicture = vi.fn();
const mockOpen = vi.fn();
const mockClose = vi.fn();

const pipState: { window: Window | null; mountNode: HTMLElement | null } = {
  window: null,
  mountNode: null,
};

describe('MiniModeContext', () => {
  beforeEach(() => {
    enterPictureInPictureHandler = undefined;
    capturedOnClose = undefined;
    pipState.window = null;
    pipState.mountNode = null;

    env.partialUpdate({ ALLOW_MINI_MODE: true });
    setupWindowNavigatorMock({
      mediaDevices: {
        enumerateDevices: Promise.resolve([]),
      },
    });
    vi.spyOn(navigator.permissions, 'query').mockResolvedValue({
      state: 'granted',
    } as PermissionStatus);

    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(registerEnterPictureInPictureAction).mockImplementation((handler) => {
      enterPictureInPictureHandler = handler;
      return mockUnregisterEnterPictureInPicture;
    });
    vi.mocked(useDocumentPictureInPicture).mockImplementation((options) => {
      capturedOnClose = options?.onClose;
      return {
        window: pipState.window,
        mountNode: pipState.mountNode,
        open: mockOpen,
        close: mockClose,
      };
    });
    mockOpen.mockImplementation(() => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      pipState.window = { closed: false, close: vi.fn() } as unknown as Window;
      pipState.mountNode = mount;
      return Promise.resolve();
    });
    mockClose.mockImplementation(() => {
      pipState.window = null;
      pipState.mountNode = null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockOpen.mockReset();
    mockClose.mockReset();
  });

  it('useMiniMode throws when used outside of a MiniModeProvider', () => {
    const Probe = (): ReactElement | null => {
      useMiniMode();
      return null;
    };

    expect(() => renderBase(<Probe />)).toThrow(
      'useMiniMode must be used within a MiniModeProvider'
    );
  });

  it('is unsupported and enter is a no-op when the Document PiP API is unavailable', async () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(false);
    const { miniModeContext } = render();

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    expect(miniModeContext.current?.isSupported).toBe(false);
    expect(mockOpen).not.toHaveBeenCalled();
    expect(miniModeContext.current?.isOpen).toBe(false);
    expect(registerEnterPictureInPictureAction).not.toHaveBeenCalled();
  });

  it('enter opens a 360x260 window showing the publisher when there are no subscribers', async () => {
    const publisherVideoElement = document.createElement('video');
    const { miniModeContext } = render({ publisherInitialValue: { publisherVideoElement } });

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    expect(mockOpen).toHaveBeenCalledWith({ width: 360, height: 260 });
    expect(miniModeContext.current?.participant?.name).toBe('Publisher Name');
    expect(miniModeContext.current?.hostedElement).toBe(publisherVideoElement);
    expect(pipState.mountNode?.contains(publisherVideoElement)).toBe(true);
  });

  it('shows the recording indicator for a recording, but not for a transcription alone', async () => {
    const transcriptionOnly = render({
      sessionInitialValue: { archiveId: 'transcription-archive' },
      onSessionCreated: (context) => {
        context.transcriptionArchiveId = 'transcription-archive';
      },
    });
    await act(async () => {
      await transcriptionOnly.miniModeContext.current?.enter();
    });

    expect(screen.getByTestId('mini-call-window')).toBeVisible();
    expect(screen.queryByTestId('mini-mode-recording-indicator')).not.toBeInTheDocument();
    transcriptionOnly.unmount();

    const recording = render({ sessionInitialValue: { archiveId: 'recording-archive' } });
    await act(async () => {
      await recording.miniModeContext.current?.enter();
    });

    expect(screen.getByTestId('mini-mode-recording-indicator')).toBeInTheDocument();
  });

  it('picks the active speaker camera subscriber, skipping screenshares', async () => {
    const screenshare = makeSubscriberWrapper('screenshare', 'Screen', true);
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    const { miniModeContext } = render({
      sessionInitialValue: {
        subscriberWrappers: [screenshare, cameraA, cameraB],
        activeSpeakerId: 'camera-b',
      },
    });

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    expect(miniModeContext.current?.participant?.name).toBe('Bob B');
    expect(miniModeContext.current?.hostedElement).toBe(cameraB.element);
  });

  it('falls back to the first camera subscriber when no active speaker is set', async () => {
    const screenshare = makeSubscriberWrapper('screenshare', 'Screen', true);
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    const { miniModeContext } = render({
      sessionInitialValue: { subscriberWrappers: [screenshare, cameraA, cameraB] },
    });

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    expect(miniModeContext.current?.participant?.name).toBe('Alice A');
    expect(miniModeContext.current?.hostedElement).toBe(cameraA.element);
  });

  it('follows active speaker changes only while open and only when the speaker changes', async () => {
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    const { miniModeContext, activeSpeaker } = render({
      sessionInitialValue: { subscriberWrappers: [cameraA, cameraB] },
    });

    act(() => {
      activeSpeaker.change?.('camera-b');
    });
    expect(miniModeContext.current?.participant).toBeNull();

    await act(async () => {
      await miniModeContext.current?.enter();
    });
    expect(miniModeContext.current?.hostedElement).toBe(cameraA.element);

    act(() => {
      activeSpeaker.change?.('camera-a');
    });
    expect(miniModeContext.current?.hostedElement).toBe(cameraA.element);

    act(() => {
      activeSpeaker.change?.('camera-b');
    });
    expect(miniModeContext.current?.participant?.name).toBe('Bob B');
    expect(pipState.mountNode?.contains(cameraB.element)).toBe(true);
  });

  it('exit restores the hosted element to its original parent and closes the window', async () => {
    const originalParent = document.createElement('div');
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    originalParent.appendChild(cameraA.element);
    const { miniModeContext } = render({ sessionInitialValue: { subscriberWrappers: [cameraA] } });

    await act(async () => {
      await miniModeContext.current?.enter();
    });
    expect(cameraA.element.parentElement).not.toBe(originalParent);

    act(() => {
      miniModeContext.current?.exit();
    });

    expect(cameraA.element.parentElement).toBe(originalParent);
    expect(mockClose).toHaveBeenCalledOnce();
    expect(miniModeContext.current?.isOpen).toBe(false);
    expect(miniModeContext.current?.participant).toBeNull();
  });

  it('restores the hosted element when the window is closed externally', async () => {
    const originalParent = document.createElement('div');
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    originalParent.appendChild(cameraA.element);
    const { miniModeContext } = render({ sessionInitialValue: { subscriberWrappers: [cameraA] } });

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    act(() => {
      mockClose();
      capturedOnClose?.();
    });

    expect(cameraA.element.parentElement).toBe(originalParent);
    expect(miniModeContext.current?.hostedElement).toBeNull();
  });

  it('leave exits, disconnects, destroys the background publisher, and navigates to goodbye', async () => {
    const { miniModeContext, sessionContext, backgroundPublisherContext } = render();

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    act(() => {
      miniModeContext.current?.leave();
    });

    expect(mockClose).toHaveBeenCalledOnce();
    expect(sessionContext.current.disconnect).toHaveBeenCalledOnce();
    expect(backgroundPublisherContext.current.destroyBackgroundPublisher).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith(`/goodbye/${validSessionKey}`);
  });

  it('reports an error and stays closed when opening the window fails', async () => {
    const reportError = vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
    mockOpen.mockRejectedValue(new Error('denied'));
    const { miniModeContext } = render();

    await act(async () => {
      await miniModeContext.current?.enter();
    });

    expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
      eventSource: 'miniMode.enter.error',
    });
    expect(miniModeContext.current?.isOpen).toBe(false);
  });

  it('enters Mini Mode through the automatic picture-in-picture action and unregisters it on unmount', async () => {
    const { miniModeContext, unmount } = render();

    await act(async () => {
      enterPictureInPictureHandler?.();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(miniModeContext.current?.isOpen).toBe(true);

    unmount();

    expect(mockUnregisterEnterPictureInPicture).toHaveBeenCalledOnce();
  });

  it('does not register the automatic action without a publisher', () => {
    render({ publisherInitialValue: { publisher: null } });

    expect(registerEnterPictureInPictureAction).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  sessionInitialValue?: SessionContextInitialValue;
  publisherInitialValue?: PublisherContextInitialValue;
  onSessionCreated?: (context: SessionContextType) => void;
};

function render({
  sessionInitialValue,
  publisherInitialValue,
  onSessionCreated,
}: RenderOptions = {}) {
  const miniModeContext: { current: MiniModeContextType | null } = { current: null };
  const activeSpeaker: { change?: ActiveSpeakerHandler } = {};

  const Probe = (): null => {
    const context = useMiniMode();
    useEffect(() => {
      miniModeContext.current = context;
    });
    return null;
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
          context.registerActiveSpeakerChangeHandler = (handler) => {
            activeSpeaker.change = handler;
          };
          onSessionCreated?.(context);
        },
      },
      publisherContext: {
        initialValue: {
          publisher: makePublisher(),
          ...publisherInitialValue,
        },
      },
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.destroyBackgroundPublisher = vi.fn();
        },
      },
    }
  );

  const result = renderBase(
    <MiniModeProvider>
      <Probe />
    </MiniModeProvider>,
    { wrapper }
  );

  return { ...result, miniModeContext, activeSpeaker, sessionContext, backgroundPublisherContext };
}

function makeSubscriberWrapper(id: string, name: string, isScreenshare = false): SubscriberWrapper {
  return {
    id,
    element: document.createElement('video'),
    subscriber: {
      stream: { name, initials: name.slice(0, 2).toUpperCase() },
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
