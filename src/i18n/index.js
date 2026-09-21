import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import km from './locales/km.json';

// Retrieve the saved language from localStorage, or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      km: { translation: km }
    },
    lng: savedLanguage, // Set initial language
    fallbackLng: 'en',  // Use English if a translation is missing
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
