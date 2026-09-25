import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useCart } from '../../../context/CartContext';

export default function ScrollToTopButton() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const { isCartOpen, cartCount } = useCart();

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

  if (!isVisible || isCartOpen) {
    return null;
  }

  const bottomPosition = cartCount > 0 
    ? "bottom-14 md:bottom-8" 
    : "bottom-8 md:bottom-8"; 

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-4 p-2.5 md:p-3 bg-red-900 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${bottomPosition}`}
      aria-label={t('common.scrollToTop')}
    >
      <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
}
