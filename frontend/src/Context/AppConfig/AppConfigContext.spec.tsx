import { describe, expect, it, vi } from 'vitest';
import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import useAppConfigContext, { AppConfig, AppConfigProvider } from '@Context/AppConfig';
import defaultAppConfig from './helpers/defaultAppConfig';

describe('AppConfigContext', () => {
  it('returns the default config when no config.json is loaded', async () => {
    const { result } = renderHook(() => useAppConfigContext()[0]);

    await waitFor(() => {
      expect(result.current).toEqual(expect.objectContaining(defaultAppConfig));
    });
  });

  it('merges config.json values if loaded (mocked fetch)', async () => {
    expect.assertions(2);

    // All values in this config should override the defaultConfig
    const mockConfig: AppConfig = {
      isAppConfigLoaded: true,
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

    const { result } = renderHook(() => useAppConfigContext());
    let [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig).not.toEqual(mockConfig);

    await loadAppConfig();

    [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig).toEqual({
      ...mockConfig,
      isAppConfigLoaded: true,
    });
  });

  it('falls back to defaultConfig if fetch fails', async () => {
    expect.assertions(4);

    const mockFetchError = new Error('mocking a failure to fetch');

    vi.spyOn(global, 'fetch').mockRejectedValue(mockFetchError as unknown as Response);

    const { result, rerender } = renderHook(() => useAppConfigContext());
    let [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig.isAppConfigLoaded).toBe(false);
    expect(loadAppConfig()).rejects.toThrow('mocking a failure to fetch');

    await act(() => {
      rerender();
    });

    [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig.isAppConfigLoaded).toBe(true);

    expect(appConfig).toEqual({
      ...defaultAppConfig,
      isAppConfigLoaded: true,
    });
  });

  it('falls back to defaultConfig if no config.json is found', async () => {
    expect.assertions(4);

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: () => 'text/html',
      },
    } as unknown as Response);

    const { result, rerender } = renderHook(() => useAppConfigContext());
    let [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig).toEqual(defaultAppConfig);

    expect(loadAppConfig()).rejects.toThrow('No valid JSON found, using default config');

    await act(() => {
      rerender();
    });

    [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig.isAppConfigLoaded).toBe(true);

    expect(appConfig).toEqual({
      ...defaultAppConfig,
      isAppConfigLoaded: true,
    });
  });
});

function renderHook<Result, Props>(render: (initialProps: Props) => Result) {
  return renderHookBase(render, { wrapper: AppConfigProvider });
}
