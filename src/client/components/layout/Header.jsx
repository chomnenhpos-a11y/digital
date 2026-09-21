import { useState, useEffect } from "react";
import { Search, ShoppingBag, UserLock, Store } from "lucide-react";
import Container from "./Container";
import { useSearch } from "../../../context/SearchContext";
import { useCart } from "../../../context/CartContext";
import { Link, useParams } from "react-router-dom";
import { usePublicSettingsQuery } from "../../../queries/settings/useSettingQueries";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();
  const { searchItem, setSearchItem, priceRange, setPriceRange } = useSearch();
  const { cartCount, setIsCartOpen } = useCart();
  const { shop_code } = useParams();

  const { data: settingData, isLoading } = usePublicSettingsQuery(shop_code);

  const [imgError, setImgError] = useState(false);

  const shopName = settingData?.shop_name || "Shop";
  const rawLogo = settingData?.logo;


  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
  const logoUrl = rawLogo
    ? (rawLogo.startsWith('http') ? rawLogo : `${baseUrl}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`)
    : "";

  useEffect(() => {
    if (!shop_code) return;

    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      document.head.appendChild(manifestLink);
    }
    
    const newManifestUrl = `${baseUrl}/api/manifest?shop_code=${shop_code}`;
    if (manifestLink.getAttribute('href') !== newManifestUrl) {
      manifestLink.setAttribute('href', newManifestUrl);
    }
  }, [shop_code]);

  return (
    <header className="sticky top-0 z-50 md:shadow-md shadow-lg bg-white md:border-b md:border-slate-100 border-b-2 border-red-800">
      <Container className="w-full py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">

          <div className="flex items-center justify-between md:justify-start">

            <div className="flex items-center gap-2 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-full shrink-0" />
                  <div className="h-6 w-32 bg-slate-200 rounded " />
                </div>
              ) : (
                <>
                  {logoUrl && !imgError ? (
                    <img
                      src={logoUrl}
                      alt={shopName}
                      className="h-8 w-8 md:h-14 md:w-14 object-cover rounded-md border-[1px] border-red-800"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-14 md:h-14 bg-red-100 text-red-800 rounded-md flex items-center justify-center shrink-0">
                      <Store size={18} />
                    </div>
                  )}
                  <span className="font-bold text-lg text-red-900 whitespace-nowrap">
                    {shopName}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher/>
              <button
                className="relative"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingBag size={22} className="text-slate-800" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 md:gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5"
              />
              <input
                type="text"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder={t('common.search')}
                className="w-full bg-slate-100 rounded-md md:rounded-full pl-9 md:pl-11 pr-3 py-0 md:py-2 text-base leading-khmer outline-none focus:ring-2 focus:ring-red-400 placeholder:text-slate-400 transition-all"
              />
            </div>

            <LanguageSwitcher className="hidden md:block" />
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="text-sm border border-slate-200 rounded-md md:rounded-lg px-2 py-2 md:px-3 outline-none focus:ring-2 focus:ring-red-400 bg-white"
              aria-label="Filter by price"
            >
              <option value="all">{t('common.allPrices')}</option>
              <option value="under-20">{t('common.under20')}</option>
              <option value="20-50">{t('common.20to50')}</option>
              <option value="50-100">{t('common.50to100')}</option>
              <option value="over-100">{t('common.over100')}</option>
            </select>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              className="relative"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingBag size={24} className="text-slate-800 hover:text-red-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </Container>
    </header>
  );
}