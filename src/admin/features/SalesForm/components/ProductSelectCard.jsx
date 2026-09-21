import React from "react";
import { IoGift } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function ProductSelectCard({ product, onSelect }) {
  const { t } = useTranslation();

  const stock = Math.max(
    0,
    Number(product?.stockQuantity ?? product?.stock ?? 0) || 0
  );

  const isOutOfStock = stock <= 0;

  const salePrice = Number(product?.salePrice ?? 0);
  const price = Number(product?.price ?? 0);
  const discountPrice = Number(product?.discountPrice ?? 0);

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
      <div>
        <div className="h-32 -mx-3 -mt-3 mb-2.5 rounded-t-xl overflow-hidden flex items-center justify-center bg-white text-slate-400 font-bold">
          {product?.image ? (
            <img
              src={product.image}
              alt={product?.name || "Product"}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                !isOutOfStock ? "group-hover:scale-105" : ""
              }`}
            />
          ) : (
            <span className="text-xl">📦</span>
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
              <IoGift
                size={13}
                className="text-[#870d4c] flex-shrink-0"
              />

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
          {isOutOfStock
            ? t("sales.outOfStock")
            : t("common.addBtn")}
        </span>
      </div>
    </div>
  );
}