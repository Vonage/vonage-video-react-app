import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useLayoutEffect, useRef, type ReactElement } from 'react';
import useSessionContext from '@hooks/useSessionContext';
import usePublisherContext from '@hooks/usePublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import {
  isDocumentPictureInPictureSupported,
  registerEnterPictureInPictureAction,
  useDocumentPictureInPicture,
} from '@common/documentPictureInPicture';
import type { Subscriber } from '@vonage/client-sdk-video';
import frontendLogger from '../../logger';
import { env } from '../../env';
import { MiniModeProvider, useMiniMode, type MiniModeContextType } from './MiniModeContext';
import type { MiniCallWindowProps } from '../../components/MeetingRoom/MiniCallWindow/MiniCallWindow';
import type { SubscriberWrapper } from '../../types/session';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@hooks/useSessionContext', () => ({
  default: vi.fn(),
}));

vi.mock('@hooks/usePublisherContext', () => ({
  default: vi.fn(),
}));

vi.mock('@hooks/useBackgroundPublisherContext', () => ({
  default: vi.fn(),
}));

vi.mock('@common/documentPictureInPicture', () => ({
  isDocumentPictureInPictureSupported: vi.fn(() => false),
  registerEnterPictureInPictureAction: vi.fn(() => vi.fn()),
  useDocumentPictureInPicture: vi.fn(() => ({
    window: null,
    mountNode: null,
    open: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock('../../logger', () => {
  const reportError = vi.fn();
  return {
    default: { reportError },
    frontendLogger: { reportError },
  };
});

// Mirrors the real component's re-parenting behavior so tests can assert
// that hosted elements move into (and out of) the Mini Mode window.
vi.mock('../../components/MeetingRoom/MiniCallWindow', () => ({
  default: function MiniCallWindowMock({ hostedElement }: MiniCallWindowProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      if (hostRef.current && hostedElement) {
        hostRef.current.appendChild(hostedElement);
      }
    }, [hostedElement]);
    return (
      <div data-testid="mini-call-window">
        <div data-testid="mini-call-window-host" ref={hostRef} />
      </div>
    );
  },
}));

type ActiveSpeakerHandler = (subscriberId: string | undefined) => void;

let activeSpeakerHandler: ActiveSpeakerHandler | undefined;
let enterPictureInPictureHandler: (() => void) | undefined;
let capturedOnClose: (() => void) | undefined;
const mockUnregisterEnterPictureInPicture = vi.fn();
const mockDisconnect = vi.fn();
const mockDestroyBackgroundPublisher = vi.fn();
const mockOpen = vi.fn();
const mockClose = vi.fn();

const pipState: { window: Window | null; mountNode: HTMLElement | null } = {
  window: null,
  mountNode: null,
};

const makeSubscriberWrapper = (
  id: string,
  name: string,
  isScreenshare = false
): SubscriberWrapper => ({
  id,
  element: document.createElement('video'),
  subscriber: {
    stream: { name, initials: name.slice(0, 2).toUpperCase() },
  } as unknown as Subscriber,
  isScreenshare,
  isPinned: false,
});

const makeSessionContext = (overrides: Record<string, unknown> = {}) =>
  ({
    subscriberWrappers: [],
    activeSpeakerId: undefined,
    registerActiveSpeakerChangeHandler: vi.fn((handler: ActiveSpeakerHandler) => {
      activeSpeakerHandler = handler;
    }),
    unregisterActiveSpeakerChangeHandler: vi.fn(),
    disconnect: mockDisconnect,
    sessionKey: 'test-session',
    archiveId: null,
    ...overrides,
  }) as unknown as ReturnType<typeof useSessionContext>;

const makePublisherContext = (overrides: Record<string, unknown> = {}) =>
  ({
    publisherVideoElement: null,
    publisher: { stream: { name: 'Publisher Name', initials: 'PN' } },
    isAudioEnabled: true,
    isVideoEnabled: true,
    toggleAudio: vi.fn(),
    toggleVideo: vi.fn(),
    ...overrides,
  }) as unknown as ReturnType<typeof usePublisherContext>;

const renderProvider = (): { current: MiniModeContextType | null } => {
  const contextRef: { current: MiniModeContextType | null } = { current: null };
  const Probe = (): null => {
    const context = useMiniMode();
    useEffect(() => {
      contextRef.current = context;
    });
    return null;
  };

  render(
    <MiniModeProvider>
      <Probe />
    </MiniModeProvider>
  );

  return contextRef;
};

describe('MiniModeContext', () => {
  beforeEach(() => {
    activeSpeakerHandler = undefined;
    enterPictureInPictureHandler = undefined;
    capturedOnClose = undefined;
    pipState.window = null;
    pipState.mountNode = null;

    env.partialUpdate({ ALLOW_MINI_MODE: true });

    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(false);
    vi.mocked(registerEnterPictureInPictureAction).mockImplementation((handler) => {
      enterPictureInPictureHandler = handler;
      return mockUnregisterEnterPictureInPicture;
    });
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(false);

    vi.mocked(useSessionContext).mockReturnValue(makeSessionContext());
    vi.mocked(usePublisherContext).mockReturnValue(makePublisherContext());
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      destroyBackgroundPublisher: mockDestroyBackgroundPublisher,
    } as unknown as ReturnType<typeof useBackgroundPublisherContext>);

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

    expect(() => render(<Probe />)).toThrow('useMiniMode must be used within a MiniModeProvider');
  });

  it('renders children and exposes supported=false when the PiP API is missing', () => {
    const Probe = (): ReactElement => {
      const context = useMiniMode();
      return (
        <>
          <div data-testid="child">Content</div>
          <span data-testid="supported">{String(context.isSupported)}</span>
          <span data-testid="isOpen">{String(context.isOpen)}</span>
        </>
      );
    };

    render(
      <MiniModeProvider>
        <Probe />
      </MiniModeProvider>
    );

    expect(screen.getByTestId('child').textContent).toBe('Content');
    expect(screen.getByTestId('supported').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('false');
  });

  it('enter is a no-op when the Document PiP API is unavailable', async () => {
    const contextRef = renderProvider();

    await act(async () => {
      await contextRef.current?.enter();
    });

    expect(mockOpen).not.toHaveBeenCalled();
    expect(contextRef.current?.isOpen).toBe(false);
  });

  it('enter opens a 360x260 PiP window and shows the publisher when there are no subscribers', async () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    const publisherVideoElement = document.createElement('video');
    vi.mocked(usePublisherContext).mockReturnValue(makePublisherContext({ publisherVideoElement }));

    const contextRef = renderProvider();
    expect(contextRef.current?.isSupported).toBe(true);

    await act(async () => {
      await contextRef.current?.enter();
    });

    expect(mockOpen).toHaveBeenCalledWith({ width: 360, height: 260 });
    expect(contextRef.current?.isOpen).toBe(true);
    expect(contextRef.current?.participant?.name).toBe('Publisher Name');
    expect(contextRef.current?.participant?.initials).toBe('PN');
    expect(contextRef.current?.hostedElement).toBe(publisherVideoElement);
  });

  it('renders the MiniCallWindow portal into the PiP mount node when open', async () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    const contextRef = renderProvider();

    await act(async () => {
      await contextRef.current?.enter();
    });

    const mountNode = pipState.mountNode;
    expect(mountNode).not.toBeNull();
    expect(mountNode?.querySelector('[data-testid="mini-call-window"]')).not.toBeNull();
  });

  it('picks the active speaker camera subscriber, skipping screenshares', async () => {
    const screenshare = makeSubscriberWrapper('screenshare', 'Screen', true);
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(useSessionContext).mockReturnValue(
      makeSessionContext({
        subscriberWrappers: [screenshare, cameraA, cameraB],
        activeSpeakerId: 'camera-b',
      })
    );

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });

    expect(contextRef.current?.participant?.name).toBe('Bob B');
    expect(contextRef.current?.hostedElement).toBe(cameraB.element);
  });

  it('falls back to the first camera subscriber when no active speaker is set', async () => {
    const screenshare = makeSubscriberWrapper('screenshare', 'Screen', true);
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(useSessionContext).mockReturnValue(
      makeSessionContext({ subscriberWrappers: [screenshare, cameraA, cameraB] })
    );

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });

    expect(contextRef.current?.participant?.name).toBe('Alice A');
    expect(contextRef.current?.hostedElement).toBe(cameraA.element);
  });

  it('re-parents the hosted element when the active speaker changes while open', async () => {
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(useSessionContext).mockReturnValue(
      makeSessionContext({ subscriberWrappers: [cameraA, cameraB] })
    );

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });
    expect(contextRef.current?.hostedElement).toBe(cameraA.element);

    act(() => {
      activeSpeakerHandler?.('camera-b');
    });

    expect(contextRef.current?.participant?.name).toBe('Bob B');
    expect(contextRef.current?.hostedElement).toBe(cameraB.element);
    // The new element is moved into the Mini Mode window host
    expect(pipState.mountNode?.contains(cameraB.element)).toBe(true);
  });

  it('ignores the active speaker handler for the current element or while closed', async () => {
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    const cameraB = makeSubscriberWrapper('camera-b', 'Bob B');
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(useSessionContext).mockReturnValue(
      makeSessionContext({ subscriberWrappers: [cameraA, cameraB] })
    );

    const contextRef = renderProvider();

    // While closed the handler is a no-op
    act(() => {
      activeSpeakerHandler?.('camera-b');
    });
    expect(contextRef.current?.participant).toBeNull();

    await act(async () => {
      await contextRef.current?.enter();
    });
    expect(contextRef.current?.hostedElement).toBe(cameraA.element);

    // Invoking with the currently-hosted element is a no-op
    act(() => {
      activeSpeakerHandler?.('camera-a');
    });
    expect(contextRef.current?.participant?.name).toBe('Alice A');
    expect(contextRef.current?.hostedElement).toBe(cameraA.element);
  });

  it('exit restores the hosted element to its original parent and closes the window', async () => {
    const originalParent = document.createElement('div');
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    originalParent.appendChild(cameraA.element);
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(useSessionContext).mockReturnValue(
      makeSessionContext({ subscriberWrappers: [cameraA] })
    );

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });

    // Sanity check: the element was re-parented into the Mini Mode window
    expect(cameraA.element.parentElement).not.toBe(originalParent);

    act(() => {
      contextRef.current?.exit();
    });

    expect(cameraA.element.parentElement).toBe(originalParent);
    expect(mockClose).toHaveBeenCalledOnce();
    expect(contextRef.current?.isOpen).toBe(false);
    expect(contextRef.current?.participant).toBeNull();
  });

  it('leave exits, disconnects, destroys the background publisher, and navigates to goodbye', async () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });

    act(() => {
      contextRef.current?.leave();
    });

    expect(mockClose).toHaveBeenCalledOnce();
    expect(mockDisconnect).toHaveBeenCalledOnce();
    expect(mockDestroyBackgroundPublisher).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/goodbye/test-session');
  });

  it('reports an error and stays closed when opening the PiP window fails', async () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    mockOpen.mockRejectedValue(new Error('denied'));

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });

    expect(frontendLogger.reportError).toHaveBeenCalledWith(expect.any(Error), {
      eventSource: 'miniMode.enter.error',
    });
    expect(contextRef.current?.isOpen).toBe(false);
  });

  it('registers the automatic picture-in-picture action and enters Mini Mode when invoked', async () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);

    const contextRef = renderProvider();

    expect(registerEnterPictureInPictureAction).toHaveBeenCalledOnce();
    expect(enterPictureInPictureHandler).toBeDefined();

    await act(async () => {
      // The handler enters Mini Mode fire-and-forget; flush its async chain
      enterPictureInPictureHandler?.();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockOpen).toHaveBeenCalledWith({ width: 360, height: 260 });
    expect(contextRef.current?.isOpen).toBe(true);
  });

  it('does not register the automatic action when Mini Mode is unsupported', () => {
    renderProvider();

    expect(registerEnterPictureInPictureAction).not.toHaveBeenCalled();
  });

  it('does not register the automatic action without a publisher', () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(usePublisherContext).mockReturnValue(makePublisherContext({ publisher: null }));

    renderProvider();

    expect(registerEnterPictureInPictureAction).not.toHaveBeenCalled();
  });

  it('unregisters the automatic action on unmount', () => {
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);

    const Probe = (): null => null;
    const { unmount } = render(
      <MiniModeProvider>
        <Probe />
      </MiniModeProvider>
    );

    expect(registerEnterPictureInPictureAction).toHaveBeenCalledOnce();

    unmount();

    expect(mockUnregisterEnterPictureInPicture).toHaveBeenCalledOnce();
  });

  it('restores the hosted element when the window is closed externally', async () => {
    const originalParent = document.createElement('div');
    const cameraA = makeSubscriberWrapper('camera-a', 'Alice A');
    originalParent.appendChild(cameraA.element);
    vi.mocked(isDocumentPictureInPictureSupported).mockReturnValue(true);
    vi.mocked(useSessionContext).mockReturnValue(
      makeSessionContext({ subscriberWrappers: [cameraA] })
    );

    const contextRef = renderProvider();
    await act(async () => {
      await contextRef.current?.enter();
    });
    expect(cameraA.element.parentElement).not.toBe(originalParent);

    // Simulates the hook's pagehide path: the window closes and onClose fires
    act(() => {
      mockClose();
      capturedOnClose?.();
    });

    expect(cameraA.element.parentElement).toBe(originalParent);
    expect(contextRef.current?.participant).toBeNull();
    expect(contextRef.current?.hostedElement).toBeNull();
  });
});
