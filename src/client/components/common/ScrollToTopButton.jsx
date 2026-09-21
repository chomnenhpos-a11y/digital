import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function ScrollToTopButton() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 p-2.5  md:p-3  bg-red-900 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      aria-label={t('common.scrollToTop')}
    >
      <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
}
