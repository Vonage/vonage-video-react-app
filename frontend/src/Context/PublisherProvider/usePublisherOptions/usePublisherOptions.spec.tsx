import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import OT from '@vonage/client-sdk-video';
import useUserContext from '@hooks/useUserContext';
import localStorageMock from '@utils/mockData/localStorageMock';
import mediaDevices$ from '@core/stores/devices';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
import makeMediaDeviceInfos from '@common-test/fixtures/makeMediaDeviceInfos';
import usePublisherOptions from './usePublisherOptions';
import { UserContextType } from '../../user';

vi.mock('@hooks/useUserContext.tsx');

const devices = makeMediaDeviceInfos();
const audioDevice = devices.find((d) => d.kind === 'audioinput')!;
const videoDevice = devices.find((d) => d.kind === 'videoinput')!;

const defaultSettings = {
  publishAudio: false,
  publishVideo: false,
  name: '',
  noiseSuppression: true,
  audioSource: undefined,
  videoSource: undefined,
  publishCaptions: true,
};

const customSettings = {
  publishAudio: true,
  publishVideo: true,
  name: 'Foo Bar',
  backgroundFilter: {
    type: 'backgroundBlur',
    blurStrength: 'high',
  },
  noiseSuppression: false,
  audioSource: audioDevice.deviceId,
  videoSource: videoDevice.deviceId,
  publishCaptions: true,
};

const mockUserContextWithDefaultSettings = {
  userContext: {
    defaultSettings,
  },
} as UserContextType;

const mockUserContextWithCustomSettings = {
  userContext: {
    defaultSettings: customSettings,
  },
} as UserContextType;

describe('usePublisherOptions', () => {
  let enumerateDevicesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    enumerateDevicesMock = vi.fn();

    vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockImplementation(
      enumerateDevicesMock as () => Promise<MediaDeviceInfo[]>
    );

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    enumerateDevicesMock.mockResolvedValue([]);

    // Reset mediaDevices$ store to initial state
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: [],
      selection: new Map(),
    }));

    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithDefaultSettings);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    window.localStorage.clear();
  });

  it('should use default settings', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(true);
    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithDefaultSettings);
    const { result } = renderHook(() => usePublisherOptions());
    await waitFor(() => {
      expect(result.current).toEqual({
        resolution: '1280x720',
        publishAudio: false,
        publishVideo: false,
        audioSource: undefined,
        videoSource: undefined,
        insertDefaultUI: false,
        audioFallback: {
          publisherContext: true,
        },
        audioFilter: {
          type: 'advancedNoiseSuppression',
        },
        videoFilter: undefined,
        name: '',
        initials: '',
        publishCaptions: true,
      });
    });
  });

  it('should not have advanced noise suppression if not supported by browser', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(false);
    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithDefaultSettings);
    const { result } = renderHook(() => usePublisherOptions());

    await waitFor(() => {
      expect(result.current?.audioFilter).toBe(undefined);
    });
  });

  it('should use custom settings', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(true);
    const devices = makeMediaDeviceInfos();
    enumerateDevicesMock.mockResolvedValue(devices);

    // Update mediaDevices$ store with devices and selections
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
      selection: new Map([
        ['audioinput', audioDevice],
        ['videoinput', videoDevice],
      ]),
    }));

    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithCustomSettings);
    const { result } = renderHook(() => usePublisherOptions());
    await waitFor(() => {
      expect(result.current).toEqual({
        resolution: '1280x720',
        publishAudio: true,
        publishVideo: true,
        audioSource: audioDevice.deviceId,
        videoSource: videoDevice.deviceId,
        insertDefaultUI: false,
        audioFallback: {
          publisherContext: true,
        },
        audioFilter: undefined,
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
      const { result } = renderHook(() => usePublisherOptions(), {
        appConfigContext: {
          value: {
            audioSettings: {
              allowAudioOnJoin: false,
            },
          },
        },
      });

      await waitFor(() => {
        expect(result.current?.publishAudio).toBe(false);
      });
    });

    it('should disable video publishing when allowVideoOnJoin is false', async () => {
      const { result } = renderHook(() => usePublisherOptions(), {
        appConfigContext: {
          value: {
            audioSettings: {
              allowAudioOnJoin: false,
            },
          },
        },
      });

      await waitFor(() => {
        expect(result.current?.publishVideo).toBe(false);
      });
    });

    it('should configure resolution from config', async () => {
      const { result } = renderHook(() => usePublisherOptions(), {
        appConfigContext: {
          value: {
            videoSettings: {
              defaultResolution: '640x480',
            },
          },
        },
      });

      await waitFor(() => {
        expect(result.current?.resolution).toBe('640x480');
      });
    });
  });

  it('should disable audio and video from storage options', async () => {
    vi.spyOn(OT, 'hasMediaProcessorSupport').mockReturnValue(true);
    setStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED, 'false');
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED, 'true');

    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithCustomSettings);
    const { result } = renderHook(() => usePublisherOptions());
    await waitFor(() => {
      expect(result.current?.publishAudio).toBe(false);
      expect(result.current?.publishVideo).toBe(true);
    });
  });
});

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { appConfigOptions }: AppConfigProviderWrapperOptions = {}
) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper({ appConfigOptions });

  return renderHookBase(render, { wrapper: AppConfigWrapper });
}
