import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
});
