import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useConfig, { AppConfig } from './useConfig';

describe('useConfig', () => {
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
      allowTestNetwork: true,
    },
    meetingRoomSettings: {
      allowArchiving: true,
      allowCaptions: true,
      allowChat: true,
      allowDeviceSelection: true,
      allowEmojis: true,
      allowScreenShare: true,
      defaultLayoutMode: 'active-speaker',
      showParticipantList: true,
    },
  };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
    vi.spyOn(console, 'info').mockImplementation(vi.fn());
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
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
        allowTestNetwork: false,
      },
      meetingRoomSettings: {
        allowArchiving: false,
        allowCaptions: false,
        allowChat: false,
        allowDeviceSelection: false,
        allowEmojis: false,
        allowScreenShare: false,
        defaultLayoutMode: 'grid',
        showParticipantList: false,
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => mockConfig,
      headers: {
        get: () => 'application/json',
      },
    } as unknown as Response);

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toMatchObject(mockConfig);
    });
  });

  it('falls back to defaultConfig if fetch fails', async () => {
    const mockFetchError = new Error('mocking a failure to fetch');

    vi.spyOn(global, 'fetch').mockRejectedValue(mockFetchError as unknown as Response);

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toEqual(defaultConfig);
    });
    expect(console.error).toHaveBeenCalledWith('Error loading config:', expect.any(Error));
  });

  it('falls back to defaultConfig if no config.json is found', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: () => 'text/html',
      },
    } as unknown as Response);

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toEqual(defaultConfig);
    });
    expect(console.info).toHaveBeenCalledWith('No valid JSON found, using default config');
    expect(console.error).not.toHaveBeenCalled();
  });
});
