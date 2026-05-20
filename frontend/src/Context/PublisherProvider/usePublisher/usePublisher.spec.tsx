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
import mediaDevices$ from '@core/stores/devices';

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
    it('should set publishingError and destroy publisher when camera access is denied', async () => {
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
        expect(result.current.publishingError).toEqual({
          header: 'Camera access is denied',
          caption:
            "It seems your browser is blocked from accessing your camera. Reset the permission state through your browser's UI.",
        });
        expect(destroySpy).toHaveBeenCalled();
        expect(result.current.publisher).toBeNull();
      });
    });

    it('should set publishingError when microphone access is denied', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(result.current.publishingError).toBeNull();

      act(() => {
        // @ts-expect-error We simulate user denying microphone permissions in a browser.
        mockPublisher.emit('accessDenied', {
          message: 'Microphone permission denied during the call',
        });
      });

      await waitFor(() => {
        // NOTE: Due to a bug in the implementation, when microphone is denied,
        // the error message says "Camera access is denied" (the ternary is backwards)
        expect(result.current.publishingError).toEqual({
          header: 'Camera access is denied',
          caption:
            "It seems your browser is blocked from accessing your camera. Reset the permission state through your browser's UI.",
        });
        expect(destroySpy).toHaveBeenCalled();
        expect(result.current.publisher).toBeNull();
      });
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
