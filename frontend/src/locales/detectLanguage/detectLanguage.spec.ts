import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Lang } from '@common/schemas';
import { env } from '../../env';
import detectLanguage from './detectLanguage';

describe('detectLanguage', () => {
  beforeEach(() => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.EN,
    });
  });

  it('returns exact match when browser language is directly supported', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es']);

    expect(detectLanguage()).toBe(Lang.ES);
  });

  it('returns exact match for regional variant that is supported', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-MX']);

    expect(detectLanguage()).toBe(Lang.ES_MX);
  });

  it('resolves regional variant to base language when variant is not supported', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-ES']);

    expect(detectLanguage()).toBe(Lang.ES);
  });

  it('resolves de-DE to de', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE']);

    expect(detectLanguage()).toBe(Lang.DE);
  });

  it('resolves it-CH to it', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['it-CH']);

    expect(detectLanguage()).toBe(Lang.IT);
  });

  it('returns fallback when no browser language matches', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR']);

    expect(detectLanguage()).toBe(Lang.EN);
  });

  it('tries second language in list when first does not match', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr', 'de-AT']);

    expect(detectLanguage()).toBe(Lang.DE);
  });

  it('returns fallback when navigator is undefined', () => {
    const originalNavigator = globalThis.navigator;
    // @ts-expect-error -- simulating non-browser environment
    delete globalThis.navigator;

    expect(detectLanguage()).toBe(Lang.EN);

    globalThis.navigator = originalNavigator;
  });

  it('falls back to navigator.language when navigator.languages is empty', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('it');

    expect(detectLanguage()).toBe(Lang.EN);
  });
});
