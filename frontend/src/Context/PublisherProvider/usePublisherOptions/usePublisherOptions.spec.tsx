import { describe, expect, it, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import OT from '@vonage/client-sdk-video';
import localStorageMock from '@utils/mockData/localStorageMock';
import mediaDevices$ from '@core/stores/devices';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import makeMediaDeviceInfos from '@web-test/fixtures/makeMediaDeviceInfos';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import usePublisherOptions from './usePublisherOptions';
import { env } from '../../../env';

const devices = makeMediaDeviceInfos();
const audioDevice = devices.find((d) => d.kind === 'audioinput')!;
const videoDevice = devices.find((d) => d.kind === 'videoinput')!;

describe('usePublisherOptions', () => {
  beforeEach(() => {
    // Setup window.navigator mock first
    setupWindowNavigatorMock({
      mediaDevices: {
        enumerateDevices: Promise.resolve([]),
      },
    });

    env.partialUpdate({
      ALLOW_VIDEO_ON_JOIN: true,
      ALLOW_AUDIO_ON_JOIN: true,
      DEFAULT_RESOLUTION: '1280x720',
    });

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Reset mediaDevices$ store to initial state
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: [],
      audioinput: undefined,
      videoinput: undefined,
      audiooutput: undefined,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    advancedSettings$.reset();
  });

  afterAll(() => {
    window.localStorage.clear();
  });

  it('should use default settings', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(true);
    const { result } = renderHook(() =>
      usePublisherOptions({ isAudioEnabled: false, isVideoEnabled: false })
    );
    await waitFor(() => {
      expect(result.current).toEqual({
        frameRate: 30,
        resolution: env.PUBLISHER_MAX_RESOLUTION,
        preferredVideoCodecs: 'automatic',
        publishAudio: false,
        publishVideo: false,
        insertDefaultUI: false,
        audioFallback: {
          publisher: false,
          subscriber: false,
        },
        audioFilter: {
          type: 'advancedNoiseSuppression',
        },
        enableDtx: true,
        videoFilter: undefined,
        name: '',
        initials: '',
        publishCaptions: true,
      });
    });
  });

  it('should not have advanced noise suppression if not supported by browser', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(false);
    const { result } = renderHook(() =>
      usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true })
    );

    await waitFor(() => {
      expect(result.current?.audioFilter).toBe(undefined);
    });
  });

  it('should use custom settings', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(true);

    const devices = makeMediaDeviceInfos();
    vi.mocked(navigator.mediaDevices.enumerateDevices).mockResolvedValue(devices);

    // Update mediaDevices$ store with devices and selections
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
      audioinput: audioDevice.deviceId,
      videoinput: videoDevice.deviceId,
    }));

    const { result } = renderHook(
      () => usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true }),
      {
        userContext: {
          value: {
            defaultSettings: {
              publishAudio: true,
              publishVideo: true,
              name: 'Foo Bar',
              backgroundFilter: {
                type: 'backgroundBlur',
                blurStrength: 'high',
              },
              noiseSuppression: false,
              publishCaptions: true,
            },
          },
        },
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        frameRate: 30,
        resolution: env.PUBLISHER_MAX_RESOLUTION,
        preferredVideoCodecs: 'automatic',
        publishAudio: true,
        publishVideo: true,
        audioSource: audioDevice.deviceId,
        videoSource: videoDevice.deviceId,
        insertDefaultUI: false,
        audioFallback: {
          publisher: false,
          subscriber: false,
        },
        audioFilter: undefined,
        enableDtx: true,
        videoFilter: {
          type: 'backgroundBlur',
          blurStrength: 'high',
        },
        name: 'Foo Bar',
        initials: 'FB',
        publishCaptions: true,
      });
    });
  });

  describe('configurable features', () => {
    it('should disable audio publishing when allowAudioOnJoin is false', async () => {
      env.partialUpdate({
        ALLOW_AUDIO_ON_JOIN: false,
      });

      const { result } = renderHook(() =>
        usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true })
      );

      await waitFor(() => {
        expect(result.current?.publishAudio).toBe(false);
      });
    });

    it('should disable video publishing when allowVideoOnJoin is false', async () => {
      env.partialUpdate({
        ALLOW_VIDEO_ON_JOIN: false,
      });

      const { result } = renderHook(() =>
        usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true })
      );

      await waitFor(() => {
        expect(result.current?.publishVideo).toBe(false);
      });
    });

    it('should always use max resolution for publisher initialization', async () => {
      const { result } = renderHook(
        () => usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true }),
        { dialogState: { resolution: '1280x720' } }
      );

      await waitFor(() => {
        expect(result.current?.resolution).toBe(env.PUBLISHER_MAX_RESOLUTION);
      });
    });

    it('should configure opus dtx from advanced settings context', async () => {
      const { result } = renderHook(
        () => usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true }),
        { dialogState: { enableDtx: false } }
      );

      await waitFor(() => {
        expect(result.current?.enableDtx).toBe(false);
      });
    });

    it('should apply publisher and subscriber audio fallback toggles from advanced settings', async () => {
      const { result } = renderHook(
        () => usePublisherOptions({ isAudioEnabled: true, isVideoEnabled: true }),
        {
          dialogState: {
            publisherAudioFallbackEnabled: true,
            subscriberAudioFallbackEnabled: true,
          },
        }
      );

      await waitFor(() => {
        expect(result.current?.audioFallback).toEqual({
          publisher: true,
          subscriber: true,
        });
      });
    });
  });

  it('should disable audio and video based on isAudioEnabled and isVideoEnabled params', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(true);

    const { result } = renderHook(
      () => usePublisherOptions({ isAudioEnabled: false, isVideoEnabled: true }),
      {
        userContext: {
          value: {
            defaultSettings: {
              publishAudio: true,
              publishVideo: true,
              name: 'Foo Bar',
              backgroundFilter: {
                type: 'backgroundBlur',
                blurStrength: 'high',
              },
              noiseSuppression: false,
              publishCaptions: true,
            },
          },
        },
      }
    );

    await waitFor(() => {
      expect(result.current?.publishAudio).toBe(false);
      expect(result.current?.publishVideo).toBe(true);
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  dialogState?: Partial<advancedSettings>;
};

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { userContext, dialogState }: RenderOptions = {}
) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  const { wrapper, ...context } = makeTestProvider([providers.user], {
    userContext: {
      value: {
        ...userContext?.value,
        defaultSettings: {
          publishAudio: false,
          publishVideo: false,
          name: '',
          noiseSuppression: true,
          publishCaptions: true,
          ...userContext?.value?.defaultSettings,
        },
      },
      ...userContext,
    },
  });

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
