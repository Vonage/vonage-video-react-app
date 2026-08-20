import { describe, it, expect, vi } from 'vitest';
import { Lang } from '@common/schemas';
import { env } from '../../env';
import detectLanguage from './detectLanguage';

function mockBrowserLanguage(language: string, languages: string[]) {
  vi.stubGlobal('navigator', {
    ...globalThis.navigator,
    language,
    languages,
  });
}

describe('detectLanguage', () => {
  it('returns exact match when browser language is directly supported', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    mockBrowserLanguage('es', ['es']);

    expect(detectLanguage()).toBe(Lang.ES);
  });
});
