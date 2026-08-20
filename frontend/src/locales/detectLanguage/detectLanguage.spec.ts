import { describe, it, expect } from 'vitest';
import { Lang } from '@common/schemas';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import { env } from '../../env';
import detectLanguage from './detectLanguage';

describe('detectLanguage', () => {
  it('returns exact match when browser language is directly supported', () => {
    env.partialUpdate({
      I18N_SUPPORTED_LANGUAGES: [Lang.EN, Lang.EN_US, Lang.ES, Lang.ES_MX, Lang.IT, Lang.DE],
    });
    setupWindowNavigatorMock({ language: 'es', languages: ['es'] });

    expect(detectLanguage()).toBe(Lang.ES);
  });
});
