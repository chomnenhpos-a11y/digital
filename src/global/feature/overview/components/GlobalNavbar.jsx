import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoImg from "../../../assets/logo.jpg";

const GlobalNavbar = ({ lang, onToggleLang, t }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinks = [
    { name: t.nav_why_us, href: "#why-us" },
    { name: t.nav_businesses, href: "#businesses" },
    { name: t.nav_features, href: "#features" },
    { name: t.nav_customers, href: "#customers" },
    { name: t.nav_mobile_app, href: "#mobile-app" },
    { name: t.nav_contact, href: "#contact" },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Brand */}
          <a href="#" className="logo-wrapper flex items-center gap-3">
            <img
              src={logoImg}
              onError={(e) => {
                e.target.src = "https://digital.muchtrading.com/logo.jpg";
              }}
              alt="Logo"
              className="site-logo"
            />
            <div className="logo-brand flex flex-col items-start gap-[-8px]">
              <span className="brand-name flex items-center gap-1.5 leading-none">
                {t.brand_name}
                <span className="highlight">{t.brand_highlight}</span>
              </span>

              <span className="brand-tagline leading-none">
                {t.brand_tagline}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-gray-700 hover:text-[#8b2f67] font-medium text-[15px] transition-colors duration-200 py-1"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons & Language Switcher */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/login"
              className="btn-outline-primary px-4 py-1.5 rounded-full font-medium text-sm transition-all inline-block text-center"
            >
              {t.nav_signin}
            </Link>
            <Link
              to="/register"
              className="btn-primary px-4 py-1.5 rounded-full font-medium text-sm shadow-sm transition-all inline-block text-center"
            >
              {t.nav_signup}
            </Link>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="lang-btn flex items-center justify-center gap-2 px-7 py-1.5 rounded-full bg-gray-100 hover:bg-gray-300 transition-colors ml-2"
              title="ប្តូរភាសា / Switch Language"
            >
              <img
                src={
                  lang === "km"
                    ? "https://flagicons.lipis.dev/flags/4x3/kh.svg"
                    : "https://flagicons.lipis.dev/flags/4x3/gb.svg"
                }
                alt={lang === "km" ? "Khmer" : "English"}
                className="flag-icon rounded"
              />
              <span className="font-semibold text-sm text-gray-700">
                {lang === "km" ? "ខ្មែរ" : "EN"}
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={onToggleLang}
              className="lang-btn flex items-center px-2 py-1"
              title="ប្តូរភាសា / Switch Language"
            >
              <img
                src={
                  lang === "km"
                    ? "https://flagicons.lipis.dev/flags/4x3/kh.svg"
                    : "https://flagicons.lipis.dev/flags/4x3/gb.svg"
                }
                alt="Language"
                className="flag-icon !w-5 !h-5 rounded"
              />
              <span className="font-semibold text-xs ml-[2px] text-gray-700">
                {lang === "km" ? "ខ្មែរ" : "EN"}
              </span>
            </button>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-gray-700 hover:text-[#8b2f67] font-medium py-2 px-2 text-base rounded-md hover:bg-gray-50"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
            <Link
              to="/login"
              onClick={() => setIsMobileOpen(false)}
              className="btn-outline-primary w-full py-2 rounded-full font-medium text-sm text-center block"
            >
              {t.nav_signin}
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileOpen(false)}
              className="btn-primary w-full py-2 rounded-full font-medium text-sm text-center block"
            >
              {t.nav_signup}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GlobalNavbar;
