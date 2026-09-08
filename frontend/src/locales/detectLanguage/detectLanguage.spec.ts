import { describe, it, expect } from 'vitest';
import { Lang } from '@common/schemas';
import { env } from '../../env';
import detectLanguage from './detectLanguage';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

describe('detectLanguage', () => {
  it('returns exact match when browser language is directly supported', () => {
    setupWindowNavigatorMock({
      language: 'es',
      languages: ['es'],
    });

    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });

    expect(detectLanguage()).toBe(Lang.ES);
  });

  it('returns fallback when navigator is undefined', () => {
    setupWindowNavigatorMock({
      language: undefined,
      languages: undefined,
    });

    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.EN,
    });

    expect(detectLanguage()).toBe(Lang.EN);
  });

  it('returns match from navigator.languages when primary language is not supported', () => {
    setupWindowNavigatorMock({
      language: 'fr-FR',
      languages: ['fr-FR', 'it-IT', 'en'],
    });

    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.EN,
    });

    expect(detectLanguage()).toBe(Lang.IT);
  });

  it('returns fallback when no language in navigator.languages is supported', () => {
    setupWindowNavigatorMock({
      language: 'fr-FR',
      languages: ['fr-FR', 'ja', 'zh-CN'],
    });

    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.DE,
    });

    expect(detectLanguage()).toBe(Lang.DE);
  });
});
