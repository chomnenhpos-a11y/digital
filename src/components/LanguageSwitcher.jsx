import React from "react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";

const LANGUAGES = [
  { code: "en", label: "En", countryCode: "GB" },
  { code: "km", label: "Kh", countryCode: "KH" },
];

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();

  const current =
    LANGUAGES.find(
      (lang) => lang.code === i18n.language?.split("-")[0]
    ) || LANGUAGES[0];

  const handleToggle = () => {
    const nextLanguage = current.code === "en" ? "km" : "en";

    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#9d1159]/20 ${className}`}
      aria-label={`Switch language to ${
        current.code === "en" ? "Khmer" : "English"
      }`}
      title={`Switch to ${current.code === "en" ? "Khmer" : "English"}`}
    >
      <ReactCountryFlag
        countryCode={current.countryCode}
        svg
        style={{
          width: "1.4em",
          height: "1.4em",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      <span className=" ml-0.5">{current.label}</span>
    </button>
  );
};

export default LanguageSwitcher;