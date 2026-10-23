import React from "react";
import { IoGift } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, } from "lucide-react";
import Badge from "../../../../client/components/common/Badge";
export default function ProductSelectCard({ product, onSelect }) {
  const { t } = useTranslation();

  const stock = Math.max(
    0,
    Number(product?.stockQuantity ?? product?.stock ?? 0) || 0,
  );

  const isOutOfStock = stock <= 0;

  const salePrice = Number(product?.salePrice ?? 0);
  const price = Number(product?.price ?? 0);
  const discountPrice = Number(product?.discountPrice ?? 0);
  const hasDiscount =
    discountPrice > 0 && price > 0 && salePrice < price;
  const discountPercentage = hasDiscount ? ((price - salePrice) / price * 100)
    : 0;

  // Hide badges that would read "-0%" — tiny discounts still show as
  // the "Save $x" row below, just without a meaningless 0% pill.
  const showDiscountBadge = hasDiscount && discountPercentage > 0;

  const handleSelect = () => {
    if (isOutOfStock) {
      return;
    }

    onSelect(product);
  };

  return (
    <div
      onClick={handleSelect}
      className={`bg-white border rounded-xl p-3 shadow-2xs flex flex-col justify-between group transition-all duration-200 w-full h-full ${
        isOutOfStock
          ? "border-slate-200 opacity-50 cursor-not-allowed"
          : "border-slate-200 hover:shadow-sm hover:border-[#870d4c]/50 cursor-pointer"
      }`}
    >
      <div className="overflow-hidden"> 
        <div className="h-32 -mx-3 -mt-3 mb-2.5 rounded-t-xl overflow-hidden relative flex items-center justify-center bg-white text-slate-400 font-bold">
          {showDiscountBadge && (
            <Badge
              variant="discount"
              size="sm"
              className="absolute top-3 left-4 z-10 rounded px-1.5 py-0.5 font-bold shadow-md"
            >
              - {discountPercentage.toFixed(2)}%
            </Badge>
          )}

          {product?.image ? (
            <img
              src={product.image}
              alt={product?.name || "Product"}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                !isOutOfStock ? "group-hover:scale-105" : ""
              }`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300">
              <ImageIcon size={40} strokeWidth={1.5} />
              <span className="text-[11px] mt-2 font-medium text-gray-400">
                {t("product.noImage")}
              </span>
            </div>
          )}
        </div>

        <span
          className={`inline-block text-[10px] px-1 py-0 rounded font-semibold ${
            isOutOfStock
              ? "bg-red-500 text-white"
              : stock <= 10
                ? "bg-yellow-500 text-white"
                : "bg-green-600 text-white"
          }`}
        >
          {isOutOfStock
            ? t("sales.outOfStock")
            : `${t("sales.stock")}: ${stock}`}
        </span>

        <h4
          className="font-medium text-slate-800 text-xs sm:text-sm mt-1 line-clamp-1"
          title={product?.name}
        >
          {product?.name}
        </h4>
      </div>

      <div className="my-1.5">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="font-bold text-green-600 text-xs sm:text-sm">
            ${salePrice.toFixed(2)}
          </span>

          {price > 0 && (
            <span className="font-normal text-slate-400 text-[11px]">
              <del>${price.toFixed(2)}</del>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 min-h-[20px]">
          {discountPrice > 0 && salePrice < price ? (
            <>
              <IoGift size={13} className="text-[#870d4c] flex-shrink-0" />

              <span className="text-[10px] font-khmer text-[#870d4c] rounded line-clamp-1">
                {t("sales.save")} ${discountPrice.toFixed(2)}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-100">
        <span
          className={`block w-full text-center text-xs py-1 rounded-md font-semibold transition-colors ${
            isOutOfStock
              ? "bg-[#fcfafb] text-slate-400 cursor-not-allowed"
              : "bg-[#870d4c] text-white hover:bg-[#9d1159]"
          }`}
        >
          {isOutOfStock ? t("sales.outOfStock") : t("common.addBtn")}
        </span>
      </div>
    </div>
  );
}
