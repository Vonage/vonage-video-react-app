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
  const consoleErrorSpy = vi.spyOn(console, 'error');
  const consoleInfoSpy = vi.spyOn(console, 'info');

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
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockConfig,
      headers: {
        get: () => 'application/json',
      },
    });
    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toMatchObject(mockConfig);
    });
  });

  it('falls back to defaultConfig if fetch fails', async () => {
    const mockFetchError = new Error('mocking a failure to fetch');
    global.fetch = vi.fn().mockRejectedValue(mockFetchError);
    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toEqual(defaultConfig);
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading config:', expect.any(Error));
  });

  it('falls back to defaultConfig if no config.json is found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: () => 'text/html',
      },
    });
    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current).toEqual(defaultConfig);
    });
    expect(consoleInfoSpy).toHaveBeenCalledWith('No valid JSON found, using default config');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
