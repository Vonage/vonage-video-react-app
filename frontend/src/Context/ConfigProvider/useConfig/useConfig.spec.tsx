import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useConfig, { AppConfig } from './useConfig';

describe('useConfig', () => {
  let nativeFetch: typeof global.fetch;
  const defaultConfig: AppConfig = {
    videoSettings: {
      enableDisableCapableCamera: true,
      resolution: '1280x720',
      videoOnJoin: true,
      backgroundEffects: true,
    },
    audioSettings: {
      advancedNoiseSuppression: true,
      audioOnJoin: true,
      enableDisableCapableMicrophone: true,
    },
    waitingRoomSettings: {
      allowDeviceSelection: true,
    },
    meetingRoomSettings: {
      defaultLayoutMode: 'active-speaker',
      showParticipantList: true,
      showChat: true,
      showScreenShareButton: true,
      showArchiveButton: true,
      showCaptionsButton: true,
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
    const mockConfig: AppConfig = {
      videoSettings: {
        enableDisableCapableCamera: false,
        resolution: '640x480',
        videoOnJoin: false,
        backgroundEffects: false,
      },
      audioSettings: {
        advancedNoiseSuppression: false,
        audioOnJoin: false,
        enableDisableCapableMicrophone: false,
      },
      waitingRoomSettings: {
        allowDeviceSelection: false,
      },
      meetingRoomSettings: {
        defaultLayoutMode: 'grid',
        showParticipantList: false,
        showChat: false,
        showScreenShareButton: false,
        showArchiveButton: false,
        showCaptionsButton: false,
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
