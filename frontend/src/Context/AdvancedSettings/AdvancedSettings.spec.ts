import { describe, expect, it, beforeEach } from 'vitest';
import advancedSettings$ from '.';

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
