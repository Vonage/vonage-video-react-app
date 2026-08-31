import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook as renderHookBase, act } from '@testing-library/react';
import { Publisher, initPublisher } from '@vonage/client-sdk-video';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import EventEmitter from 'events';
import type VonageVideoClient from '../../utils/VonageVideoClient';
import { type UserContextType } from '../../Context/user';
import screenShare$ from './screenShare$';

vi.mock('@vonage/client-sdk-video', () => ({
  initPublisher: vi.fn(),
}));

describe('screenShare$', () => {
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

    vi.mocked(initPublisher).mockReturnValue(mockPublisher as Publisher);
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
      await actions.toggleShareScreen();
    });

    const [state] = result.current;
    expect(state.isSharingScreen).toBe(false);
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'monitor' }) }],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    const [state] = result.current;
    expect(state.isEntireScreen).toBe(true);
    expect(state.screenshareVideoElement).toBe(mockVideoEl);
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'window' }) }],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    const [state] = result.current;
    expect(state.isEntireScreen).toBe(false);
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
    });

    const mockVideoEl = {
      srcObject: {
        getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'monitor' }) }],
      },
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoEl });
    });

    const [stateAfterVideo] = result.current;
    expect(stateAfterVideo.screenshareVideoElement).toBe(mockVideoEl);
    expect(stateAfterVideo.isEntireScreen).toBe(true);

    act(() => {
      handlers['streamDestroyed']();
    });

    const [stateAfterDestroyed] = result.current;
    expect(stateAfterDestroyed.isEntireScreen).toBe(false);
    expect(stateAfterDestroyed.isSharingScreen).toBe(false);
    expect(stateAfterDestroyed.screenshareVideoElement).toBe(undefined);
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
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

    const [state] = result.current;
    expect(state.isEntireScreen).toBe(true);
  });

  it('does not initialize publisher if vonageVideoClient is null', async () => {
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
      const [, actions] = result.current;
      await actions.toggleShareScreen();
    });

    expect(initPublisher).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  runtimeContext?: ProviderOptions['RuntimeContext'];
  screenShareContext?: ProviderOptions['ScreenShareContext'];
};

function render({
  userContext,
  sessionContext,
  runtimeContext,
  screenShareContext,
}: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.runtime, providers.user, providers.session, providers.screenShare],
    {
      sessionContext,
      userContext,
      runtimeContext,
      screenShareContext,
    }
  );

  return {
    ...context,
    ...renderHookBase(() => screenShare$.use(), { wrapper }),
  };
}
