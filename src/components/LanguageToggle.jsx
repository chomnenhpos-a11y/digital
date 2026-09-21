import React from "react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";

const LanguageToggle = ({ className = "" }) => {
  const { i18n } = useTranslation();

  const isKhmer = i18n.language === "km";

  const toggleLanguage = () => {
    const newLang = isKhmer ? "en" : "km";

    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <div
      onClick={toggleLanguage}
      className={`flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 cursor-pointer hover:bg-white/20 transition-all shadow-sm select-none ${className}`}
      title="Toggle Language"
    >
      <div
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          !isKhmer
            ? "bg-pink-600 shadow-sm"
            : "hover:bg-white/10"
        }`}
      >
        <ReactCountryFlag
          countryCode="GB"
          svg
          className="rounded-full w-4 h-4 object-cover"
        />
        <span
          className={`transition-colors ${
            !isKhmer
              ? "text-white"
              : "text-gray-500 hover:text-pink-600"
          }`}
        >
          EN
        </span>
      </div>

      <div
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          isKhmer
            ? "bg-pink-600 shadow-sm"
            : "hover:bg-white/10"
        }`}
      >
        <ReactCountryFlag
          countryCode="KH"
          svg
          className="rounded-full w-4 h-4 object-cover"
        />
        <span
          className={`transition-colors ${
            isKhmer
              ? "text-white"
              : "text-gray-500 hover:text-pink-600"
          }`}
        >
          KH
        </span>
      </div>
    </div>
  );
};

export default LanguageToggle;
