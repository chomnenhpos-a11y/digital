import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

const LANGUAGES = [
  { code: "en", label: "English", countryCode: "GB" },
  { code: "km", label: "ខ្មែរ",   countryCode: "KH" },
];

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 md:px-2 md:py-1 px-1 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm hover:border-slate-300 hover:shadow-md transition-all text-sm font-medium text-slate-700 select-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Round flag icon */}
        <span className="flex items-center justify-center w-6 h-6 rounded-full overflow-hidden shrink-0 shadow-sm">
          <ReactCountryFlag
            countryCode={current.countryCode}
            svg
            style={{ width: "1.8em", height: "1.8em", objectFit: "cover" }}
          />
        </span>
        <span>{current.label}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
          <ul role="listbox" className="py-1.5">
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === i18n.language;
              return (
                <li key={lang.code} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {/* Round flag icon */}
                    <span className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                      <ReactCountryFlag
                        countryCode={lang.countryCode}
                        svg
                        style={{
                          width: "2.2em",
                          height: "2.2em",
                          objectFit: "cover",
                        }}
                      />
                    </span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {isActive && (
                      <Check size={14} className="text-blue-500 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
