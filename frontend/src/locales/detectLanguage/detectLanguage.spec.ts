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
});
