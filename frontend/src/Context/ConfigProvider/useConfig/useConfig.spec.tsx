import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useConfig from './useConfig';

describe('useConfig', () => {
  let nativeFetch: typeof global.fetch;

  beforeAll(() => {
    nativeFetch = global.fetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = nativeFetch;
  });

  it('returns the default config when no config.json is loaded', () => {
    const { result } = renderHook(() => useConfig());
    expect(result.current).toMatchObject({
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
      layoutMode: 'active-speaker',
    });
  });

  it('merges config.json values if loaded (mocked fetch)', async () => {
    const mockConfig = {
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
      layoutMode: 'grid',
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

    expect(result.current).toMatchObject({
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
      layoutMode: 'active-speaker',
    });
  });
});
