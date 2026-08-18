import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from './locales';
import { env } from './env';
import type { Lang } from '@common/schemas';

/**
 * Resolves a BCP-47 language tag (e.g. "es-ES", "it-CH") to the closest
 * supported Lang value. Falls back to the configured fallback language.
 */
function detectLanguage(): Lang {
  const supported = env.I18N_SUPPORTED_LANGUAGES;
  const browserLanguages = navigator.languages || [navigator.language];

  for (const tag of browserLanguages) {
    const exact = supported.find((lang) => (lang as string) === tag);
    if (exact) return exact;

    const base = supported.find((lang) => (lang as string) === tag.split('-')[0]);
    if (base) return base;
  }

  return env.I18N_FALLBACK_LANGUAGE;
}

void i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: env.I18N_FALLBACK_LANGUAGE,
  supportedLngs: env.I18N_SUPPORTED_LANGUAGES,
  resources,
  showSupportNotice: false,
});

export default i18n;
