import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { MapPin, Phone, Clock, Globe } from "lucide-react";

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

  // Maps icon value strings (saved from GeneralSettings) to React icon components
  const socialIconMap = {
    "telegram": <FaTelegramPlane size={16} className="text-white" />,
    "facebook": <FaFacebookF size={16} className="text-white" />,
    "tiktok": <FaTiktok size={16} className="text-white" />,
    "instagram": <FaInstagram size={16} className="text-white" />,
    "twitter": <FaTwitter size={16} className="text-white" />,
    "youtube": <FaYoutube size={16} className="text-white" />,
    "linkedin": <FaLinkedinIn size={16} className="text-white" />,
    "website": <Globe size={16} className="text-white" />,
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
          <div className="space-y-3 w-full sm:w-[calc(50%-1rem)] lg:w-[260px]">
            <h3 className="font-bold text-lg text-red-900 tracking-wide">
              {isLoading ? "..." : shopName}
            </h3>
            <p className="text-sm text-black leading-relaxed">
              {bioShop}
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialMediaLinks.map((social, index) => {
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.title}
                    title={social.title}
                    className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white transition-all duration-200"
                  >
                    {socialIconMap[social.icon] ?? (
                      <Globe size={16} className="text-white" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="w-full sm:w-[calc(50%-1rem)] lg:w-auto">
            <h4 className="font-semibold text-red-900 mb-3 text-sm uppercase tracking-wider">
              {t('footer.additionalInfo')}
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href={settingData?.support || "#"}
                  target="_blank"
                  rel="noopener noreferrer" 
                  download={false} 
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t('footer.howToOrder')}
                </a>
              </li>
              <li>
                <a
                  href={settingData?.support || "#"}
                  target="_blank"
                  rel="noopener noreferrer" 
                  download={false} 
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t('footer.shippingPolicy')}
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-[calc(50%-1rem)] lg:w-auto">
            <h4 className="font-semibold text-red-900 mb-3 text-sm uppercase tracking-wider">
              {t('footer.customerService')}
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href={settingData?.support || "#"}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download={false} 
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t('footer.privacyPolicy')}
                </a>
              </li>
              <li>
                 <a
                  href={settingData?.support || "#"}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download={false} 
                  className="text-black hover:text-red-900 transition-colors duration-150 block"
                >
                  {t('footer.termsOfService')}
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-[calc(50%-1rem)] lg:w-auto">
            <h4 className="font-semibold text-red-900 mb-3 text-sm uppercase tracking-wider">
              {t('footer.contact')}
            </h4>
            <ul className="text-sm space-y-2 text-black">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                <span>{settingData?.address || t('footer.phnomPenh')}</span>
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

      <div className="border-t border-slate-200 pt-4 pb-2">
        <Container className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear() })} {" "}
            <span className="font-medium text-slate-700">CHOMNENH DIGITAL</span>
          </p>
          <div className="flex gap-6">
            <a href="https://www.facebook.com/share/1CcNFUiYWy/?mibextid=wwXIfr" className="hover:text-black transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="https://www.facebook.com/share/1CcNFUiYWy/?mibextid=wwXIfr" className="hover:text-black transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
