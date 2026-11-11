import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import appEnglish from '@locales/en.json';
import meetingFlowEnglish from '../locales/en.json';

const mockupI18n = i18next.createInstance();

void mockupI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: { ...appEnglish, ...meetingFlowEnglish } },
  },
  interpolation: { escapeValue: false },
  showSupportNotice: false,
});

export default mockupI18n;
