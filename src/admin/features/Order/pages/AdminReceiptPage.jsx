import React, { useRef, useState, useMemo } from "react";
import Swal from "../../../../lib/alert";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Printer,
  FileDown,
  Share2,
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { createCardPng } from "../../../../utils/createCardPng";
import { useOrderQuery, useOrdersQuery } from "../../../../queries/orders/useOrderQueries";
import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { useTranslation } from "react-i18next";
import ReceiptCard from "../../../../client/features/receipt/components/ReceiptCard";
import { useAuth } from "../../../../hooks/useAuth";
import { usePrintReadyAssets } from "../../../../hooks/usePrintReadyAssets";
import { useDynamicShopBranding } from "../../../../hooks/useDynamicShopBranding";

export default function AdminReceiptPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id, No } = useParams();
  const paramId = id || No;
  const location = useLocation();
  const stateOrder = location.state?.orderData;

  const isNumeric = /^\d+$/.test(String(paramId || ""));

  // Fetch single order if param is numeric
  const {
    data: singleOrderResponse,
    isLoading: singleOrderLoading,
    isError: singleOrderError,
    error: singleOrderErr,
    refetch: refetchSingleOrder,
  } = useOrderQuery(isNumeric ? paramId : undefined);

  // Fetch orders list to look up by orderNo or string ID
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
  } = useOrdersQuery();

  // Find order from state, single query, or list query
  const order = useMemo(() => {
    if (stateOrder) return stateOrder;

    const single =
      singleOrderResponse?.data ||
      (singleOrderResponse?.id ? singleOrderResponse : null);
    if (single) return single;

    if (!paramId) return null;

    return (
      orders.find(
        (o) =>
          String(o.orderNo) === String(paramId) ||
          String(o.orderNumber) === String(paramId) ||
          String(o.id) === String(paramId)
      ) || null
    );
  }, [stateOrder, singleOrderResponse, orders, paramId]);

  const shopCode =
    user?.shop?.code ||
    order?.shop_code ||
    order?.shopCode ||
    order?.shop?.code;

  const { data: settingData, isLoading: settingsLoading } =
    useSettingsQuery(shopCode);

  const settings = useMemo(() => {
    if (Array.isArray(settingData)) return settingData[0] || {};
    return settingData?.data ?? settingData ?? {};
  }, [settingData]);

  useDynamicShopBranding(shopCode, settings);

  const printRef = useRef(null);
  const [loading, setLoading] = useState(null);

  // Asset readiness verification
  const isInitialLoading =
    Boolean(isNumeric && singleOrderLoading && !order) ||
    Boolean(ordersLoading && !order);

  const isDataReady = Boolean(order && !isInitialLoading && !settingsLoading);
  const { isReady: isPrintReady, statusMessage } = usePrintReadyAssets(
    printRef,
    isDataReady
  );

  // Direct window.print handler
  const handlePrint = () => {
    if (!isPrintReady) return;
    window.print();
  };

  const handleSaveImage = async () => {
    if (!printRef.current) return;
    setLoading("img");
    try {
      const dataUrl = await createCardPng(printRef.current, 3);
      const link = document.createElement("a");
      link.download = `Receipt-${order?.orderNo || order?.orderNumber || order?.id || "order"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image export failed:", err);
      Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text: t("order.downloadImgError") || "Download failed",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    if (!printRef.current) return;
    setLoading("share");
    try {
      const image = await createCardPng(printRef.current, 2);
      const blob = await fetch(image).then((res) => res.blob());
      const fileName = `receipt-${order?.orderNo || order?.orderNumber || order?.id || "order"}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Receipt ${order?.orderNo || order?.orderNumber || order?.id || "order"}`,
          text: "Order Receipt",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = image;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await Swal.fire({
          icon: "success",
          title: t("order.successTitle") || t("common.success"),
          text: t("order.receiptDownloaded") || "Receipt downloaded",
          confirmButtonColor: "#0f172a",
        });
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share receipt error:", error);
        await Swal.fire({
          icon: "error",
          title: t("order.errorTitle") || t("common.failed"),
          text: t("order.cannotShareReceipt") || "Cannot share receipt",
          confirmButtonColor: "#0f172a",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4 font-sans text-slate-800">
        <div className="w-full max-w-md flex items-center justify-between mb-5">
          <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="bg-white border border-slate-200 mb-6 p-5 w-full max-w-md rounded shadow-sm">
          <div className="flex flex-col items-center gap-2 pb-3 mb-3 border-b border-dashed border-slate-200">
            <div className="h-10 w-10 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center mb-2">
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-md">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
          <div className="col-span-2 md:col-span-1 h-8 bg-sky-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  const hasQueryError = (isNumeric && singleOrderError) || (ordersError && !order);
  if (hasQueryError && !order) {
    const errorMessage =
      singleOrderErr?.message || ordersErr?.message || "Failed to load order data from server.";
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {t("common.error") || "Error Loading Receipt"}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-5">{errorMessage}</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isNumeric) refetchSingleOrder();
              refetchOrders();
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCw size={15} />
            <span>{t("common.retry") || "Retry"}</span>
          </button>
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>{t("order.goBack") || "Back to Orders"}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Missing-data / Not Found state
  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 bg-[#fcfafb] rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
          <Package size={28} />
        </div>
        <p className="text-base font-semibold text-slate-700 mb-1">
          {t("order.receiptNotFound") || "Receipt not found"}
        </p>
        <p className="text-xs text-slate-400 mb-4">
          {t("order.receiptId") || "Receipt ID"} #{paramId}
        </p>
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t("order.goBack") || "Go Back"}</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      id="print-page-root"
      className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4 font-sans text-slate-800"
    >
      {/* Clean @page and @media print CSS */}
      <style>{`
        @page {
          size: auto;
          margin: 5mm;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-page-root {
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            display: block !important;
          }
          .no-print,
          .print-controls,
          header,
          nav,
          button {
            display: none !important;
            visibility: hidden !important;
          }
          #receipt-print-wrapper,
          #receipt-print-wrapper *,
          #client-receipt-card,
          #client-receipt-card * {
            visibility: visible !important;
          }
          #receipt-print-wrapper {
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            display: flex !important;
            justify-content: center !important;
          }
          #client-receipt-card {
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Receipt Card */}
      <div
        id="receipt-print-wrapper"
        className="bg-white mb-6 border border-slate-200 flex items-center justify-center shadow-xs"
      >
        <div ref={printRef} className="bg-white inline-block">
          <ReceiptCard
            order={order}
            settings={settings}
            settingsLoading={settingsLoading}
          />
        </div>
      </div>

      {/* Action Buttons: Simple 3-button layout like before */}
      <div className="no-print print-controls flex items-center justify-center gap-3 max-w-lg w-full pb-6">
        <button
          onClick={handlePrint}
          disabled={!isPrintReady}
          title={isPrintReady ? (t("order.printReceipt") || "Print") : statusMessage}
          className={`w-[104px] px-3 py-2 flex items-center justify-center rounded-lg shadow-sm transition-all cursor-pointer group ${
            isPrintReady
              ? "bg-[#0f1525] text-white hover:bg-slate-800 active:scale-95"
              : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-70"
          }`}
        >
          {!isPrintReady ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Printer
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:scale-110"
            />
          )}
        </button>

        <button
          onClick={handleSaveImage}
          disabled={loading === "img" || !isPrintReady}
          title={t("order.downloadReceipt") || "Download"}
          className="w-[104px] px-3 py-2 flex items-center justify-center bg-white text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group shadow-sm disabled:opacity-60"
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
          disabled={loading === "share" || !isPrintReady}
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
