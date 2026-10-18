import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";

import { Icon } from "@iconify/react";

import FilterTabs from "../../../components/common/FilterTabs";
import SectionHeader from "../../../components/common/SectionHeader";

import ProductGrid from "../../products/components/ProductGrid";

import ProductSkeletonGrid from "../../../components/common/ProductSkeletonGrid";
import FilterTabsSkeleton from "../../../components/common/FilterTabsSkeleton";

import { useSearch } from "../../../../context/SearchContext";

import { useBestSellers } from "../../../../hooks/useBestSellers";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 8;

export default function ProductSection({ allProductsRef, bestSellerRules }) {
  const { t } = useTranslation();
  const { shop_code } = useParams();

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

  const [activeTab, setActiveTab] = useState("ALL_CATEGORIES");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isProductLoading =
    isProductsPending || isCategoriesPending;

  const isSearching =
    searchItem.trim() !== "" ||
    priceRange !== "all";

  const isCategoryFiltered =
    activeTab !== "ALL_CATEGORIES";

  const tabs = useMemo(() => {
    return [
      {
        id: "ALL_CATEGORIES",
        name: t('home.all'),
        image: null,
      },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image || null,
      })),
    ];
  }, [categories, t]);

  const matchPriceRange = useCallback((price) => {
    const numPrice = Number(price) || 0;

    if (priceRange === "under-20") {
      return numPrice < 20;
    }

    if (priceRange === "20-50") {
      return (
        numPrice >= 20 &&
        numPrice <= 50
      );
    }

    if (priceRange === "50-100") {
      return (
        numPrice > 50 &&
        numPrice <= 100
      );
    }

    if (priceRange === "over-100") {
      return numPrice > 100;
    }

    return true;
  }, [priceRange]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);

    if (tab === "ALL_CATEGORIES") {
      setTimeout(() => {
        if (!allProductsRef?.current) {
          return;
        }

        const headerOffset = 100;

        const elementPosition =
          allProductsRef.current.getBoundingClientRect().top;

        const offsetPosition =
          elementPosition +
          window.pageYOffset -
          headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 50);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!productsWithBadges.length) {
      return [];
    }

    return productsWithBadges
      .filter((product) => {
        if (activeTab === "ALL_CATEGORIES") {
          return true;
        }

        return Number(product.categoryId) === Number(activeTab);
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
        matchPriceRange(
          product.salePrice ??
            product.price ??
            0
        )
      );
  }, [
    productsWithBadges,
    activeTab,
    searchItem,
    matchPriceRange,
  ]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(
      0,
      visibleCount
    );
  }, [
    filteredProducts,
    visibleCount,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    activeTab,
    searchItem,
    priceRange,
  ]);

  const hasMoreProducts =
    visibleCount <
    filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(
        prev + PAGE_SIZE,
        filteredProducts.length
      )
    );
  };

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

          {t('home.searchByCategory')}
        </h2>

        {isCategoriesPending ? (
          <FilterTabsSkeleton count={6} />
        ) : (
          <FilterTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        )}
      </div>
      <section
        ref={allProductsRef}
        className="scroll-mt-24"
      >
        <SectionHeader
          icon="ant-design:product-outlined"
          iconHeight="1.5em"
          title={
            isCategoryFiltered
              ? t('home.categoryProducts', { category: tabs.find(t => t.id === activeTab)?.name || activeTab })
              : isSearching
                ? t('home.searchResults', { count: filteredProducts.length })
                : t('home.allProducts')
          }
        />

        {isProductLoading ? (
          <ProductSkeletonGrid count={8} />
        ) : (
          <>
            <ProductGrid
              products={visibleProducts}
            />

            {hasMoreProducts && (
              <div className="flex justify-center pt-5">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-800 text-white bg-red-700 px-4 py-2 text-sm font-medium  shadow-sm transition-all duration-400 animate-bounce hover:border-red-800 hover:bg-red-900 hover:shadow active:scale-[0.98]"
                >
                  <Icon
                    icon="material-symbols:expand-more"
                    height="1.3em"
                  />
                  {t('home.loadMore')}
                </button>
              </div>
            )}

            {!hasMoreProducts &&
              filteredProducts.length > 0 && (
                <div className="py-4 text-center text-sm text-slate-400">
                  {t('home.showingAll')}
                </div>
              )}

            {!visibleProducts.length && (
              <div className="py-10 text-center text-sm text-slate-400">
                {t('home.noProducts')}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
