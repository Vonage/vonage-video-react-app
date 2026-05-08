import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook as renderHookBase, act } from '@testing-library/react';
import { Publisher, initPublisher } from '@vonage/client-sdk-video';
import useScreenShare from '../useScreenShare';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import EventEmitter from 'events';
import type VonageVideoClient from '../../utils/VonageVideoClient';
import { type UserContextType } from '../../Context/user';

// Mocking dependencies
vi.mock('@vonage/client-sdk-video', () => ({
  initPublisher: vi.fn(),
}));

describe('useScreenSharing', () => {
  let mockVonageVideoClient: Partial<VonageVideoClient>;
  let mockPublisher: Partial<Publisher>;
  let handlers: Record<string, (...args: unknown[]) => void>;
  const mockPublish = vi.fn();
  const mockUnpublish = vi.fn();

  beforeEach(() => {
    handlers = {};
    mockVonageVideoClient = Object.assign(new EventEmitter(), {
      on: vi.fn(),
      off: vi.fn(),
    }) as unknown as Partial<VonageVideoClient> as VonageVideoClient;

    mockPublisher = {
      on: vi.fn((event, cb) => {
        handlers[event] = cb;
      }),
      destroy: vi.fn(),
    } as unknown as Partial<Publisher>;

    (initPublisher as ReturnType<typeof vi.fn>).mockReturnValue(mockPublisher as Publisher);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes screen sharing publisher and publishes', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      // toggling screen share on
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).toHaveBeenCalledWith(
      undefined,
      {
        videoSource: 'screen',
        insertDefaultUI: false,
        videoContentHint: 'detail',
        name: "TestUser's screen",
      },
      expect.any(Function)
    );
    expect(mockPublisher.on).toHaveBeenCalledWith('streamCreated', expect.any(Function));
    expect(mockPublisher.on).toHaveBeenCalledWith('streamDestroyed', expect.any(Function));
    expect(mockPublisher.on).toHaveBeenCalledWith('mediaStopped', expect.any(Function));
  });

  it('unpublishes screen sharing when already sharing', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      // toggling screen share on
      await result.current.toggleShareScreen();
      // toggling screen share off
      await result.current.toggleShareScreen();
    });

    expect(result.current.isSharingScreen).toBe(false);
  });

  it('sets isEntireScreen to true when displaySurface is monitor', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'monitor' }) }],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    expect(result.current.isEntireScreen).toBe(true);
    expect(result.current.screenshareVideoElement).toBe(mockVideoEl);
  });

  it('sets isEntireScreen to false when displaySurface is window', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'window' }) }],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    expect(result.current.isEntireScreen).toBe(false);
  });

  it('resets isEntireScreen when streamDestroyed fires', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'monitor' }) }],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    expect(result.current.screenshareVideoElement).toBe(mockVideoEl);
    expect(result.current.isEntireScreen).toBe(true);

    act(() => {
      handlers['streamDestroyed']();
    });

    expect(result.current.isEntireScreen).toBe(false);
    expect(result.current.isSharingScreen).toBe(false);
    expect(result.current.screenshareVideoElement).toBe(undefined);
  });

  it('sets isEntireScreen to true when displaySurface is undefined but dimensions match the screen area', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [
          {
            getSettings: () => ({
              displaySurface: undefined,
              width: window.screen.width,
              height: window.screen.height,
            }),
          },
        ],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    expect(result.current.isEntireScreen).toBe(true);
  });

  it('does not initialize publisher if session is null', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = null;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render({ userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      sessionContext,
      userContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderHookBase(() => useScreenShare(), {
      wrapper,
    }),
  };
}
