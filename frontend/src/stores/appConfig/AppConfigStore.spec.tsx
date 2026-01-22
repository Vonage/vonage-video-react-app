import { describe, expect, it, vi } from 'vitest';
import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import defaultAppConfig from './helpers/defaultAppConfig';
import appConfigStore from './AppConfigStore';
import type { AppConfig } from '.';

describe('AppConfigContext', () => {
  it('returns the default config when no config.json is loaded', async () => {
    const { result } = renderHook(() => appConfigStore.use()[0]);

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
      waitingRoomSettings: { allowDeviceSelection: false },
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
      json: () => mockConfig,
      headers: { get: () => 'application/json' },
    } as unknown as Response);

    const { result } = renderHook(() => appConfigStore.use());
    let [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig).not.toEqual(mockConfig);

    await act(async () => {
      await loadAppConfig();
    });

    [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig).toEqual({ ...mockConfig, isAppConfigLoaded: true });
  });

  it('falls back to defaultConfig if fetch fails', async () => {
    expect.assertions(3);

    const mockFetchError = new Error('mocking a failure to fetch');

    vi.spyOn(global, 'fetch').mockRejectedValue(mockFetchError as unknown as Response);

    const { result, rerender } = renderHook(() => appConfigStore.use());
    let [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig.isAppConfigLoaded).toBe(false);

    await loadAppConfig();

    // test will fail without the await act
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      rerender();
    });

    [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig.isAppConfigLoaded).toBe(true);

    expect(appConfig).toEqual({ ...defaultAppConfig, isAppConfigLoaded: true });
  });

  it('falls back to defaultConfig if no config.json is found', async () => {
    expect.assertions(3);

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'text/html' },
    } as unknown as Response);

    const { result, rerender } = renderHook(() => appConfigStore.use());
    let [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig).toEqual(defaultAppConfig);

    await loadAppConfig();

    // test will fail without the await act
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      rerender();
    });

    [appConfig, { loadAppConfig }] = result.current;

    expect(appConfig.isAppConfigLoaded).toBe(true);

    expect(appConfig).toEqual({ ...defaultAppConfig, isAppConfigLoaded: true });
  });
});

function renderHook<Result, Props>(render: (initialProps: Props) => Result) {
  return renderHookBase(render, { wrapper: appConfigStore.Provider });
}
