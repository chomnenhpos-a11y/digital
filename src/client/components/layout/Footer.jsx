import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { MapPin, Phone, Clock, Globe, Store, ArrowUpRight } from "lucide-react";

import Container from "./Container";
import { useParams } from "react-router-dom";
import { usePublicSettingsQuery } from "../../../queries/settings/useSettingQueries";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const { shop_code } = useParams();
  const { data: settingData, isLoading } = usePublicSettingsQuery(shop_code);
  const shopName = settingData?.shop_name || "Shop";
  const bioShop = settingData?.bio_shop || "Welcome to our shop!";
  const socialMediaLinks = settingData?.social_media || [];

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  const supportURL = baseUrl + settingData?.support || "#";

  // Shop logo for the bottom-bar identity block (same logic as Header)
  const rawShopLogo = settingData?.logo;
  const shopLogoUrl = rawShopLogo
    ? rawShopLogo.startsWith("http")
      ? rawShopLogo
      : `${baseUrl}${rawShopLogo.startsWith("/") ? "" : "/"}${rawShopLogo}`
    : "";

  // Maps icon value strings (saved from GeneralSettings) to React icon components
  const socialIconMap = {
    telegram: <FaTelegramPlane size={16} className="text-white" />,
    facebook: <FaFacebookF size={16} className="text-white" />,
    tiktok: <FaTiktok size={16} className="text-white" />,
    instagram: <FaInstagram size={16} className="text-white" />,
    twitter: <FaTwitter size={16} className="text-white" />,
    youtube: <FaYoutube size={16} className="text-white" />,
    linkedin: <FaLinkedinIn size={16} className="text-white" />,
    website: <Globe size={16} className="text-white" />,
    "fa-telegram": <FaTelegramPlane size={16} className="text-white" />,
    "fa-facebook": <FaFacebookF size={16} className="text-white" />,
    "fa-tiktok": <FaTiktok size={16} className="text-white" />,
    "fa-instagram": <FaInstagram size={16} className="text-white" />,
    "fa-twitter": <FaTwitter size={16} className="text-white" />,
    "fa-youtube": <FaYoutube size={16} className="text-white" />,
    "fa-linkedin": <FaLinkedinIn size={16} className="text-white" />,
    "fa-globe": <Globe size={16} className="text-white" />,
  };

  return (
    <footer className="bg-white text-slate-300 pt-8 pb-4 mt-8 border-t flex-col">
      <Container>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-10 mb-5">
          {/* ================= DEVELOPED BY (moved from bottom bar) ================= */}
          <div className="space-y-1 w-full sm:w-[calc(50%-1rem)] lg:w-[260px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {t("footer.developedBy", "Developed by")}
            </p>

            <a
              href="https://www.facebook.com/share/1CcNFUiYWy/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chomnenh Digital"
              title="Chomnenh Digital"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 pr-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <img
                src="/images/chomnenh.png"
                alt="Chomnenh Digital logo"
                loading="lazy"
                className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-slate-200"
              />

              <span className="leading-tight">
                <span className="flex items-center gap-1 text-sm font-extrabold tracking-tight text-blue-700 transition-colors group-hover:text-blue-800">
                  Chomnenh <span className="text-[#eab308]">Digital</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 -translate-x-0.5 translate-y-0.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-blue-500" />
                </span>

                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                  Menu System
                </span>
              </span>
            </a>

            {/* <div className="flex gap-4 text-xs text-slate-500">
              <a
                href="https://www.facebook.com/share/1CcNFUiYWy/?mibextid=wwXIfr"
                className="hover:text-black transition-colors"
              >
                {t("footer.privacy")}
              </a>
              <a
                href="https://www.facebook.com/share/1CcNFUiYWy/?mibextid=wwXIfr"
                className="hover:text-black transition-colors"
              >
                {t("footer.terms")}
              </a>
            </div> */}
          </div>

          <div className="w-full sm:w-[calc(50%-1rem)] lg:w-auto">
            <h4 className="font-semibold text-red-900 mb-3 text-sm uppercase tracking-wider">
              {t("footer.additionalInfo")}
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href={supportURL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={false}
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t("footer.howToOrder")}
                </a>
              </li>
              <li>
                <a
                  href={supportURL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={false}
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t("footer.shippingPolicy")}
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-[calc(50%-1rem)] lg:w-auto">
            <h4 className="font-semibold text-red-900 mb-3 text-sm uppercase tracking-wider">
              {t("footer.customerService")}
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href={supportURL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={false}
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  href={supportURL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={false}
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t("footer.termsOfService")}
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-[calc(50%-1rem)] lg:w-auto">
            <h4 className="font-semibold text-red-900 mb-3 text-sm uppercase tracking-wider">
              {t("footer.contact")}
            </h4>
            <ul className="text-sm space-y-2 text-black">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                <span>{settingData?.address || t("footer.phnomPenh")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-red-500 shrink-0" />
                <a
                  href="tel:+855886677456"
                  className="hover:text-red-900 transition-colors"
                >
                  {settingData?.phone || "+855 88 667 7456"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* ================= SHOP NAME + LOGO + SOCIAL MEDIA (moved from top grid) ================= */}
      <div className="border-t border-slate-200 pt-4 pb-2">
        <Container className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Shop identity */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <div className="flex items-center gap-2.5">
                {/* {shopLogoUrl ? (
                  <img
                    src={shopLogoUrl}
                    alt={shopName}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-8 h-8 object-cover rounded-lg border-[1px] border-red-800 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                    <Store size={16} />
                  </div>
                )} */}
                <span className="font-bold text-base text-red-900 leading-khmer">
                  {isLoading ? "..." : shopName}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md text-center sm:text-left line-clamp-2">
                {bioShop}
              </p>
            </div>

            <p className="hidden md:block text-[11px] text-slate-400 text-center pt-14">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            {/* Socials + legal links */}
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <div className="flex items-center gap-2.5">
                {socialMediaLinks.map((social, index) => {
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.title}
                      title={social.title}
                      className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md hover:shadow-red-900/20 active:scale-95"
                    >
                      {socialIconMap[social.icon] ?? (
                        <Globe size={16} className="text-white" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="md:hidden text-[11px] text-slate-400 text-center pt-2">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </Container>
      </div>
    </footer>
  );
}
