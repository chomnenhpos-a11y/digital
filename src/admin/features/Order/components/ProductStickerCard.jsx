import React from "react";
import Barcode from "react-barcode";
import { Tag, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCategoryDisplayName } from "../../Categories/utils/categoryUtils";

export default function ProductStickerCard({ product, settings, design }) {
  const { i18n } = useTranslation();
  const shopName = settings?.shop_name || settings?.shopName || "Store";
  const rawLogo = settings?.logo;
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

  const logoUrl = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : "";

  const price = Number(product?.price || 0);
  const discountPrice = Number(product?.discountPrice || 0);

  const salePrice = Number(
    product?.salePrice ?? (discountPrice > 0 ? discountPrice : price)
  );

  const hasDiscount = salePrice < price;
  const skuCode = String(product?.sku || `PROD-${product?.id ?? "000"}`);
  const accentColor = design?.accent || "#0f172a";

  return (
    <div
      id="product-sticker-card"
      style={{
        width: "150mm",
        height: "100mm",
        minWidth: "150mm",
        minHeight: "100mm",
        maxWidth: "150mm",
        maxHeight: "100mm",
        padding: "3mm",
        borderColor: accentColor,
        fontFamily:
          "'Geist Variable', 'Kantumruy Pro Variable', 'Kantumruy Pro', 'Battambang', 'Siemreap', 'Noto Sans Khmer', sans-serif",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
        lineHeight: 1.25,
      }}
      className="mx-auto flex flex-col overflow-hidden border rounded-none bg-white text-slate-900 select-none"
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between gap-3 border-b pb-2"
        style={{ borderColor: accentColor }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-white"
            style={{ backgroundColor: accentColor }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={shopName}
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <ShoppingBag size={22} strokeWidth={2} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-base font-black leading-tight">
              {shopName}
            </h1>

            <span className="mt-1 block text-[11px] font-semibold text-slate-500">
              {getCategoryDisplayName(product, i18n.language) || "Product Tag"}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Price
          </span>

          <div className="flex items-baseline justify-end gap-2">
            {hasDiscount && (
              <span className="text-xs font-semibold tabular-nums text-slate-400 line-through">
                ${price.toFixed(2)}
              </span>
            )}

            <span
              className="text-2xl font-black leading-none tabular-nums"
              style={{ color: accentColor }}
            >
              ${salePrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Body: expands to fill remaining space */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 py-2">
        <h2 className="shrink-0 break-words text-base font-extrabold leading-snug">
          {product?.name || "Product Name"}
        </h2>

        {/* Barcode fills the available section */}
        <div className="relative min-h-0 flex-1 border border-slate-200 bg-white">
          <div
            className="absolute inset-0 flex items-center justify-center p-3
              [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
          >
            <Barcode
              value={skuCode}
              format="CODE128"
              renderer="svg"
              width={2}
              height={140}
              background="#ffffff"
              lineColor="#000000"
              margin={12}
              displayValue={true}
              fontSize={16}
              textMargin={8}
              font="monospace"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex shrink-0 items-center justify-between gap-3 border-t pt-2 text-[10px] text-slate-600"
        style={{ borderColor: accentColor }}
      >
        <div className="flex min-w-0 items-center gap-1.5 font-medium">
          <Tag size={12} className="shrink-0 text-slate-400" />

          <span className="break-all">
            SKU:{" "}
            <strong className="font-mono text-slate-900">
              {skuCode}
            </strong>
          </span>
        </div>

        <span className="shrink-0 font-bold text-slate-900">
          {settings?.phone
            ? `Tel: ${settings.phone}`
            : "Thank you for shopping!"}
        </span>
      </div>
    </div>
  );
}