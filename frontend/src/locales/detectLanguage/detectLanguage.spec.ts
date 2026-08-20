import { describe, it, expect, afterEach } from 'vitest';
import { Lang } from '@common/schemas';
import { env } from '../../env';
import detectLanguage from './detectLanguage';

function mockBrowserLanguage(language: string, languages: string[]) {
  Object.defineProperty(globalThis.navigator, 'language', {
    get: () => language,
    configurable: true,
  });
  Object.defineProperty(globalThis.navigator, 'languages', {
    get: () => languages,
    configurable: true,
  });
}

describe('detectLanguage', () => {
  afterEach(() => {
    mockBrowserLanguage('en-US', ['en-US']);
  });

  it('returns exact match when browser language is directly supported', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('es', ['es']);

    expect(detectLanguage()).toBe(Lang.ES);
  });

  it('returns exact match for regional variant that is supported', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('es-MX', ['es-MX']);

    expect(detectLanguage()).toBe(Lang.ES_MX);
  });

  it('resolves regional variant to base language when variant is not supported', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('es-ES', ['es-ES']);

    expect(detectLanguage()).toBe(Lang.ES);
  });

  it('resolves de-DE to de', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('de-DE', ['de-DE']);

    expect(detectLanguage()).toBe(Lang.DE);
  });

  it('resolves it-CH to it', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('it-CH', ['it-CH']);

    expect(detectLanguage()).toBe(Lang.IT);
  });

  it('returns fallback when no browser language matches', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.EN,
    });
    mockBrowserLanguage('fr-FR', ['fr-FR']);

    expect(detectLanguage()).toBe(Lang.EN);
  });

  it('tries second language in list when first does not match', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('fr', ['fr', 'de-AT']);

    expect(detectLanguage()).toBe(Lang.DE);
  });

  it('returns fallback when navigator is undefined', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.EN,
    });

    const originalNavigator = globalThis.navigator;
    // @ts-expect-error -- simulating non-browser environment
    globalThis.navigator = undefined;

    expect(detectLanguage()).toBe(Lang.EN);

    globalThis.navigator = originalNavigator;
  });
});
