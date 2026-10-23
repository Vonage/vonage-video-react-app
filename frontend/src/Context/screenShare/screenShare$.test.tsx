import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook as renderHookBase, act } from '@testing-library/react';
import { Publisher, initPublisher } from '@vonage/client-sdk-video';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import EventEmitter from 'events';
import type VonageVideoClient from '../../utils/VonageVideoClient';
import { type UserContextType } from '../../Context/user';
import screenShare$ from './screenShare$';
import advancedSettings$ from '@Context/AdvancedSettings';
import { AdvancedSettingsScreenShareSurface } from '@components/AdvancedSettingsDialog/schemas';
import { Resolution } from '@common/types';
import { notifications$ } from '@core/stores';
import { frontendLogger } from '../../logger';

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
    advancedSettings$.reset();
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
        preferredVideoCodecs: 'automatic',
        scalableScreenshare: false,
        name: 'TestUser',
        constraints: { video: { displaySurface: 'monitor' } },
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

  it('applies stored video constraints when screen sharing starts', async () => {
    mockPublisher = {
      ...mockPublisher,
      getVideoSource: vi.fn(() => ({ deviceId: null, type: null, track: {} as MediaStreamTrack })),
      setVideoBitratePreset: vi.fn(),
    };
    vi.mocked(initPublisher).mockReturnValue(mockPublisher as Publisher);
    advancedSettings$.actions.setScreenShareFrameRate(7);
    advancedSettings$.actions.setScreenShareResolution(Resolution.HD_LANDSCAPE);
    advancedSettings$.actions.setScreenShareBitrateMode('bw_saver');

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
      expect.objectContaining({
        frameRate: 7,
        resolution: '1280x720',
      }),
      expect.any(Function)
    );
    expect(mockPublisher.setVideoBitratePreset).toHaveBeenCalledWith('bw_saver');
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
    expect(stateAfterDestroyed.screenshareVideoElement).toBeUndefined();
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

  it('passes undefined constraints when screenShareSurface is default', async () => {
    advancedSettings$.actions.setScreenShareSurface(AdvancedSettingsScreenShareSurface.default);

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
      expect.objectContaining({
        constraints: undefined,
      }),
      expect.any(Function)
    );
  });

  it('resets screen share state and does not throw when publish rejects', async () => {
    mockPublish.mockRejectedValueOnce(new Error('Publishing failed'));
    const pushSpy = vi.spyOn(notifications$.actions, 'push');

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
      await expect(actions.toggleShareScreen()).resolves.toBeUndefined();
    });

    const [state] = result.current;
    expect(state.isSharingScreen).toBe(false);
    expect(state.publisher).toBeNull();
    expect(mockPublisher.destroy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: expect.stringContaining('Publishing failed'),
      })
    );
  });

  it('reports the error and surfaces a notification when initPublisher fails', async () => {
    const initPublisherError = { name: 'OT_ERROR', message: 'Failed to init' };
    vi.mocked(initPublisher).mockImplementation((_targetElement, _properties, callback) => {
      callback?.(initPublisherError);
      return mockPublisher as Publisher;
    });
    const reportErrorSpy = vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
    const pushSpy = vi.spyOn(notifications$.actions, 'push');

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

    expect(reportErrorSpy).toHaveBeenCalledWith(
      initPublisherError,
      expect.objectContaining({ eventSource: 'screenShare$.toggleShareScreen.initPublisher' })
    );
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: expect.stringContaining('Failed to init'),
      })
    );

    const [state] = result.current;
    expect(state.isSharingScreen).toBe(false);
  });

  it('passes browser displaySurface constraint when screenShareSurface is browser', async () => {
    advancedSettings$.actions.setScreenShareSurface(AdvancedSettingsScreenShareSurface.browser);

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
      expect.objectContaining({
        constraints: { video: { displaySurface: 'browser' } },
      }),
      expect.any(Function)
    );
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
