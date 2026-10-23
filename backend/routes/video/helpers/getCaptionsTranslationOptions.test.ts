import { afterEach, describe, expect, it, vi } from 'vitest';
import getCaptionsTranslationOptions from './getCaptionsTranslationOptions';

describe('getCaptionsTranslationOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns no options when the variables are unset or empty', () => {
    vi.stubEnv('CAPTIONS_TRANSLATION_LEVEL', '');
    vi.stubEnv('CAPTIONS_TARGET_LANGUAGE_CODE', '');

    expect(getCaptionsTranslationOptions()).toEqual({});
  });

  it('returns the configured translation level and target language', () => {
    vi.stubEnv('CAPTIONS_TRANSLATION_LEVEL', 'CONFIDENT_PARTIALS');
    vi.stubEnv('CAPTIONS_TARGET_LANGUAGE_CODE', 'es-ES');

    expect(getCaptionsTranslationOptions()).toEqual({
      translationLevel: 'CONFIDENT_PARTIALS',
      targetLanguageCode: 'es-ES',
    });
  });

  it('rejects an unknown translation level', () => {
    vi.stubEnv('CAPTIONS_TRANSLATION_LEVEL', 'EVERYTHING');

    expect(() => getCaptionsTranslationOptions()).toThrow();
  });
});
