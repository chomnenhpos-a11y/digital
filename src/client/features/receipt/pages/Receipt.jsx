import React, { useMemo, useRef, useState } from "react";
import { useLocation, useParams, Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toPng } from "html-to-image";
import { useReactToPrint } from "react-to-print";
import {
  Printer,
  FileDown,
  Share2,
  ArrowLeft,
  Loader2,
  Package,
  ReceiptText,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { usePublicSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { useOrderQuery, useOrdersQuery } from "../../../../queries/orders/useOrderQueries";

import ReceiptCard from "../components/ReceiptCard";

export default function Receipt() {
  const { t } = useTranslation();
  const { orderId: orderNo } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlShopCode = searchParams.get("shop_code");

  const receiptRef = useRef(null);
  const [loading, setLoading] = useState(null);

  const orderId = location.state?.orderId;
  const initialOrder = location.state?.orderData ?? null;

  const { data: orderResponse, isLoading: orderLoading } = useOrderQuery(
    orderId,
    initialOrder,
  );

  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery(
    urlShopCode ? { shop_code: urlShopCode } : {}
  );

  const order = useMemo(() => {
    if (initialOrder) return initialOrder;
    if (orderResponse?.data) return orderResponse.data;
    if (orderResponse) return orderResponse;
    const foundOrder = orders.find(
      (o) =>
        String(o.orderNo) === String(orderNo) ||
        String(o.orderNumber) === String(orderNo)
    );
    return foundOrder || null;
  }, [initialOrder, orderResponse, orders, orderNo]);

  const isLoading = orderLoading || (ordersLoading && !order);

  // Safe fallback chain — order is typically a flat object, but we handle all shapes
  const orderShopCode =
    order?.shop_code ||
    order?.shopCode ||
    order?.data?.shop_code ||
    order?.data?.shopCode;

  const { data: settingsData, isLoading: settingsLoading } =
    usePublicSettingsQuery(orderShopCode);

  const settings = useMemo(() => {
    if (Array.isArray(settingsData)) {
      return settingsData[0] || {};
    }

    return settingsData?.data ?? settingsData ?? {};
  }, [settingsData]);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${order?.orderNo || orderNo || "Order"}`,
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
        #client-receipt-card {
          margin: auto !important;
          border: none !important;
          box-shadow: none !important;
        }
      }
    `,
  });

  const handleSaveImage = async () => {
    if (!receiptRef.current) return;
    setLoading("img");
    try {
      await document.fonts.ready;

      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `Receipt-${order?.orderNo || orderNo || "Order"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image export failed:", err);
      Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text: t("order.downloadImgError") || "Failed to save image",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    if (!receiptRef.current) {
      return;
    }

    setLoading("share");

    try {
      const image = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const blob = await fetch(image).then((res) => res.blob());

      const file = new File(
        [blob],
        `receipt-${order?.orderNo || orderNo || "order"}.png`,
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
          title: `Receipt ${order?.orderNo || orderNo}`,
          text: "Order Receipt",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = image;
        link.download = `receipt-${order?.orderNo || orderNo || "order"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await Swal.fire({
          icon: "success",
          title: t('order.successTitle'),
          text: t('order.receiptDownloaded'),
          confirmButtonColor: "#0f172a",
        });
      }
    } catch (error) {
      console.error("Share receipt error:", error);

      if (error?.name !== "AbortError") {
        await Swal.fire({
          icon: "error",
          title: t('order.errorTitle'),
          text: t('order.cannotShareReceipt'),
          confirmButtonColor: "#0f172a",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  if (!initialOrder && isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-slate-400 mb-4" />
        <p className="text-slate-500 font-medium text-sm">
          {t('order.downloadingReceipt')}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Package size={28} />
        </div>
        <p className="text-base font-semibold text-slate-700 mb-1">
          {t("order.receiptNotFound") || "Receipt not found"}
        </p>
        <p className="text-xs text-slate-400 mb-4">
          {t("order.receiptId") || "Receipt ID"} #{orderNo}
        </p>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t("order.goBack") || "Go Back"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      <div className="bg-white mb-6 border border-slate-200 flex items-center justify-center">
        <div ref={receiptRef} className="bg-white inline-block">
          <ReceiptCard
            order={order}
            settings={settings}
            settingsLoading={settingsLoading}
          />
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
