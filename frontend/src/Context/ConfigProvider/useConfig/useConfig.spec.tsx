import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useConfig, { AppConfig } from './useConfig';

describe('useConfig', () => {
  let nativeFetch: typeof global.fetch;
  const defaultConfig: AppConfig = {
    videoSettings: {
      allowCameraControl: true,
      defaultResolution: '1280x720',
      allowVideoOnJoin: true,
      allowBackgroundEffects: true,
    },
    audioSettings: {
      allowAdvancedNoiseSuppression: true,
      allowAudioOnJoin: true,
      allowMicrophoneControl: true,
    },
    waitingRoomSettings: {
      allowDeviceSelection: true,
    },
    meetingRoomSettings: {
      allowDeviceSelection: true,
      defaultLayoutMode: 'active-speaker',
      showParticipantList: true,
      showChatButton: true,
      showScreenShareButton: true,
      showArchiveButton: true,
      showCaptionsButton: true,
      showEmojiButton: true,
    },
  };

  beforeAll(() => {
    nativeFetch = global.fetch;
  });

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({}),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = nativeFetch;
  });

  it('returns the default config when no config.json is loaded', async () => {
    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toEqual(defaultConfig);
    });
  });

  it('merges config.json values if loaded (mocked fetch)', async () => {
    // All values in this config should override the defaultConfig
    const mockConfig: AppConfig = {
      videoSettings: {
        allowCameraControl: false,
        defaultResolution: '640x480',
        allowVideoOnJoin: false,
        allowBackgroundEffects: false,
      },
      audioSettings: {
        allowAdvancedNoiseSuppression: false,
        allowAudioOnJoin: false,
        allowMicrophoneControl: false,
      },
      waitingRoomSettings: {
        allowDeviceSelection: false,
      },
      meetingRoomSettings: {
        allowDeviceSelection: false,
        defaultLayoutMode: 'grid',
        showParticipantList: false,
        showChatButton: false,
        showScreenShareButton: false,
        showArchiveButton: false,
        showCaptionsButton: false,
        showEmojiButton: false,
      },
    };
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockConfig,
    });
    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toMatchObject(mockConfig);
    });
  });

  it('falls back to defaultConfig if fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('mocking a failure to fetch'));
    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toEqual(defaultConfig);
    });
  });
});
