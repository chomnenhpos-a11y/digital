import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

import FilterTabs from "../../../components/common/FilterTabs";
import SectionHeader from "../../../components/common/SectionHeader";
import ProductGrid from "../../products/components/ProductGrid";
import ProductSkeletonGrid from "../../../components/common/ProductSkeletonGrid";
import FilterTabsSkeleton from "../../../components/common/FilterTabsSkeleton";
import EmptyState from "../../../components/common/EmptyState";

import { useSearch } from "../../../../context/SearchContext";
import { useBestSellers } from "../../../../hooks/useBestSellers";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 8;
// Mobile "All Products" section: show 2 rows (4 cards on a 2-col grid) by default
const MOBILE_PAGE_SIZE = 4;
const ALL_PRODUCTS_ID = "ALL_PRODUCTS";
const ALL_CATEGORIES_ID = "ALL_CATEGORIES";

/**
 * Custom hook to detect if screen is desktop (>= 768px, Tailwind md: breakpoint)
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(min-width: 768px)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export default function ProductSection({ allProductsRef, bestSellerRules }) {
  const { t } = useTranslation();
  const { shop_code } = useParams();
  const isDesktop = useIsDesktop();

  const productsQuery = useProductsQuery({
    shop_code,
  });
  const { isPending: isProductsPending } = productsQuery;
  const { products: productsWithBadges } = useBestSellers({
    shopCode: shop_code,
    catalog: productsQuery,
    rules: bestSellerRules,
  });

  const {
    data: categories = [],
    isPending: isCategoriesPending,
  } = useCategoriesQuery({
    shop_code,
  });

  const {
    searchItem = "",
    priceRange = "all",
  } = useSearch();

  const isProductLoading = isProductsPending || isCategoriesPending;

  const isSearching =
    searchItem.trim() !== "" || priceRange !== "all";

  const matchPriceRange = useCallback((price) => {
    const numPrice = Number(price) || 0;

    if (priceRange === "under-20") {
      return numPrice < 20;
    }

    if (priceRange === "20-50") {
      return numPrice >= 20 && numPrice <= 50;
    }

    if (priceRange === "50-100") {
      return numPrice > 50 && numPrice <= 100;
    }

    if (priceRange === "over-100") {
      return numPrice > 100;
    }

    return true;
  }, [priceRange]);

  /* =======================================================================
   * 1. DESKTOP MODE (md: and up) - OLD STYLE
   * - FilterTabs under "Search by Category" (non-sticky)
   * - Categories first, All Products at the last
   * - Clicking category tab filters the single product list
   * - Pagination with PAGE_SIZE = 8 and Load More bouncy button
   * ======================================================================= */
  const [desktopActiveTab, setDesktopActiveTab] = useState(ALL_CATEGORIES_ID);
  const [visibleCountDesktop, setVisibleCountDesktop] = useState(PAGE_SIZE);

  const isCategoryFilteredDesktop = desktopActiveTab !== ALL_CATEGORIES_ID;

  // Categories first, All Products at the last
  const tabsDesktop = useMemo(() => {
    return [
      {
        id: ALL_CATEGORIES_ID,
        icon: "mdi:format-list-bulleted-square",
        name: t("home.allProducts", "All Products"),
        image: null,
      },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image || null,
      })),
    ];
  }, [categories, t]);

  const filteredProductsDesktop = useMemo(() => {
    if (!productsWithBadges.length) {
      return [];
    }

    return productsWithBadges
      .filter((product) => {
        if (desktopActiveTab === ALL_CATEGORIES_ID) {
          return true;
        }
        return Number(product.categoryId) === Number(desktopActiveTab);
      })
      .filter((product) => {
        const query = searchItem.trim().toLowerCase();
        if (!query) return true;
        return (
          (product.name || "").toLowerCase().includes(query) ||
          (product.sku || "").toLowerCase().includes(query) ||
          (product.categoryName || "").toLowerCase().includes(query)
        );
      })
      .filter((product) =>
        matchPriceRange(product.salePrice ?? product.price ?? 0)
      );
  }, [productsWithBadges, desktopActiveTab, searchItem, matchPriceRange]);

  const visibleProductsDesktop = useMemo(() => {
    return filteredProductsDesktop.slice(0, visibleCountDesktop);
  }, [filteredProductsDesktop, visibleCountDesktop]);

  useEffect(() => {
    setVisibleCountDesktop(PAGE_SIZE);
    setVisibleCountMobile(MOBILE_PAGE_SIZE);
  }, [desktopActiveTab, searchItem, priceRange]);

  const hasMoreProductsDesktop =
    visibleCountDesktop < filteredProductsDesktop.length;

  const handleLoadMoreDesktop = () => {
    setVisibleCountDesktop((prev) =>
      Math.min(prev + PAGE_SIZE, filteredProductsDesktop.length)
    );
  };

  const handleDesktopTabChange = (tab) => {
    setDesktopActiveTab(tab);
    setVisibleCountDesktop(PAGE_SIZE);

    if (tab === ALL_CATEGORIES_ID) {
      setTimeout(() => {
        if (!allProductsRef?.current) return;
        const headerOffset = 100;
        const elementPosition =
          allProductsRef.current.getBoundingClientRect().top;
        window.scrollTo({
          top: elementPosition + window.pageYOffset - headerOffset,
          behavior: "smooth",
        });
      }, 50);
    }
  };

  /* =======================================================================
   * 2. MOBILE MODE (< md) - DIGITAL MENU STICKY NAVIGATION
   * - Sticky category bar below mobile header
   * - Categories first, All Products at the last
   * - Separate vertical sections for each category
   * - Replaces General Products with All Products at the last
   * - Smooth anchor scrolling on category click
   * - IntersectionObserver scrollspy highlighting active category
   * ======================================================================= */
  const [mobileActiveTab, setMobileActiveTab] = useState(() => {
    return categories.length > 0 ? String(categories[0].id) : ALL_PRODUCTS_ID;
  });
  const [headerHeight, setHeaderHeight] = useState(80);
  const [navHeight, setNavHeight] = useState(56);
  const [isStuckMobile, setIsStuckMobile] = useState(false);
  const [visibleCountMobile, setVisibleCountMobile] = useState(MOBILE_PAGE_SIZE);

  const navRef = useRef(null);
  const sectionRefs = useRef(new Map());
  const isManualScrolling = useRef(false);
  const scrollEndTimer = useRef(null);

  // Sync initial tab when categories load
  useEffect(() => {
    if (categories.length > 0 && !sectionRefs.current.has(mobileActiveTab)) {
      setMobileActiveTab(String(categories[0].id));
    }
  }, [categories]);

  // Measure dynamic header height on mobile
  useEffect(() => {
    if (isDesktop) return;

    const updateHeaderHeight = () => {
      const headerEl = document.querySelector("header");
      if (headerEl) {
        setHeaderHeight(Math.round(headerEl.getBoundingClientRect().height));
      }
    };

    updateHeaderHeight();

    const headerEl = document.querySelector("header");
    let resizeObserver;
    if (headerEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(headerEl);
    }

    window.addEventListener("resize", updateHeaderHeight);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [isDesktop]);

  // Measure mobile category navigation bar height
  useEffect(() => {
    if (isDesktop) return;
    if (navRef.current) {
      setNavHeight(Math.round(navRef.current.getBoundingClientRect().height));
    }
  }, [categories, isCategoriesPending, isDesktop]);

  const totalStickyOffset = headerHeight + navHeight;

  // Track sticky state on mobile for shadow elevation
  useEffect(() => {
    if (isDesktop) return;

    const handleScrollStuck = () => {
      if (!navRef.current) return;
      const rect = navRef.current.getBoundingClientRect();
      setIsStuckMobile(rect.top <= headerHeight + 1);
    };

    window.addEventListener("scroll", handleScrollStuck, { passive: true });
    handleScrollStuck();
    return () => window.removeEventListener("scroll", handleScrollStuck);
  }, [headerHeight, isDesktop]);

  // Filter all products for mobile category groupings
  const filteredProductsMobile = useMemo(() => {
    if (!productsWithBadges.length) {
      return [];
    }

    return productsWithBadges
      .filter((product) => {
        const query = searchItem.trim().toLowerCase();
        if (!query) return true;
        return (
          (product.name || "").toLowerCase().includes(query) ||
          (product.sku || "").toLowerCase().includes(query) ||
          (product.categoryName || "").toLowerCase().includes(query)
        );
      })
      .filter((product) =>
        matchPriceRange(product.salePrice ?? product.price ?? 0)
      );
  }, [productsWithBadges, searchItem, matchPriceRange]);

  // Mobile pagination for the "All Products" section
  const visibleProductsMobile = useMemo(() => {
    return filteredProductsMobile.slice(0, visibleCountMobile);
  }, [filteredProductsMobile, visibleCountMobile]);

  const hasMoreProductsMobile =
    visibleCountMobile < filteredProductsMobile.length;

  const handleLoadMoreMobile = () => {
    setVisibleCountMobile((prev) =>
      Math.min(prev + MOBILE_PAGE_SIZE, filteredProductsMobile.length)
    );
  };

  // Group products by category ID for vertical sections on mobile
  const productsByCategory = useMemo(() => {
    const map = new Map();

    categories.forEach((cat) => {
      map.set(String(cat.id), []);
    });

    filteredProductsMobile.forEach((product) => {
      const catId = String(product.categoryId);
      if (map.has(catId)) {
        map.get(catId).push(product);
      }
      // NOTE: products whose categoryId doesn't match a known category are
      // NOT dropped — the "All Products" section below always renders the
      // FULL filteredProductsMobile list, so nothing is lost.
    });

    return map;
  }, [categories, filteredProductsMobile]);

  // Mobile Category Navigation Tabs: Categories first, All Products at the LAST
  const tabsMobile = useMemo(() => {
    const list = categories.map((category) => {
      return {
        id: String(category.id),
        name: category.name,
        image: category.image || null,
      };
    });
    // Place All Products at the LAST
    list.unshift({
      id: ALL_PRODUCTS_ID,
      name: t("home.allProducts", "All Products"),
      image: null,
      isAll: true,
    });


    return list;
  }, [categories, filteredProductsMobile.length, productsByCategory, t]);

  // Smooth scroll to category section when tab is clicked on mobile
  const handleMobileTabChange = useCallback(
    (tabId) => {
      setMobileActiveTab(tabId);
      isManualScrolling.current = true;
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);

      const scrollTargetOffset = totalStickyOffset + 12;

      if (tabId === ALL_PRODUCTS_ID) {
        // If All Products section exists at the end, scroll directly to it; otherwise to allProductsRef
        const allSection = sectionRefs.current.get(ALL_PRODUCTS_ID);
        const targetEl = allSection || allProductsRef?.current;
        if (targetEl) {
          const targetPos =
            targetEl.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: Math.max(0, targetPos - scrollTargetOffset),
            behavior: "smooth",
          });
        }
      } else {
        const sectionEl = sectionRefs.current.get(String(tabId));
        if (sectionEl) {
          const targetPos =
            sectionEl.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: Math.max(0, targetPos - scrollTargetOffset),
            behavior: "smooth",
          });
        }
      }

      const handleScrollEnd = () => {
        isManualScrolling.current = false;
        window.removeEventListener("scrollend", handleScrollEnd);
      };

      if ("onscrollend" in window) {
        window.addEventListener("scrollend", handleScrollEnd, { once: true });
      }

      scrollEndTimer.current = setTimeout(() => {
        isManualScrolling.current = false;
      }, 850);
    },
    [totalStickyOffset, allProductsRef]
  );

  // Scrollspy on mobile: IntersectionObserver detects currently visible category section
  useEffect(() => {
    if (isDesktop || isProductLoading) return;

    const intersectingMap = new Map();

    const observerCallback = (entries) => {
      if (isManualScrolling.current) return;

      entries.forEach((entry) => {
        const catId = entry.target.dataset.categoryId;
        if (catId) {
          intersectingMap.set(catId, entry);
        }
      });

      // 1. Check if user is near the top of the product listing
      if (allProductsRef?.current) {
        const allRect = allProductsRef.current.getBoundingClientRect();
        if (allRect.top > totalStickyOffset + 35) {
          if (categories.length > 0) {
            setMobileActiveTab(String(categories[0].id));
            return;
          }
        }
      }

      // 2. Check if reached bottom of page -> activate All Products (at the last)
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;

      if (isAtBottom) {
        if (sectionRefs.current.has(ALL_PRODUCTS_ID)) {
          setMobileActiveTab(ALL_PRODUCTS_ID);
          return;
        }
        const renderedCategories = categories.filter((c) =>
          sectionRefs.current.has(String(c.id))
        );
        if (renderedCategories.length > 0) {
          setMobileActiveTab(
            String(renderedCategories[renderedCategories.length - 1].id)
          );
          return;
        }
      }

      // 3. Find intersecting category section closest to reading line
      const intersecting = [];
      intersectingMap.forEach((entry, catId) => {
        if (entry.isIntersecting) {
          intersecting.push({
            catId,
            top: entry.boundingClientRect.top,
            bottom: entry.boundingClientRect.bottom,
          });
        }
      });

      if (intersecting.length > 0) {
        const readingLine = totalStickyOffset + 80;
        const activeSection = intersecting.find(
          (item) => item.top <= readingLine && item.bottom > readingLine
        );

        if (activeSection) {
          setMobileActiveTab(activeSection.catId);
        } else {
          intersecting.sort(
            (a, b) =>
              Math.abs(a.top - readingLine) - Math.abs(b.top - readingLine)
          );
          setMobileActiveTab(intersecting[0].catId);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: `-${totalStickyOffset + 5}px 0px -40% 0px`,
      threshold: [0, 0.1, 0.25, 0.5],
    });

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    const handleScrollBoundaries = () => {
      if (isManualScrolling.current) return;

      if (allProductsRef?.current) {
        const allRect = allProductsRef.current.getBoundingClientRect();
        if (allRect.top > totalStickyOffset + 35) {
          if (categories.length > 0) {
            setMobileActiveTab(String(categories[0].id));
            return;
          }
        }
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;

      if (isAtBottom) {
        if (sectionRefs.current.has(ALL_PRODUCTS_ID)) {
          setMobileActiveTab(ALL_PRODUCTS_ID);
        } else {
          const renderedCategories = categories.filter((c) =>
            sectionRefs.current.has(String(c.id))
          );
          if (renderedCategories.length > 0) {
            setMobileActiveTab(
              String(renderedCategories[renderedCategories.length - 1].id)
            );
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollBoundaries, {
      passive: true,
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollBoundaries);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, [
    categories,
    isProductLoading,
    totalStickyOffset,
    allProductsRef,
    isDesktop,
  ]);
  if (isDesktop) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="flex items-center gap-2 text-xl mt-3 md:mt-0 font-bold text-slate-800 leading-khmer">
            <Icon
              icon="arcticons:circle-search"
              height="1.5em"
              style={{
                color: "#d1a500",
              }}
              aria-hidden="true"
            />
            {t("home.searchByCategory")}
          </h2>

          {isCategoriesPending ? (
            <FilterTabsSkeleton count={6} />
          ) : (
            <FilterTabs
              tabs={tabsDesktop}
              activeTab={desktopActiveTab}
              onChange={handleDesktopTabChange}
            />
          )}
        </div>

        <section ref={allProductsRef} className="scroll-mt-24">
          <SectionHeader
            icon="ant-design:product-outlined"
            iconHeight="1.5em"
            title={
              isCategoryFilteredDesktop
                ? t("home.categoryProducts", {
                    category:
                      tabsDesktop.find((t) => t.id === desktopActiveTab)
                        ?.name || desktopActiveTab,
                  })
                : isSearching
                ? t("home.searchResults", {
                    count: filteredProductsDesktop.length,
                  })
                : t("home.allProducts")
            }
          />

          {isProductLoading ? (
            <ProductSkeletonGrid count={8} />
          ) : (
            <>
              <ProductGrid products={visibleProductsDesktop} />

              {hasMoreProductsDesktop && (
                <div className="flex justify-center pt-5">
                  <button
                    type="button"
                    onClick={handleLoadMoreDesktop}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-800 text-white bg-red-700 px-4 py-2 text-sm font-medium shadow-sm transition-all duration-400 animate-bounce hover:border-red-800 hover:bg-red-900 hover:shadow active:scale-[0.98]"
                  >
                    <Icon
                      icon="material-symbols:expand-more"
                      height="1.3em"
                    />
                    {t("home.loadMore")}
                  </button>
                </div>
              )}

              {!hasMoreProductsDesktop &&
                filteredProductsDesktop.length > 0 && (
                  <div className="py-4 text-center text-sm text-slate-400">
                    {t("home.showingAll")}
                  </div>
                )}

              {!visibleProductsDesktop.length && (
                <div className="py-10 text-center text-sm text-slate-400">
                  {t("home.noProducts")}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    );
  }

  // Mobile View (< md)
  return (
    <div className="space-y-6">
      {/* Category Navigation Bar Header & Sticky Pill Container */}
      <div
        id="category-sticky-nav"
        ref={navRef}
        style={{ top: `${headerHeight}px` }}
        className={`sticky z-40 bg-white/95 backdrop-blur-md -mx-4 px-4 py-2.5 transition-all duration-200 ${
          isStuckMobile
            ? "border-b border-slate-200/80 shadow-md shadow-slate-900/5"
            : "border-b border-transparent shadow-none"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 leading-khmer">
            <Icon
              icon="arcticons:circle-search"
              height="1.4em"
              style={{ color: "#d1a500" }}
              aria-hidden="true"
            />
            {t("home.searchByCategory")}
          </h2>

          {isSearching && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {t("home.searchResults", {
                count: filteredProductsMobile.length,
              })}
            </span>
          )}
        </div>

        {isCategoriesPending ? (
          <FilterTabsSkeleton count={6} />
        ) : (
          <FilterTabs
            tabs={tabsMobile}
            activeTab={mobileActiveTab}
            onChange={handleMobileTabChange}
          />
        )}
      </div>

      {/* Product Categories Vertical Sections on Mobile */}
      <div
        ref={allProductsRef}
        style={{ scrollMarginTop: `${totalStickyOffset + 16}px` }}
        className="space-y-10"
      >
        {isProductLoading ? (
          <ProductSkeletonGrid count={8} />
        ) : filteredProductsMobile.length === 0 ? (
          <div className="py-12 text-center">
            <EmptyState
              title={
                isSearching
                  ? t("home.noProductsFound", "No matching products found")
                  : t("home.noProducts", "No products found")
              }
            />
          </div>
        ) : (
          <>
            {categories.map((category) => {
              const catId = String(category.id);
              const categoryProducts =
                productsByCategory.get(catId) || [];

              if (isSearching && categoryProducts.length === 0) {
                return null;
              }

              return (
                <section
                  key={category.id}
                  id={`category-section-${category.id}`}
                  data-category-id={catId}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(catId, el);
                    else sectionRefs.current.delete(catId);
                  }}
                  style={{
                    scrollMarginTop: `${totalStickyOffset + 16}px`,
                  }}
                  className="space-y-4 pt-2"
                >
                  <SectionHeader
                    icon="ant-design:product-outlined"
                    iconHeight="1.35em"
                    title={category.name}
                  />

                  {categoryProducts.length > 0 ? (
                    <ProductGrid products={categoryProducts} />
                  ) : (
                    <div className="py-8 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
                      {t("home.noProducts", "No products available")}
                    </div>
                  )}
                </section>
              );
            })}

            {/* All Products Section at the LAST
                BUGFIX: previously rendered only `uncategorized` products
                (items whose categoryId matched no known category), so a
                catalog of 9 products could show just 4 here. It must show
                the FULL filtered list, matching the "All Products" tab. */}
            {filteredProductsMobile.length > 0 && (
              <section
                key="all-products-section"
                id="category-section-all-products"
                data-category-id={ALL_PRODUCTS_ID}
                ref={(el) => {
                  if (el) sectionRefs.current.set(ALL_PRODUCTS_ID, el);
                  else sectionRefs.current.delete(ALL_PRODUCTS_ID);
                }}
                style={{
                  scrollMarginTop: `${totalStickyOffset + 16}px`,
                }}
                className="space-y-4 pt-2"
              >
                <SectionHeader
                  icon="ant-design:product-outlined"
                  iconHeight="1.35em"
                  title={t("home.allProducts", "All Products")}
                  subtitle={`${filteredProductsMobile.length} ${t("navigation.products", "Products")}`}
                />
                <ProductGrid
                  products={visibleProductsMobile}
                />

                {hasMoreProductsMobile && (
                  <div className="flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={handleLoadMoreMobile}
                      className="flex w-[55%] animate-bounce transform ease-in-out items-center justify-center gap-2 rounded-xl border border-red-800 bg-red-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-[2s] hover:border-red-800 hover:bg-red-900 hover:shadow active:scale-[0.98]"
                    >
                      <Icon
                        icon="material-symbols:expand-more"
                        height="1.3em"
                      />
                      {t("home.loadMore")}
                      <span className="text-red-100 font-normal"></span>
                    </button>
                  </div>
                )}

                {!hasMoreProductsMobile &&
                  filteredProductsMobile.length > MOBILE_PAGE_SIZE && (
                    <div className="py-3 text-center text-xs text-slate-400">
                      {t("home.showingAll")}
                    </div>
                  )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
