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
  let mockVideoTrack: MediaStreamTrack;
  let originalMediaDevices: MediaDevices | undefined;
  let handlers: Record<string, (...args: unknown[]) => void>;
  const mockPublish = vi.fn((_publisher: Publisher) => Promise.resolve());
  const mockUnpublish = vi.fn((_publisher: Publisher) => undefined);
  const mockGetDisplayMedia = vi.fn(() =>
    Promise.resolve({ getVideoTracks: () => [] } as unknown as MediaStream)
  );
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

    mockVideoTrack = {
      kind: 'video',
      stop: vi.fn(),
      getSettings: vi.fn().mockReturnValue({}),
    } as unknown as MediaStreamTrack;

    mockGetDisplayMedia.mockResolvedValue({
      getVideoTracks: () => [mockVideoTrack],
    } as unknown as MediaStream);

    // JSDOM does not provide navigator.mediaDevices; define the whole property.
    originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getDisplayMedia: mockGetDisplayMedia },
      writable: true,
      configurable: true,
    });

    vi.mocked(initPublisher).mockReturnValue(mockPublisher as Publisher);
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });

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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
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
        videoSource: mockVideoTrack,
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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
          }
        },
      },
    });

    await act(async () => {
      // toggling screen share on
      await result.current.toggleShareScreen();
    });

    act(() => {
      handlers['streamCreated']();
    });

    await act(async () => {
      // toggling screen share off
      await result.current.toggleShareScreen();
    });

    expect(result.current.isSharingScreen).toBe(false);
    expect(mockUnpublish).toHaveBeenCalledWith(mockPublisher);
    expect(mockPublisher.destroy).toHaveBeenCalledTimes(1);
    expect(mockVonageVideoClient.off).toHaveBeenCalledWith(
      'screenshareStreamCreated',
      expect.any(Function)
    );
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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).not.toHaveBeenCalled();
  });

  it('handles canceled screen share prompt without throwing', async () => {
    expect.assertions(3);

    // Simulate the user cancelling the browser screen-picker before the SDK is involved.
    mockGetDisplayMedia.mockRejectedValueOnce(
      new DOMException('Permission denied', 'NotAllowedError')
    );

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
            context.publish = async (publisher) => mockPublish(publisher);
            context.unpublish = (publisher) => {
              mockUnpublish(publisher);
            };
          }
        },
      },
    });

    await act(async () => {
      await expect(result.current.toggleShareScreen()).resolves.toBeUndefined();
    });

    // initPublisher must never be called – the SDK should not be involved in the cancel path.
    expect(initPublisher).not.toHaveBeenCalled();
    expect(result.current.isSharingScreen).toBe(false);
  });

  it('does not initialize publisher when getDisplayMedia returns no video tracks', async () => {
    mockGetDisplayMedia.mockResolvedValueOnce({
      getVideoTracks: () => [],
    } as unknown as MediaStream);

    const { result } = render(
      makeRenderOptions({ mockVonageVideoClient, mockPublish, mockUnpublish })
    );

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).not.toHaveBeenCalled();
    expect(mockPublish).not.toHaveBeenCalled();
    expect(result.current.isSharingScreen).toBe(false);
  });

  it('stops the track and resets state when initPublisher reports an error', async () => {
    expect.assertions(4);

    const { result } = render(
      makeRenderOptions({ mockVonageVideoClient, mockPublish, mockUnpublish })
    );

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    const publisherErrorCallback = vi.mocked(initPublisher).mock.calls[0]?.[2];

    act(() => {
      publisherErrorCallback?.(new Error('publisher failed'));
    });

    expect(publisherErrorCallback).toEqual(expect.any(Function));
    expect(mockVideoTrack.stop).toHaveBeenCalledTimes(1);
    expect(result.current.isSharingScreen).toBe(false);
    expect(result.current.screensharingPublisher).toBe(null);
  });

  it('destroys the publisher and stops the track when publish fails', async () => {
    expect.assertions(6);

    mockPublish.mockRejectedValueOnce(new Error('publish failed'));

    const { result } = render(
      makeRenderOptions({ mockVonageVideoClient, mockPublish, mockUnpublish })
    );

    await act(async () => {
      await expect(result.current.toggleShareScreen()).resolves.toBeUndefined();
    });

    expect(mockPublish).toHaveBeenCalledWith(mockPublisher);
    expect(mockVideoTrack.stop).toHaveBeenCalledTimes(1);
    expect(mockPublisher.destroy).toHaveBeenCalledTimes(1);
    expect(result.current.isSharingScreen).toBe(false);
    expect(result.current.screensharingPublisher).toBe(null);
  });

  it('unpublishes the current share when another screenshare stream is created', async () => {
    const { result } = render(
      makeRenderOptions({ mockVonageVideoClient, mockPublish, mockUnpublish })
    );

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    act(() => {
      handlers['streamCreated']();
    });

    const streamCreatedHandlerCall = vi
      .mocked(mockVonageVideoClient.on!)
      .mock.calls.find(([eventName]) => eventName === 'screenshareStreamCreated');
    const streamCreatedHandler = streamCreatedHandlerCall?.[1] as (() => void) | undefined;

    act(() => {
      streamCreatedHandler?.();
    });

    expect(streamCreatedHandler).toEqual(expect.any(Function));
    expect(mockUnpublish).toHaveBeenCalledWith(mockPublisher);
    expect(result.current.isSharingScreen).toBe(false);
  });

  it('keeps entire-screen detection false when video metadata is unavailable', async () => {
    const { result } = render(
      makeRenderOptions({ mockVonageVideoClient, mockPublish, mockUnpublish })
    );

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    const mockVideoElement = {
      srcObject: null,
    } as unknown as HTMLVideoElement;

    act(() => {
      handlers['videoElementCreated']({ element: mockVideoElement });
    });

    expect(result.current.screenshareVideoElement).toBe(mockVideoElement);
    expect(result.current.isEntireScreen).toBe(false);
  });

  it('stops the track and clears state when media sharing stops', async () => {
    const { result } = render(
      makeRenderOptions({ mockVonageVideoClient, mockPublish, mockUnpublish })
    );

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    act(() => {
      handlers['streamCreated']();
      handlers['mediaStopped']();
    });

    expect(mockVideoTrack.stop).toHaveBeenCalledTimes(1);
    expect(mockVonageVideoClient.off).toHaveBeenCalledWith(
      'screenshareStreamCreated',
      expect.any(Function)
    );
    expect(result.current.isSharingScreen).toBe(false);
    expect(result.current.screensharingPublisher).toBe(null);
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

function makeRenderOptions({
  mockVonageVideoClient,
  mockPublish,
  mockUnpublish,
}: {
  mockVonageVideoClient: Partial<VonageVideoClient>;
  mockPublish: (publisher: Publisher) => Promise<void>;
  mockUnpublish: (publisher: Publisher) => void;
}): RenderOptions {
  return {
    userContext: {
      __interceptor: (context: UserContextType | null) => {
        context!.user.defaultSettings.name = 'TestUser';
      },
    },
    sessionContext: {
      __interceptor: (context) => {
        if (context) {
          context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
          context.publish = async (publisher) => mockPublish(publisher);
          context.unpublish = (publisher) => {
            mockUnpublish(publisher);
          };
        }
      },
    },
  };
}
