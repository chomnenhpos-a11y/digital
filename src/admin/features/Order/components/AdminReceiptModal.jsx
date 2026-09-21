import React, { useRef, useState } from "react";
import { X, Printer, Package } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { useSettingByIdQuery } from "../../../../queries/settings/useSettingQueries";

export default function AdminReceiptModal({ isOpen, onClose, order }) {
  const { t } = useTranslation();
  const { data: settingsResponse, isLoading: settingsLoading } = useSettingByIdQuery(order?.settingId);
  const settings = settingsResponse?.data ?? settingsResponse;
  
  const printRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt-${order?.orderNo || order?.orderNumber || order?.id || "order"}`,
    pageStyle: `
      @page { 
        size: auto; 
        margin: 10mm; 
      }
      @media print { 
        html, body { 
          width: 100%;
          height: 100%;
          margin: 0 !important; 
          padding: 0 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
        }
        #admin-receipt-card {
          margin: auto !important;
          border: none !important;
          box-shadow: none !important;
        }
      }
    `,
  });

  if (!isOpen || !order) return null;

  const delivery = Number(order?.deliveryFee) || 0;
  const total = Number(order?.totalAmount) || 0;
  const subtotal = total - delivery;
  const orderItems = order?.orderDetails || order?.items || [];

  const shopName = settings?.shop_name || settings?.shopName || "Shop Name";
  const rawLogo = settings?.logo;
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  const logoUrl = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#fcfafb] rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Package size={18} />
            {t("order.receiptSize", "Receipt")}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-50">
          <div ref={printRef} className="bg-white">
            <div
              id="admin-receipt-card"
              style={{
                width: "340px",
                fontFamily: "'Geist Variable', 'Battambang', 'Siemreap', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeLegibility",
              }}
              className="bg-white text-slate-900 mx-auto text-xs px-5 py-6 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="text-center border-b border-dashed border-slate-800 pb-3 mb-3 w-full">
                {logoUrl && !settingsLoading ? (
                  <img
                    src={logoUrl}
                    alt={shopName}
                    className="h-10 mx-auto mb-2 object-contain rounded-md"
                  />
                ) : null}
                <h2 className="font-black text-base tracking-wider uppercase text-slate-900 leading-tight">
                  {shopName}
                </h2>
                <p className="text-[11px] text-slate-900 mt-1">
                  {t("order.phone")} {settings?.phone || "—"}
                </p>
                <p className="text-[11px] text-slate-900">{settings?.address || ""}</p>
              </div>

              <div className="text-[11px] space-y-1.5 mb-3 flex flex-col border-b border-dashed border-slate-800 pb-3 text-slate-700 w-full">
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-slate-900">{t("order.receiptNo")}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {order?.orderNo || order?.orderNumber || `ORD-${order?.id}`}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-slate-900">{t("order.date")}</span>
                  <span className="font-mono text-slate-800">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : order?.date || ""}{" "}
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleTimeString()
                      : order?.time || ""}
                  </span>
                </div>
                {order?.customerName && (
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium text-slate-900">{t("order.customer")}</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">
                      {order.customerName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-slate-900">{t("order.phone")}</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {order?.customerPhone || order?.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-slate-900">{t("order.deliveryService")}</span>
                  <span className="font-bold text-slate-900">
                    {order?.deliveryProvider?.name || order?.deliveryMethod || t("order.none")}
                  </span>
                </div>
                {(order?.customerAddress || order?.address) && (
                  <div className="flex justify-between items-start w-full">
                    <span className="font-medium text-slate-900 shrink-0">
                      {t("order.addressLabel")}
                    </span>
                    <span className="text-slate-800 text-right truncate max-w-[190px]">
                      {order.customerAddress || order.address}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-3 w-full border-b border-dashed border-slate-800 pb-3">
                <table className="w-full text-[11px] table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-900 font-bold">
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
                          <tr key={item.id ?? idx} className="text-slate-800">
                            <td className="py-1.5 pr-1 font-medium break-words text-left align-top leading-snug">
                              {item.product_name || item.name}
                            </td>
                            <td className="py-1.5 text-center tabular-nums text-slate-600 font-semibold align-top">
                              {qty}
                            </td>
                            <td className="py-1.5 text-right tabular-nums text-slate-600 align-top">
                              ${price.toFixed(2)}
                            </td>
                            <td className="py-1.5 text-right tabular-nums font-bold text-slate-900 align-top">
                              ${(price * qty).toFixed(2)}
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

              <div className="space-y-1.5 pb-3 mb-3 border-b border-dashed border-slate-800 text-[11px] text-slate-700 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900">{t("order.subtotalLabel")}</span>
                  <span className="tabular-nums font-medium text-slate-800">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-900">{t("order.deliveryFeeLabel")}</span>
                  <span className="tabular-nums font-medium text-slate-800">
                    ${delivery.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-sm font-bold text-slate-900">
                  <span>{t("order.totalLabel")}</span>
                  <span className="tabular-nums font-black text-slate-950">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-0.5 pt-0.5 w-full">
                <p className="text-[11px] font-bold text-slate-900">
                  {t("order.thankYouReceipt")}
                </p>
                <p className="text-[10px] text-slate-900 font-medium tracking-wide uppercase">
                  {t("order.comeAgain")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-4 bg-slate-900 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Printer size={18} />
            {t("order.printReceipt", "Print")}
          </button>
        </div>
      </div>
    </div>
  );
}
