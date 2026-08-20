import { describe, it, expect } from 'vitest';
import { Lang } from '@common/schemas';
import { env } from '../../env';
import detectLanguage from './detectLanguage';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

beforeEach(() => {
  setupWindowNavigatorMock({
    language: 'es',
    languages: ['es'],
  });
});

describe('detectLanguage', () => {
  it('returns exact match when browser language is directly supported', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });

    expect(detectLanguage()).toBe(Lang.ES);
  });

  it('returns fallback when navigator is undefined', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
      I18N_FALLBACK_LANGUAGE: Lang.EN,
    });
    vi.stubGlobal('navigator', undefined);

    expect(detectLanguage()).toBe(Lang.EN);
  });
});
