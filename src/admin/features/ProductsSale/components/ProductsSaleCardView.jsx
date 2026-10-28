import React from "react";
import { Package, Receipt, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatSaleDate, formatSaleAmount } from "../schemas/productsaleSchemas";

function Card({ row }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-[#870d4c]/10 flex items-center justify-center">
            <Package size={16} className="text-[#870d4c]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 truncate">
              {row.product_name || "-"}
            </h4>
            <p className="text-[11px] text-slate-400">
              ID #{row.product_id}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-bold text-[#0d874c]">
          {formatSaleAmount(row.total_price)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <p className="text-slate-400 mb-0.5">
            {t("productsSale.quantity") || "Quantity"}
          </p>
          <p className="font-semibold text-slate-700">{row.quantity}</p>
        </div>
        <div>
          <p className="text-slate-400 mb-0.5">
            {t("productsSale.price") || "Price"}
          </p>
          <p className="font-semibold text-slate-700">{formatSaleAmount(row.price)}</p>
        </div>
        <div className="col-span-2 flex items-start gap-1.5">
          <Receipt size={13} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-slate-400 mb-0.5">
              {t("productsSale.orderNo") || "Order No"}
            </p>
            <p className="font-medium text-slate-700 truncate" title={row.order_no}>
              {row.order_no || "-"}
            </p>
          </div>
        </div>
        <div className="col-span-2 flex items-start gap-1.5">
          <User size={13} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-slate-400 mb-0.5">
              {t("productsSale.seller") || "Seller"}
            </p>
            <p className="font-medium text-slate-700 truncate">
              {row.seller_name || "-"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        {formatSaleDate(row.sale_date)}
      </p>
    </div>
  );
}

/**
 * Card layout alternative to the sales table (toggled by the "Card" button).
 */
export default function ProductsSaleCardView({ rows, isLoading, emptyLabel }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse"
          >
            <div className="flex gap-2 mb-3">
              <div className="w-9 h-9 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-sm text-slate-500">
        {emptyLabel ||
          t("productsSale.emptyMessage") ||
          "No product sales found for the selected window."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rows.map((row) => (
        <Card key={row._key} row={row} />
      ))}
    </div>
  );
}
