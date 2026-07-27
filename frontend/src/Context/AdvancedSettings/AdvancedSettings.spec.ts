import { describe, expect, it, beforeEach, vi } from 'vitest';
import advancedSettings$ from '.';

const LEGACY_PERSISTED_STATE = {
  isOpen: false,
  selectedTab: 'general',
  bitrateMode: 'default',
  customVideoBitrate: 500_000,
  codecMode: 'automatic',
  codecPriority: ['vp9', 'vp8', 'h264'],
  frameRate: 30,
  resolution: '1280x720',
  audioBitrateMode: 'automatic',
  customAudioBitrate: 128,
  enableDtx: true,
  publisherAudioFallbackEnabled: false,
  subscriberAudioFallbackEnabled: false,
  publisherStatisticsEnabled: false,
};

const persistAdvancedSettings = (state: Record<string, unknown>) => {
  window.localStorage.setItem('advancedSettings', JSON.stringify({ s: state, v: -1 }));
};

const loadFreshStore = async () => {
  vi.resetModules();

  return (await import('.')).default;
};

const {
  setAdvancedNoiseSuppressionEnabled,
  setEchoCancellationEnabled,
  setNoiseSuppressionEnabled,
  setAutoGainControlEnabled,
} = advancedSettings$.actions;

describe('advancedSettings$ audio processing settings', () => {
  beforeEach(() => {
    advancedSettings$.setState((state) => ({
      ...state,
      advancedNoiseSuppressionEnabled: false,
      echoCancellationEnabled: true,
      noiseSuppressionEnabled: true,
      autoGainControlEnabled: true,
    }));
  });

  it.each([
    {
      settingName: 'advancedNoiseSuppressionEnabled',
      setSetting: setAdvancedNoiseSuppressionEnabled,
    },
    { settingName: 'echoCancellationEnabled', setSetting: setEchoCancellationEnabled },
    { settingName: 'noiseSuppressionEnabled', setSetting: setNoiseSuppressionEnabled },
    { settingName: 'autoGainControlEnabled', setSetting: setAutoGainControlEnabled },
  ] as const)(
    '$settingName is toggled without touching the other settings',
    ({ settingName, setSetting }) => {
      const stateBefore = advancedSettings$.getState();

      setSetting(!stateBefore[settingName]);

      const stateAfter = advancedSettings$.getState();
      expect(stateAfter[settingName]).toBe(!stateBefore[settingName]);
      expect({ ...stateAfter, [settingName]: stateBefore[settingName] }).toEqual(stateBefore);
    }
  );
});

describe('advancedSettings$ advanced noise suppression migration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it.each([
    { reduceNoiseChoice: 'true', expectedAdvancedNoiseSuppression: true },
    { reduceNoiseChoice: 'false', expectedAdvancedNoiseSuppression: false },
  ])(
    'adopts the in-call Reduce Noise choice ($reduceNoiseChoice) when the persisted settings predate the setting',
    async ({ reduceNoiseChoice, expectedAdvancedNoiseSuppression }) => {
      persistAdvancedSettings(LEGACY_PERSISTED_STATE);
      window.localStorage.setItem('noiseSuppression', reduceNoiseChoice);

      const store = await loadFreshStore();

      expect(store.getState().advancedNoiseSuppressionEnabled).toBe(
        expectedAdvancedNoiseSuppression
      );
    }
  );

  it('keeps the persisted choice instead of re-adopting the in-call toggle', async () => {
    persistAdvancedSettings({ ...LEGACY_PERSISTED_STATE, advancedNoiseSuppressionEnabled: false });
    window.localStorage.setItem('noiseSuppression', 'true');

    const store = await loadFreshStore();

    expect(store.getState().advancedNoiseSuppressionEnabled).toBe(false);
  });
});
