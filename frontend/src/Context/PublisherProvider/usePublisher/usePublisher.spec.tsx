import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import {
  initPublisher,
  Publisher,
  Stream,
  hasMediaProcessorSupport,
} from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import usePublisher from './usePublisher';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import composeProviders from '@web/helpers/composeProviders';
import { StrictMode } from 'react';
import { setupWindowNavigatorMock, makeMediaDeviceInfos } from '@web-test/fixtures';
import mediaDevices$ from '@core/stores/mediaDevices';

vi.mock('@vonage/client-sdk-video');

const mockStream = {
  streamId: 'stream-id',
  name: 'Jane Doe',
} as unknown as Stream;

const someDevices = makeMediaDeviceInfos();

// Mock functions for session context
const mockedSessionPublish = vi.fn();
const mockedSessionUnpublish = vi.fn();

describe('usePublisher', () => {
  const destroySpy = vi.fn();
  const publishAudioSpy = vi.fn();
  const publishVideoSpy = vi.fn();
  let mockPublisher: Publisher;

  const mockedInitPublisher = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
    setupWindowNavigatorMock({
      mediaDevices: {
        enumerateDevices: Promise.resolve(someDevices),
      },
    });

    // Create fresh publisher for each test
    mockPublisher = Object.assign(new EventEmitter(), {
      destroy: destroySpy,
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      publishAudio: publishAudioSpy,
      publishVideo: publishVideoSpy,
      setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
      setPreferredResolution: vi.fn().mockResolvedValue(undefined),
      setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
      setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
    }) as unknown as Publisher;

    vi.mocked(initPublisher).mockImplementation(mockedInitPublisher);
    vi.mocked(hasMediaProcessorSupport).mockImplementation(vi.fn().mockReturnValue(true));

    // Initialize mediaDevices$ store with devices
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: someDevices,
    }));
  });

  describe('initializeLocalPublisher', () => {
    it('should initialize publisher and update state when access is allowed', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      expect(result.current.publisher).toBeNull();

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      // Publisher should be set after accessAllowed event
      await waitFor(() => {
        expect(result.current.publisher).toBe(mockPublisher);
        expect(result.current.publishingError).toBeNull();
      });
    });

    it('should prevent double initialization', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.publisher).toBe(mockPublisher);
      });

      // Try to initialize again
      act(() => {
        result.current.initializeLocalPublisher({});
      });

      // Should only call initPublisher once
      expect(mockedInitPublisher).toHaveBeenCalledOnce();
    });

    it('should handle initialization errors gracefully', async () => {
      vi.mocked(initPublisher).mockImplementation(() => {
        throw new Error('Failed to access media devices');
      });

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      await waitFor(() => {
        expect(result.current.publisher).toBeNull();
      });
    });
  });

  describe('toggleAudio', () => {
    it('should toggle audio on and off', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher(), {
        userContext: {
          value: {
            defaultSettings: {
              publishAudio: true,
              publishVideo: false,
              name: '',
              noiseSuppression: true,
              publishCaptions: false,
            },
          },
        },
      });

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.isAudioEnabled).toBe(true);
      });

      // Toggle audio off
      act(() => {
        result.current.toggleAudio();
      });

      expect(publishAudioSpy).toHaveBeenCalledWith(false);
      expect(result.current.isAudioEnabled).toBe(false);

      // Toggle audio back on
      act(() => {
        result.current.toggleAudio();
      });

      expect(publishAudioSpy).toHaveBeenCalledWith(true);
      expect(result.current.isAudioEnabled).toBe(true);
    });

    it('should clear force mute flag when toggling audio', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.publisher).toBe(mockPublisher);
      });

      // Simulate force mute
      act(() => {
        // @ts-expect-error We simulate a force mute event.
        mockPublisher.emit('muteForced');
      });

      await waitFor(() => {
        expect(result.current.isForceMuted).toBe(true);
        expect(result.current.isAudioEnabled).toBe(false);
      });

      // User toggles audio manually
      act(() => {
        result.current.toggleAudio();
      });

      expect(result.current.isForceMuted).toBe(false);
    });

    it('should not crash if publisher is not initialized', () => {
      const { result } = renderHook(() => usePublisher());

      expect(result.current.publisher).toBeNull();

      // Should not throw
      act(() => {
        result.current.toggleAudio();
      });

      expect(publishAudioSpy).not.toHaveBeenCalled();
    });
  });

  describe('toggleVideo', () => {
    it('should toggle video on and off', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher(), {
        userContext: {
          value: {
            defaultSettings: {
              publishAudio: false,
              publishVideo: true,
              name: '',
              noiseSuppression: true,
              publishCaptions: false,
            },
          },
        },
      });

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.isVideoEnabled).toBe(true);
      });

      // Toggle video off
      act(() => {
        result.current.toggleVideo();
      });

      expect(publishVideoSpy).toHaveBeenCalledWith(false);
      expect(result.current.isVideoEnabled).toBe(false);

      // Toggle video back on
      act(() => {
        result.current.toggleVideo();
      });

      expect(publishVideoSpy).toHaveBeenCalledWith(true);
      expect(result.current.isVideoEnabled).toBe(true);
    });

    it('should not crash if publisher is not initialized', () => {
      const { result } = renderHook(() => usePublisher());

      expect(result.current.publisher).toBeNull();

      // Should not throw
      act(() => {
        result.current.toggleVideo();
      });

      expect(publishVideoSpy).not.toHaveBeenCalled();
    });
  });

  describe('unpublish', () => {
    it('should unpublish and clear publisher reference', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.publisher).toBe(mockPublisher);
      });

      await act(async () => {
        await result.current.publish();
      });

      act(() => {
        result.current.unpublish();
      });

      expect(mockedSessionUnpublish).toHaveBeenCalledWith(mockPublisher);
    });
  });

  describe('publish', () => {
    it('should set isPublishing state when stream is created', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.isPublishing).toBe(false);

      await act(async () => {
        await result.current.publish();
        // @ts-expect-error We simulate the publisher stream being created.
        mockPublisher.emit('streamCreated', { stream: mockStream });
      });

      await waitFor(() => {
        expect(result.current.isPublishing).toBe(true);
        expect(result.current.stream).toBe(mockStream);
      });
    });

    it('should only publish to session once (idempotency)', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate the publisher stream being created.
        mockPublisher.emit('streamCreated', { stream: mockStream });
      });
      expect(initPublisher).toHaveBeenCalledOnce();

      expect(result.current.isPublishing).toEqual(true);
      act(() => {
        // Normally this is async, but it was being called twice in a useEffect hook.
        // To accurately test this, let's call it without await.
        void result.current.publish();
      });
      await act(async () => {
        await result.current.publish();
      });

      expect(mockedSessionPublish).toHaveBeenCalledOnce();
    });

    it('should retry publishing 3 times before setting error state', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      mockedSessionPublish.mockImplementation((_, callback) => {
        callback(new Error('Mocked error'));
      });
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.publishingError).toBeNull();

      await act(async () => {
        await result.current.publish();
      });

      const publishingBlockedError = {
        header: 'Difficulties joining room',
        caption:
          "We're having trouble connecting you with others in the meeting room. Please check your network and try again.",
      };
      expect(result.current.publishingError).toEqual(publishingBlockedError);
      expect(mockedSessionPublish).toHaveBeenCalledTimes(3);
    });

    it('should not publish if publisher is not initialized', async () => {
      const { result } = renderHook(() => usePublisher());

      expect(result.current.publisher).toBeNull();

      await act(async () => {
        await result.current.publish();
      });

      expect(mockedSessionPublish).not.toHaveBeenCalled();
    });
  });

  describe('device access events', () => {
    it('keeps the user in the call and marks the camera as blocked when camera access is denied', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.publishingError).toBeNull();

      act(() => {
        // @ts-expect-error We simulate user denying camera permissions in a browser.
        mockPublisher.emit('accessDenied', {
          message: 'Camera permission denied during the call',
        });
      });

      await waitFor(() => {
        // Google Meet style: a device denial does NOT eject the user (no publishingError → no
        // goodbye redirect). It surfaces the blocked device so the toolbar can badge it, and
        // tears down the dead publisher so it can be re-created on re-grant.
        expect(result.current.publishingError).toBeNull();
        expect(result.current.deniedDevices).toEqual({ microphone: false, camera: true });
        expect(destroySpy).toHaveBeenCalled();
        expect(result.current.publisher).toBeNull();
      });
    });

    it('keeps the user in the call and marks the microphone as blocked when microphone access is denied', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.publishingError).toBeNull();

      act(() => {
        // @ts-expect-error We simulate user denying microphone permissions in a browser.
        mockPublisher.emit('accessDenied', {
          // The SDK's real mid-call revocation message is lowercase — the device match
          // must be case-insensitive for this to be attributed to the microphone.
          message: 'microphone permission denied during the call',
        });
      });

      await waitFor(() => {
        // A microphone denial must name the microphone, not the camera.
        expect(result.current.publishingError).toBeNull();
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
        expect(destroySpy).toHaveBeenCalled();
        expect(result.current.publisher).toBeNull();
      });
    });

    it('badges both devices when both are blocked even though the SDK event names only one', async () => {
      // Joining with camera and mic both revoked: the SDK fires a single accessDenied (here,
      // camera). Querying both permissions catches the mic too, so both get badged/watched.
      const querySpy = vi
        .spyOn(navigator.permissions, 'query')
        .mockResolvedValue({ state: 'denied', onchange: null } as unknown as PermissionStatus);

      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      act(() => {
        // @ts-expect-error We simulate the browser denying access mid-call.
        mockPublisher.emit('accessDenied', {
          message: 'camera permission denied during the call',
        });
      });

      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: true });
      });

      querySpy.mockRestore();
    });

    it('does not badge a still-granted camera when the SDK misattributes a mic-only denial', async () => {
      // The event message defaults getDeniedDevice() to 'camera', but only the mic is truly
      // blocked. The authoritative permission query must correct that so the granted camera is
      // never badged (which would also block its re-acquisition).
      const querySpy = vi
        .spyOn(navigator.permissions, 'query')
        .mockImplementation(({ name }: { name: string }) =>
          Promise.resolve({
            state: name === 'microphone' ? 'denied' : 'granted',
            onchange: null,
          } as unknown as PermissionStatus)
        );

      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      act(() => {
        // @ts-expect-error Mis-attributed denial: message does not start with "microphone".
        mockPublisher.emit('accessDenied', { message: 'OT_USER_MEDIA_ACCESS_DENIED' });
      });

      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
      });

      querySpy.mockRestore();
    });

    it('rebuilds the publisher when a blocked device is re-granted so the device can be re-acquired', async () => {
      // The reduced publisher has no track for the previously-blocked device (the SDK acquires
      // tracks at init), so on re-grant it must be torn down and re-created with the full request.
      let microphoneStatus: { state: string; onchange: null | (() => void) } | undefined;
      const querySpy = vi
        .spyOn(navigator.permissions, 'query')
        .mockImplementation(({ name }: { name: string }) => {
          const status = {
            state: name === 'microphone' ? 'denied' : 'granted',
            onchange: null as null | (() => void),
          };
          if (name === 'microphone') {
            microphoneStatus = status;
          }
          return Promise.resolve(status as unknown as PermissionStatus);
        });

      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });
      act(() => {
        // @ts-expect-error Simulate the browser denying the microphone mid-call.
        mockPublisher.emit('accessDenied', {
          message: 'microphone permission denied during the call',
        });
      });

      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
        expect(typeof microphoneStatus?.onchange).toBe('function');
      });

      // Stand in for useMeetingRoom re-initializing the reduced (video-only) publisher.
      act(() => {
        result.current.initializeLocalPublisher({});
      });
      destroySpy.mockClear();

      // Re-grant the microphone.
      act(() => {
        microphoneStatus!.state = 'granted';
        microphoneStatus!.onchange?.();
      });

      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: false, camera: false });
        // The reduced publisher is torn down so it can be rebuilt with audio + video.
        expect(destroySpy).toHaveBeenCalled();
        expect(result.current.publisher).toBeNull();
      });

      querySpy.mockRestore();
    });

    it('should not set publishingError when receiving an accessAllowed event', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});

        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.publishingError).toBeNull();
        expect(result.current.publisher).toBe(mockPublisher);
      });
    });
  });

  describe('force mute handling', () => {
    it('should mute audio and set force mute flag when muteForced event is received', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher(), {
        userContext: {
          value: {
            defaultSettings: {
              publishAudio: true,
              publishVideo: false,
              name: '',
              noiseSuppression: true,
              publishCaptions: false,
            },
          },
        },
      });

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
        mockPublisher.emit('accessAllowed');
      });

      await waitFor(() => {
        expect(result.current.isAudioEnabled).toBe(true);
        expect(result.current.isForceMuted).toBe(false);
      });

      act(() => {
        // @ts-expect-error We simulate a force mute event.
        mockPublisher.emit('muteForced');
      });

      await waitFor(() => {
        expect(result.current.isForceMuted).toBe(true);
        expect(result.current.isAudioEnabled).toBe(false);
        expect(publishAudioSpy).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('publisher lifecycle', () => {
    it('should update stream state when streamCreated event is fired', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isPublishing).toBe(false);

      act(() => {
        // @ts-expect-error We simulate the publisher stream being created.
        mockPublisher.emit('streamCreated', { stream: mockStream });
      });

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
        expect(result.current.isPublishing).toBe(true);
      });
    });

    it('should clear stream state when streamDestroyed event is fired', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate the publisher stream being created.
        mockPublisher.emit('streamCreated', { stream: mockStream });
      });

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
        expect(result.current.isPublishing).toBe(true);
      });

      act(() => {
        // @ts-expect-error We simulate the stream being destroyed.
        mockPublisher.emit('streamDestroyed');
      });

      await waitFor(() => {
        expect(result.current.stream).toBeNull();
        expect(result.current.isPublishing).toBe(false);
      });
    });

    it('should set video element when videoElementCreated event is fired', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.publisherVideoElement).toBeNull();

      const mockVideoElement = document.createElement('video');

      act(() => {
        // @ts-expect-error We simulate video element creation.
        mockPublisher.emit('videoElementCreated', { element: mockVideoElement });
      });

      await waitFor(() => {
        expect(result.current.publisherVideoElement).toBe(mockVideoElement);
      });
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { userContext, sessionContext }: RenderOptions = {}
) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext: {
        ...userContext,
        value: {
          defaultSettings: {
            publishAudio: false,
            publishVideo: false,
            name: '',
            noiseSuppression: true,
            publishCaptions: false,
            ...userContext?.value?.defaultSettings,
          },
        },
      },
      sessionContext: {
        ...sessionContext,
        __interceptor: (ctx) => {
          if (ctx) {
            ctx.publish = mockedSessionPublish;
            ctx.unpublish = mockedSessionUnpublish;
            ctx.connected = true;
          }
          sessionContext?.__interceptor?.(ctx);
        },
      },
      runtimeContext: undefined,
    }
  );

  const wrapper = composeProviders(StrictMode, SuspenseBoundary, MainWrapper);
  const result = renderHookBase(render, { wrapper });

  return {
    ...context,
    ...result,
  };
}
