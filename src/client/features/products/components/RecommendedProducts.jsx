import React from "react"
import HorizontalProductGrid from "./HorizontalProductGrid"
import { useTranslation } from "react-i18next";

export default function RecommendedProducts({
  products = [],
  currentProduct = {},
}) {
  const { t } = useTranslation();
  const currentCatId = currentProduct?.categoryId
  const currentCatName = currentProduct?.categoryName

  const recommendedProducts = products
    .filter(
      (product) =>
        Number(product.id) !== Number(currentProduct.id) &&
        ((currentCatId && product.categoryId === currentCatId) ||
         (currentCatName && product.categoryName === currentCatName))
    )
    .slice(0, 10)

  if (recommendedProducts.length === 0) {
    return null
  }

  return (
    <section className="w-full border-t border-slate-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
          {t('product.relatedProducts')}
        </h2>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {t('product.itemsCount', { count: recommendedProducts.length })}
        </span>
      </div>

      {/* Single-row horizontal scroll with left/right buttons and progress bar */}
      <HorizontalProductGrid products={recommendedProducts} />
    </section>
  )
}