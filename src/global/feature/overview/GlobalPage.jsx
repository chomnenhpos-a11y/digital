import React from 'react';
import './global.css';

import { translations } from './translations';
import GlobalNavbar from './components/GlobalNavbar';
import HeroSection from './components/HeroSection';
import WhyUsSection from './components/WhyUsSection';
import BusinessesSection from './components/BusinessesSection';
import FeaturesSection from './components/FeaturesSection';
import CustomersSection from './components/CustomersSection';
import MobileAppSection from './components/MobileAppSection';
import ContactSection from './components/ContactSection';
import { useTranslation } from 'react-i18next';

const GlobalPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const toggleLanguage = () => {
    const newLang = lang === 'km' ? 'en' : 'km';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = translations[lang] || translations.en;

  return (
    <div className={`global-overview-root min-h-screen text-[#333] bg-[#e8e8e8] ${lang === 'en' ? 'lang-en' : ''}`}>
      {/* Top Navigation */}
      <GlobalNavbar
        lang={lang}
        onToggleLang={toggleLanguage}
        t={t}
      />

      <main>
        <HeroSection t={t} />

        <WhyUsSection t={t} />

        <BusinessesSection t={t} />

        <FeaturesSection t={t} />

        <CustomersSection t={t} />

        <MobileAppSection t={t} />

        <ContactSection t={t} />
      </main>
    </div>
  );
};

export default GlobalPage;
