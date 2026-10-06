import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ShoppingBag, Store, X, ArrowUpRight, PackageSearch, Tag } from "lucide-react";
import Container from "./Container";
import { useSearch } from "../../../context/SearchContext";
import { useCart } from "../../../context/CartContext";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { usePublicSettingsQuery } from "../../../queries/settings/useSettingQueries";
import { useProductsQuery } from "../../../queries/products/useProductQueries";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import ViewModeSelector from "../common/ViewModeSelector";

const VIEW_MODE_STORAGE_KEY = "client-view-mode";

function isMobileDeviceScreen() {
  if (typeof window === "undefined") return false;
  return Math.min(window.screen.width, window.screen.height) < 768;
}

function getSavedViewMode() {
  if (typeof window === "undefined") return "mobile";

  const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return savedViewMode === "desktop" || savedViewMode === "mobile"
    ? savedViewMode
    : "mobile";
}

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchItem, setSearchItem, priceRange, setPriceRange } = useSearch();
  const { cartCount, setIsCartOpen } = useCart();
  const { shop_code } = useParams();

  const { data: settingData, isLoading } = usePublicSettingsQuery(shop_code);
  const { data: products = [], isPending: isProductsPending } = useProductsQuery({ shop_code });

  const shopRoute = settingData?.shop_code || shop_code;
  const shopPath = shopRoute ? `/${encodeURIComponent(shopRoute)}` : "/";
  const [imgError, setImgError] = useState(false);
  const [requestedViewMode, setRequestedViewMode] = useState(getSavedViewMode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const shopName = settingData?.shop_name || "Shop";
  const rawLogo = settingData?.logo;
  const [showViewportSwitch, setShowViewportSwitch] = useState(isMobileDeviceScreen);

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
  const logoUrl = rawLogo
    ? (rawLogo.startsWith('http') ? rawLogo : `${baseUrl}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`)
    : "";

  const suggestions = useMemo(() => {
    const query = searchItem.trim().toLowerCase();
    if (!query) return [];

    return products.filter((product) => {
      const matchName = (product.name || "").toLowerCase().includes(query);
      const matchSku = (product.sku || "").toLowerCase().includes(query);
      const matchCat = (product.categoryName || "").toLowerCase().includes(query);
      return matchName || matchSku || matchCat;
    });
  }, [products, searchItem]);

  const visibleSuggestions = useMemo(() => {
    return suggestions.slice(0, 5);
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
  }, [shop_code, baseUrl]);

  useEffect(() => {
    setRequestedViewMode(getSavedViewMode());

    const handleViewModeChange = (event) => {
      const nextMode = event.detail?.mode;
      if (nextMode === "desktop" || nextMode === "mobile") {
        setRequestedViewMode(nextMode);
      }
    };

    window.addEventListener("client-view-mode-change", handleViewModeChange);
    return () => {
      window.removeEventListener("client-view-mode-change", handleViewModeChange);
    };
  }, []);

  useEffect(() => {
    const syncScreenMode = () => setShowViewportSwitch(isMobileDeviceScreen());

    window.addEventListener("resize", syncScreenMode);
    window.addEventListener("orientationchange", syncScreenMode);
    return () => {
      window.removeEventListener("resize", syncScreenMode);
      window.removeEventListener("orientationchange", syncScreenMode);
    };
  }, []);

  const handleSelectProduct = (productId) => {
    setIsDropdownOpen(false);
    navigate(`/${shop_code}/products/${productId}`);
  };

  const handleViewAllResults = () => {
    setIsDropdownOpen(false);
    if (!location.pathname.startsWith(`/${shop_code}`) || location.pathname.includes('/products/')) {
      navigate(`/${shop_code}`);
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const viewportSwitch = showViewportSwitch ? <ViewModeSelector variant="toggle" /> : null;

  return (
    <header className="sticky top-0 z-50 md:shadow-md shadow-lg bg-white md:border-b md:border-slate-100 border-b-2 border-red-800">
      <Container className="w-full py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">

          <div className="flex items-center justify-between md:justify-start">

            <Link to={shopPath} className="flex items-center gap-2 overflow-hidden">
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
                    <div className="w-8 h-8 md:w-14 md:w-14 bg-red-100 text-red-800 rounded-md flex items-center justify-center shrink-0">
                      <Store size={18} />
                    </div>
                  )}
                  <span className="font-bold text-lg text-red-900 whitespace-nowrap">
                    {shopName}
                  </span>
                </>
              )}
            </Link>

            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher className="md:hidden"/>
              {viewportSwitch}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 md:gap-4">
            <div ref={searchContainerRef} className="flex-1 relative">
              <Search
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10"
              />
              <input
                type="text"
                value={searchItem}
                onChange={(e) => {
                  setSearchItem(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchItem.trim()) setIsDropdownOpen(true);
                }}
                placeholder={t('common.search')}
                className="w-full bg-slate-100 rounded-md md:rounded-full pl-9 md:pl-11 pr-9 py-1.5 md:py-2 text-sm md:text-base leading-khmer outline-none focus:ring-2 focus:ring-red-400 placeholder:text-slate-400 transition-all"
              />

              {searchItem && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchItem("");
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors z-10"
                  aria-label={t('home.clearSearch')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete Dropdown Overlay */}
              {isDropdownOpen && searchItem.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transition-all duration-200">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      {t('home.searchSuggestions')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {suggestions.length} {t('home.searchResults', { count: suggestions.length })}
                    </span>
                  </div>

                  {isProductsPending ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <PackageSearch className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="text-sm font-semibold text-slate-600">
                        {t('home.noProductsFound')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        "{searchItem}"
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                        {visibleSuggestions.map((product) => {
                          const displayPrice = Number(product.salePrice > 0 ? product.salePrice : product.price || 0);
                          const originalPrice = product.salePrice > 0 && product.price > product.salePrice ? Number(product.price) : null;
                          const hasStock = (product.stockQuantity ?? product.stock ?? 0) > 0;

                          return (
                            <div
                              key={product.id}
                              onClick={() => handleSelectProduct(product.id)}
                              className="group flex items-center gap-3 p-2.5 sm:p-3 hover:bg-red-50/50 transition-colors cursor-pointer"
                            >
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Store className="w-5 h-5" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-red-700 transition-colors">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
                                    {product.categoryName || t('product.general')}
                                  </span>
                                  {!hasStock && (
                                    <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                                      {t('product.outOfStock')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0 flex items-center gap-2">
                                <div>
                                  <div className="text-xs sm:text-sm font-bold text-red-700">
                                    ${displayPrice.toFixed(2)}
                                  </div>
                                  {originalPrice && (
                                    <div className="text-[10px] text-slate-400 line-through">
                                      ${originalPrice.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {suggestions.length > 0 && (
                        <button
                          type="button"
                          onClick={handleViewAllResults}
                          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-red-600 text-slate-600 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border-t border-slate-100"
                        >
                          {t('home.viewAllResults', { count: suggestions.length })}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
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
            {viewportSwitch}
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
