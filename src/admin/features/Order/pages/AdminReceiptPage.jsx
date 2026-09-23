import React, { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Printer,
  FileDown,
  Share2,
  ArrowLeft,
  Loader2,
  Package,
  ReceiptText,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toPng } from "html-to-image";
import { useOrdersQuery } from "../../../../queries/orders/useOrderQueries";

import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { useTranslation } from "react-i18next";

import ReceiptCard from "../../../../client/features/receipt/components/ReceiptCard";
import { useAuth } from "../../../../hooks/useAuth";

export default function AdminReceiptPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

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

  const shopCode = user?.shop?.code ;
console.log("jellp", shopCode);

  const { data: settingData, isLoading: settingsLoading } = useSettingsQuery(shopCode);
  
  const settings = Array.isArray(settingData) ? settingData[0] || {} : settingData?.data ?? settingData ?? {};
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

  const handleShare = async () => {
    if (!printRef.current) {
      return;
    }

    setLoading("share");

    try {
      const image = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const blob = await fetch(image).then((res) => res.blob());

      const file = new File(
        [blob],
        `receipt-${order?.orderNo || order?.orderNumber || order?.id || "order"}.png`,
        {
          type: "image/png",
        },
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title: `Receipt ${order?.orderNo || order?.orderNumber || order?.id || "order"}`,
          text: "Order Receipt",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = image;
        link.download = `receipt-${order?.orderNo || order?.orderNumber || order?.id || "order"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await Swal.fire({
          icon: "success",
          title: t('order.successTitle') || t("common.success"),
          text: t('order.receiptDownloaded') || "Receipt downloaded",
          confirmButtonColor: "#0f172a",
        });
      }
    } catch (error) {
      console.error("Share receipt error:", error);

      if (error?.name !== "AbortError") {
        await Swal.fire({
          icon: "error",
          title: t('order.errorTitle') || t("common.failed"),
          text: t('order.cannotShareReceipt') || "Cannot share receipt",
          confirmButtonColor: "#0f172a",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      <div className="bg-white mb-6 border border-slate-200 flex items-center justify-center">
        <div ref={printRef} className="bg-white inline-block">
          <ReceiptCard order={order} settings={settings} settingsLoading={settingsLoading} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 max-w-lg w-full pb-6">
        <button
          onClick={handlePrint}
          title={t("order.printReceipt") || "Print"}
          className="w-[104px] px-3 py-2 flex items-center justify-center bg-[#0f1525] text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all cursor-pointer group shadow-sm"
        >
          <Printer
            size={18}
            strokeWidth={1.5}
            className="transition-transform group-hover:scale-110"
          />
        </button>

        <button
          onClick={handleSaveImage}
          disabled={loading === "img"}
          title={t("order.downloadReceipt") || "Download"}
          className="w-[104px] px-3 py-2 flex items-center justify-center bg-white text-slate-500 border border-slate-180/80 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group shadow-sm disabled:opacity-60"
        >
          {loading === "img" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileDown
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:scale-110"
            />
          )}
        </button>

        <button
          onClick={handleShare}
          disabled={loading === "share"}
          title={t("order.shareReceipt") || "Share"}
          className="w-[104px] px-3 py-2 flex items-center justify-center bg-[#831843] text-white rounded-lg hover:bg-[#6c1236] active:scale-95 transition-all cursor-pointer group shadow-sm disabled:opacity-60"
        >
          {loading === "share" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Share2
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:scale-110"
            />
          )}
        </button>
      </div>
    </div>
  );
}
