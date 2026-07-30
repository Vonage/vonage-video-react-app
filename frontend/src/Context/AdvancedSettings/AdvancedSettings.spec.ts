import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../../utils/storage';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

/**
 * The store reads localStorage when its module is first evaluated, so each test seeds storage and
 * then imports a fresh copy.
 */
const loadStore = async () => {
  const module = await import('./AdvancedSettings');
  return module.default;
};

describe('advancedSettings$', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('audio processing actions', () => {
    it('updates each audio setting through its action', async () => {
      const advancedSettings$ = await loadStore();

      advancedSettings$.actions.setEchoCancellationEnabled(false);
      advancedSettings$.actions.setNoiseSuppressionEnabled(false);
      advancedSettings$.actions.setAutoGainControlEnabled(false);
      advancedSettings$.actions.setAdvancedNoiseSuppressionEnabled(true);

      expect(advancedSettings$.getState()).toMatchObject({
        echoCancellationEnabled: false,
        noiseSuppressionEnabled: false,
        autoGainControlEnabled: false,
        advancedNoiseSuppressionEnabled: true,
      });
    });
  });

  describe('advanced noise suppression migration', () => {
    it('adopts the legacy in-call Reduce Noise choice on first run', async () => {
      window.localStorage.setItem(STORAGE_KEYS.NOISE_SUPPRESSION, 'true');
      window.localStorage.setItem(
        ADVANCED_SETTINGS_KEY,
        JSON.stringify({ s: { isOpen: false }, v: 1 })
      );

      const advancedSettings$ = await loadStore();

      expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(true);
    });

    it('keeps an already-persisted value instead of re-running the migration', async () => {
      window.localStorage.setItem(STORAGE_KEYS.NOISE_SUPPRESSION, 'true');
      window.localStorage.setItem(
        ADVANCED_SETTINGS_KEY,
        JSON.stringify({ s: { isOpen: false, advancedNoiseSuppressionEnabled: false }, v: 1 })
      );

      const advancedSettings$ = await loadStore();

      expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(false);
    });
  });
});
