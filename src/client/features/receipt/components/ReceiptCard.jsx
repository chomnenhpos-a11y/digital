import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ReceiptCard({ order, settings, settingsLoading }) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  // Only hide logo while sources are still loading
  const logoLoading = settingsLoading;
  const shopName = settings?.shop_name || settings?.shopName || "Store Name";
  const rawLogo = settings?.logo;
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  const logoUrl = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : "";

  const delivery = Number(order?.deliveryFee) || 0;
  const total = Number(order?.totalAmount) || 0;
  const subtotal = total - delivery;
  const discount = Number(order?.discount) || 0;
  const tax = Number(order?.tax) || 0;

  const orderItems = order?.orderDetails || order?.items || [];

  const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`;

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return "";
    if (!dateStr) return timeStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return `${dateStr} ${timeStr || ""}`;
    return `${d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })} ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })}`;
  };

  return (
    <div
      id="client-receipt-card"
      style={{
        width: "360px",
        minWidth: "360px",
        maxWidth: "360px",
        fontFamily:
          "'Geist Variable', 'Kantumruy Pro Variable', 'Kantumruy Pro', 'Battambang', 'Siemreap', 'Noto Sans Khmer', sans-serif",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
        lineHeight: "1.4",
      }}
      className="bg-white text-slate-900 mx-auto text-xs px-5 py-6 shadow-sm overflow-hidden flex flex-col print:shadow-none print:border-none print:w-full"
    >
      {/* Header section with Logo & Store Info */}
      <div className="text-center border-b border-dashed border-slate-700 pb-3 mb-3 w-full">
        {logoUrl && !imgError && !logoLoading ? (
          <img
            src={logoUrl}
            alt={shopName}
            crossOrigin="anonymous"
            className="w-14 h-14 mx-auto mb-2 object-cover rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : null}
        <h2 className="font-black text-lg tracking-wider uppercase text-slate-900 leading-tight">
          {shopName}
        </h2>
        <p className="text-xs text-slate-800 mt-1 leading-normal">
          {t("order.phone")} {settings?.phone || "xxxxxxxxx"}
        </p>
        {settings?.address && (
          <p className="text-xs text-slate-800 mt-0.5 leading-normal">
            {settings.address}
          </p>
        )}
      </div>

      {/* Order Info Section (Table layout prevents text-wrapping & line collision) */}
      <div className="border-b border-dashed border-slate-700 pb-3 mb-3 w-full">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.receiptNo")}
              </td>
              <td className="py-1 font-mono font-bold text-slate-900 text-right align-middle">
                {order?.orderNo || order?.orderNumber || `ORD-${order?.id}`}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.date")}:
              </td>
              <td className="py-1 font-mono text-slate-900 text-right align-middle">
                {formatDateTime(order?.createdAt || order?.date, order?.time)}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.seller")}:
              </td>
              <td className="py-1 font-mono text-slate-900 text-right align-middle">
                {order?.seller?.name || order?.seller?.sellerName || "—"}
              </td>
            </tr>
            {order?.customerName && (
              <tr>
                <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                  {t("order.customer")}
                </td>
                <td className="py-1 font-bold text-slate-900 text-right align-middle break-words">
                  {order.customerName}
                </td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.phone")}
              </td>
              <td className="py-1 font-mono text-slate-900 font-semibold text-right align-middle">
                {order?.customerPhone || order?.phone || "—"}
              </td>
            </tr>
            {(order?.customerAddress || order?.address) && (
              <tr>
                <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-top">
                  {t("order.addressLabel")}
                </td>
                <td className="py-1 text-slate-900 text-right align-top max-w-[190px] leading-snug break-words">
                  {order.customerAddress || order.address}
                </td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.deliveryService")}
              </td>
              <td className="py-1 font-bold text-slate-900 text-right align-middle">
                {order?.deliveryProvider?.name || order?.deliveryMethod || t("order.none")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Items Table Section */}
      <div className="mb-3 w-full border-b border-dashed border-slate-700 pb-3">
        <table className="w-full text-xs table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-900 text-slate-900 font-bold">
              <th className="text-left pb-1.5 font-bold w-[45%]">{t("order.itemCol")}</th>
              <th className="text-center pb-1.5 font-bold w-[15%]">{t("order.qtyCol")}</th>
              <th className="text-right pb-1.5 font-bold w-[20%]">{t("order.priceCol")}</th>
              <th className="text-right pb-1.5 font-bold w-[20%]">{t("order.totalCol")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderItems.length > 0 ? (
              orderItems.map((item, idx) => {
                const price = Number(item.price) || Number(item.salePrice) || 0;
                const qty = Number(item.quantity) || 0;
                return (
                  <tr key={item.id ?? idx} className="text-slate-900">
                    <td className="py-1.5 pr-1 font-medium break-words text-left align-top leading-snug">
                      {item.product_name || item.name}
                    </td>
                    <td className="py-1.5 text-center tabular-nums text-slate-700 font-medium align-top">
                      {qty}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-slate-700 align-top">
                      {formatCurrency(price)}
                    </td>
                    <td className="py-1.5 text-right tabular-nums font-bold text-slate-900 align-top">
                      {formatCurrency(price * qty)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-3 text-center text-slate-400">
                  {t("order.noItems")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Totals Section (Table layout prevents text-wrapping & line collision) */}
      <div className="mb-3 border-b border-dashed border-slate-700 pb-3 text-xs text-slate-800 w-full">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.subtotalLabel")}
              </td>
              <td className="py-1 tabular-nums font-medium text-slate-900 text-right align-middle">
                {formatCurrency(subtotal)}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                {t("order.deliveryFeeLabel")}
              </td>
              <td className="py-1 tabular-nums font-medium text-slate-900 text-right align-middle">
                {formatCurrency(delivery)}
              </td>
            </tr>
            {discount > 0 && (
              <tr>
                <td className="py-1 text-green-600 font-medium whitespace-nowrap text-left align-middle">
                  {t("order.discountLabel") || "Discount"}
                </td>
                <td className="py-1 tabular-nums font-medium text-green-600 text-right align-middle">
                  -{formatCurrency(discount)}
                </td>
              </tr>
            )}
            {tax > 0 && (
              <tr>
                <td className="py-1 text-slate-900 font-medium whitespace-nowrap text-left align-middle">
                  {t("order.taxLabel") || "Tax"}
                </td>
                <td className="py-1 tabular-nums font-medium text-slate-900 text-right align-middle">
                  {formatCurrency(tax)}
                </td>
              </tr>
            )}
            <tr className="border-t border-slate-900">
              <td className="pt-2 text-slate-900 font-black text-sm whitespace-nowrap text-left align-middle">
                {t("order.totalLabel")}
              </td>
              <td className="pt-2 tabular-nums font-black text-slate-950 text-base text-right align-middle">
                {formatCurrency(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Message */}
      <div className="text-center pt-1 pb-1 w-full">
        <p className="text-xs font-bold text-slate-900 leading-normal">
          {t("order.thankYouReceipt")}
        </p>
        <p className="text-[11px] text-slate-800 font-medium leading-normal mt-0.5">
          {t("order.comeAgain")}
        </p>
      </div>
    </div>
  );
}
