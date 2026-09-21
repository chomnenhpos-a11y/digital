import React, { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Printer,
  FileDown,
  Send,
  ArrowLeft,
  Loader2,
  Package,
  ReceiptText,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toPng } from "html-to-image";
import { useOrdersQuery } from "../../../../queries/orders/useOrderQueries";
import { sendOrderToTelegram } from "../../../../services/telegramService";
import { useSettingByIdQuery } from "../../../../queries/settings/useSettingQueries";
import { useTranslation } from "react-i18next";

import ReceiptCard from "../../../../client/features/receipt/components/ReceiptCard";

export default function AdminReceiptPage() {
  const { t } = useTranslation();
  const { No: paramNo } = useParams();
  const location = useLocation();
  const stateOrder = location.state?.orderData;
  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery();
  const foundOrder = orders?.find(
    (o) =>
      String(o.orderNo) === String(paramNo) ||
      String(o.orderNumber) === String(paramNo),
  );
  const order = foundOrder || stateOrder;

  const { data: settingsResponse, isLoading: settingsLoading } = useSettingByIdQuery(order?.settingId);
  const settings = settingsResponse?.data ?? settingsResponse;
  const printRef = useRef(null);
  const [loading, setLoading] = useState(null);

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

  if (ordersLoading && !order) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4">
        {/* Back button skeleton */}
        <div className="w-full max-w-md flex items-center justify-between mb-5">
          <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        {/* Receipt card skeleton */}
        <div className="bg-white border border-slate-200 mb-6 p-5 w-full max-w-md rounded">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 pb-3 mb-3 border-b border-dashed border-slate-200">
            <div className="h-10 w-10 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
          {/* Info rows */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center mb-2">
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
          {/* Items table */}
          <div className="border-t border-dashed border-slate-200 pt-3 mt-3 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-14 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="border-t border-dashed border-slate-200 pt-3 mt-3 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-md">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
          <div className="col-span-2 md:col-span-1 h-8 bg-sky-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-[#fcfafb] rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Package size={28} />
        </div>
        <p className="text-base font-semibold text-slate-700 mb-1">
          {t("order.receiptNotFound")}
        </p>
        <p className="text-xs text-slate-400 mb-4">
          {t("order.receiptId")} #{paramNo}
        </p>
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t("order.goBack")}</span>
        </Link>
      </div>
    );
  }

  const handleSaveImage = async () => {
    if (!printRef.current) return;
    setLoading("img");
    try {
      await document.fonts.ready;

      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `Receipt-${order.orderNo || order.orderNumber || order.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image export failed:", err);
      Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text: t("order.downloadImgError"),
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSendTelegram = async () => {
    setLoading("telegram");

    try {
      await sendOrderToTelegram({
        ...order,
        chat_id: settings?.chat_id || order?.chat_id,
        shopCode: order?.shopCode || order?.shop_code || order?.shop?.code || settings?.shop_code
      });

      Swal.fire({
        icon: "success",
        title: t("common.success"),
        text: t("order.receiptSentToTelegram"),
        confirmButtonColor: "#0284c7",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Telegram error:", error);

      Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text: error.message || t("order.telegramSendError"),
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      <div className="w-full max-w-md flex items-center justify-between mb-5">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white px-3 py-0.5 rounded-lg shadow-xs border border-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{t("order.goBack")}</span>
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-200/70 px-2.5 py-1 rounded">
          <ReceiptText size={14} />
          <span>{t("order.receiptSize")} (Receipt)</span>
        </span>
      </div>

      <div className="bg-white mb-6 border border-slate-200 flex items-center justify-center">
        <div ref={printRef} className="bg-white inline-block">
          <ReceiptCard order={order} settings={settings} settingsLoading={settingsLoading} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg w-full pt-1">
        <button
          onClick={handlePrint}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-md md:rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all text-xs font-semibold shadow-xs cursor-pointer group"
        >
          <Printer
            size={14}
            className="transition-transform group-hover:-translate-y-0.5"
          />
          <span>{t("order.printReceipt")}</span>
        </button>

        <button
          onClick={handleSaveImage}
          disabled={loading === "img"}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-md md:rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98] transition-all text-xs font-semibold shadow-2xs disabled:opacity-60 cursor-pointer group"
        >
          {loading === "img" ? (
            <Loader2 size={14} className="animate-spin text-slate-900" />
          ) : (
            <FileDown
              size={14}
              className="transition-transform group-hover:translate-y-0.5 text-slate-500 group-hover:text-slate-900"
            />
          )}
          <span>
            {loading === "img" ? t("order.saving") : t("order.downloadReceipt")}
          </span>
        </button>

        <button
          onClick={handleSendTelegram}
          disabled={loading === "telegram"}
          className="w-full sm:w-auto md:flex-1 min-w-[160px] flex items-center justify-center gap-1.5 bg-sky-600 text-white px-4 py-1.5 rounded-md md:rounded-lg hover:bg-sky-500 active:scale-[0.98] transition-all text-xs font-semibold shadow-xs disabled:opacity-60 cursor-pointer group"
        >
          {loading === "telegram" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
          <span>
            {loading === "telegram"
              ? t("order.sending")
              : t("order.sendToTelegram")}
          </span>
        </button>
      </div>
    </div>
  );
}
