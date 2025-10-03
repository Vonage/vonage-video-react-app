import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from './locales';

i18n
  // detect user language: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .use(initReactI18next)
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: import.meta.env.VITE_I18N_FALLBACK_LANGUAGE ?? 'en',
    supportedLngs: import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES?.split('|') ?? ['en'],
    resources,
  });

export default i18n;
