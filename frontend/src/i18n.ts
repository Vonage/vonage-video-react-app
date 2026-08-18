import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from './locales';
import { env } from './env';
import detectLanguage from './locales/detectLanguage';

void i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: env.I18N_FALLBACK_LANGUAGE,
  supportedLngs: env.I18N_SUPPORTED_LANGUAGES,
  resources,
  showSupportNotice: false,
});

export default i18n;
