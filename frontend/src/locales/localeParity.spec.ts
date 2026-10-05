import { describe, expect, it } from 'vitest';
import en from './en.json';
import de from './de.json';
import es from './es.json';
import esMX from './es-MX.json';
import itLocale from './it.json';

/**
 * Guards against locale key drift: every non-default locale must define exactly
 * the same keys as en.json — no missing keys (which silently fall back to
 * English, e.g. the recording-consent dialog) and no orphaned extra keys.
 */
const locales: Record<string, Record<string, string>> = {
  de,
  es,
  'es-MX': esMX,
  it: itLocale,
};

const enKeys = Object.keys(en as Record<string, string>);

describe('locale key parity with en.json', () => {
  Object.entries(locales).forEach(([name, locale]) => {
    it(`${name}.json has exactly the same keys as en.json`, () => {
      const missing = enKeys.filter((key) => !(key in locale));
      const extra = Object.keys(locale).filter((key) => !(key in (en as Record<string, string>)));

      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });
  });
});
