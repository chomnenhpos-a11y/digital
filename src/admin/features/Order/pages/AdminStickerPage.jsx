import React, { useRef, useState, useEffect } from "react";

import Swal from "sweetalert2";

import { useParams, useNavigate, Link } from "react-router-dom";

import {
  Printer,
  Download,
  Send,
  ShoppingBag,
  Phone,
  User,
  MapPin,
  Tag,
  Bike,
  Receipt,
  ArrowLeft,
  Loader2,
  Package,
  FileWarning,
  Globe,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

import { useReactToPrint } from "react-to-print";
import { toPng } from "html-to-image";
import { useTranslation } from "react-i18next";

import { useOrdersQuery } from "../../../../queries/orders/useOrderQueries";
import { sendStickerToTelegram } from "../../../../services/telegramService";
import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { useDeliveryProvidersQuery } from "../../../../queries/deliveryProviders/useDeliveryProviderQueries";
import { useAuth } from "@/hooks/useAuth";

function AdminStickerCard({ order, courier, setCourier }) {
  const socialIconMap = {
    "telegram": <FaTelegramPlane size={16} className="text-white" />,
    "facebook": <FaFacebookF size={16} className="text-white" />,
    "tiktok": <FaTiktok size={16} className="text-white" />,
    "instagram": <FaInstagram size={16} className="text-white" />,
    "twitter": <FaTwitter size={16} className="text-white" />,
    "youtube": <FaYoutube size={16} className="text-white" />,
    "linkedin": <FaLinkedinIn size={16} className="text-white" />,
    "website": <Globe size={16} className="text-white" />,
    "fa-telegram": <FaTelegramPlane size={16} className="text-white" />,
    "fa-facebook": <FaFacebookF size={16} className="text-white" />,
    "fa-tiktok": <FaTiktok size={16} className="text-white" />,
    "fa-instagram": <FaInstagram size={16} className="text-white" />,
    "fa-twitter": <FaTwitter size={16} className="text-white" />,
    "fa-youtube": <FaYoutube size={16} className="text-white" />,
    "fa-linkedin": <FaLinkedinIn size={16} className="text-white" />,
    "fa-globe": <Globe size={16} className="text-white" />,
  };

  const { t } = useTranslation();
  const { user } = useAuth();

  const shopCode = user?.shop?.code;

  const { data: settingData } = useSettingsQuery(shopCode);
  const [imgError, setImgError] = useState(false);
  const shopName = settingData?.shop_name || "N/A";
  const socialMedia = Array.isArray(settingData?.social_media)
    ? settingData.social_media[0]
    : null;

  const socialMediaTitle = socialMedia?.title || "";
  const socialMediaIcon = socialMedia?.icon || "";
  const shopPhone = settingData?.phone;
  const rawLogo = settingData?.logo;
  const qrCode = settingData?.qr_upload || "";
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

  const logoUrl = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : "";

  const qrCodeUrl = qrCode
    ? qrCode.startsWith("http")
      ? qrCode
      : `${baseUrl}${qrCode.startsWith("/") ? "" : "/"}${qrCode}`
    : "";

  const delivery = Number(order?.deliveryFee) || 0;

  const total = Number(order?.totalAmount) || 0;

  const subtotal = total - delivery;

  const { data: providers } = useDeliveryProvidersQuery();

  const dynamicCouriers =
    providers
      ?.filter((p) => p.status === "Active" || p.status === undefined)
      .map((p) => p.name) || [];

  const couriers =
    dynamicCouriers.length > 0
      ? dynamicCouriers
      : [
          t("order.courier1"),
          "J&T Express",
          t("order.courier2"),
          t("order.courier3"),
        ];

  return (
    <div
      id="admin-sticker-card"
      style={{
        minHeight: "385px",
        fontFamily:
          "'Geist Variable', 'Battambang', 'Siemreap', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
      className="bg-white border-2 border-slate-900 rounded-xl p-4 text-slate-900 select-none mx-auto flex flex-col justify-between w-full md:w-[580px] print:w-[580px]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row print:flex-row items-start md:items-center print:items-center justify-between pb-2.5 border-b-2 border-slate-900 gap-3 md:gap-0 print:gap-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 text-white rounded-md overflow-hidden flex items-center justify-center">
            {logoUrl && !imgError ? (
              <img
                src={logoUrl}
                alt={shopName}
                className="w-10 h-10 object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <ShoppingBag size={20} strokeWidth={2.5} />
            )}
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-600 block leading-tight">
              Have a good day!
            </span>

            <h1 className="font-black text-xl tracking-wider text-slate-900 leading-none">
              {shopName}
            </h1>
          </div>
        </div>

        {/* Shop phone + social icons */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-800 bg-[#fcfafb] px-3 py-1.5 rounded-md border border-slate-300">
          <div className="flex items-center gap-1.5">
            <Phone size={13} className="text-slate-900" />
            <span>{shopPhone || "—"}</span>
          </div>
          {socialMedia && (
            <>
              <span className="text-slate-400">|</span>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                  {socialIconMap[socialMediaIcon] ?? (
                    <Globe size={4} className="text-white" />
                  )}
                </div>
                <span className="font-bold text-slate-900">
                  {socialMediaTitle}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:grid md:grid-cols-12 print:grid print:grid-cols-12 gap-2.5 my-2.5 flex-1 items-stretch">
        {/* Left */}
        <div className="md:col-span-7 print:col-span-7 flex flex-col gap-2 justify-between">
          <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid md:grid-cols-2 print:grid-cols-2 gap-2">
            {/* Sender */}
            <div className="border border-slate-800 rounded-lg p-2.5 bg-[#fcfafb]/60 flex flex-col justify-center">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                <User size={12} />
                {t("order.sender")}
              </div>

              <p className="font-bold text-xs text-slate-900 truncate">
                {order?.shop?.name || shopName}
              </p>

              <p className="text-[11px] text-slate-700 font-semibold">
                {shopPhone || order?.shop?.phone || "—"}
              </p>
            </div>

            {/* Receiver */}
            <div className="border border-slate-800 rounded-lg p-2.5 bg-[#fcfafb]/60 flex flex-col justify-center">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                <Phone size={12} />
                {t("order.receiver")}
              </div>

              <p className="font-bold text-xs text-slate-900 truncate">
                {order?.customerName && order.customerName !== 'N/A' 
                  ? order.customerName 
                  : t("order.generalCustomer")}
              </p>

              <p className="text-[11px] font-bold text-slate-900 tracking-wide">
                {order?.customerPhone || order?.phone || "—"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="border border-slate-800 rounded-lg p-2.5 flex-1 flex flex-col justify-start bg-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <MapPin size={13} className="text-slate-900" />
                {t("order.deliveryAddress")}
              </div>

              <div className="text-[10px] font-bold text-[#9d1159] bg-[#870d4c]/5 px-2 py-0.5 rounded border border-[#870d4c]/10">
                {order?.deliveryProvider?.name ||
                  order?.deliveryMethod ||
                  t("order.none")}
              </div>
            </div>

            <p className="font-medium text-xs text-slate-800 leading-relaxed border border-slate-100 p-1.5 rounded bg-[#fcfafb]">
              {order?.customerAddress || order?.address || t("order.noAddress")}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="md:col-span-5 print:col-span-5 flex flex-col gap-2 justify-between">
          {/* KHQR */}
          <div className="border border-slate-800 rounded-lg overflow-hidden flex flex-col items-center bg-white">
            <div className="w-full bg-slate-900 text-white text-center py-1 text-[10px] font-black tracking-widest uppercase">
              KHQR PAYMENT
            </div>

            <div className="p-2 flex items-center justify-center bg-white">
              <img
                src={qrCodeUrl || "null"}
                alt="KHQR QR Code"
                className="w-16 h-16 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Price */}
          <div className="border border-slate-800 rounded-lg p-2.5 bg-[#fcfafb]/60 flex flex-col justify-center gap-1.5 text-xs">
            <div className="flex justify-between items-center bg-[#fcfafb] p-1.5 rounded border border-slate-100 text-[11px]">
              <span className="flex items-center gap-1 font-bold">
                <Tag size={12} />
                {t("order.items")}
              </span>

              <span className="font-bold text-slate-800">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#fcfafb] p-1.5 rounded border border-slate-100 text-[11px]">
              <span className="flex items-center gap-1 font-bold">
                <Bike size={12} />
                {t("order.shipping")}
              </span>

              <span className="font-bold text-slate-800">
                ${delivery.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#870d4c]/5/50 p-1.5 rounded border border-[#870d4c]/10 text-slate-950 font-black text-xs">
              <span className="flex items-center gap-1">
                <Receipt size={13} />
                {t("order.total")}
              </span>

              <span className="text-sm font-black text-slate-950">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row print:flex-row items-center justify-between pt-2 border-t-2 border-slate-900 text-xs gap-3 md:gap-0 print:gap-0">
        <div className="flex flex-wrap items-center justify-center md:justify-start print:justify-start gap-2">
          {couriers.map((c) => {
            const isSelected = courier === c;

            return (
              <button
                type="button"
                key={c}
                onClick={() => setCourier(c)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all text-[11px] font-bold ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-white bg-white" : "border-slate-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  )}
                </div>

                <span>{c}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-black tracking-wide text-slate-900">
          {t("order.thankYouSticker")}
        </p>
      </div>
    </div>
  );
}

export default function AdminStickerPage() {
  const { t } = useTranslation();

  const { id: paramNo } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery();

  const order = orders?.find(
    (o) =>
      String(o.orderNo) === String(paramNo) ||
      String(o.orderNumber) === String(paramNo) ||
      String(o.id) === String(paramNo),
  );

  const printRef = useRef(null);

  const [loading, setLoading] = useState(null);

  const [courier, setCourier] = useState(t("order.courier1"));

  const handlePrint = useReactToPrint({
    contentRef: printRef,

    documentTitle: `Sticker-${
      order?.orderNo || order?.orderNumber || order?.id || "sticker"
    }`,

    pageStyle: `
      @page {
        size: 150mm 100mm landscape;
        margin: 0;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        #admin-sticker-card {
          margin: auto !important;
        }
      }
    `,
  });

  useEffect(() => {
    if (order) {
      const deliveryName =
        order?.deliveryProvider?.name || order?.deliveryMethod;

      if (deliveryName) {
        setCourier(deliveryName);
      }
    }
  }, [order]);

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4">
        {/* Top bar skeleton */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-5">
          <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-[#870d4c]/10 rounded-lg animate-pulse" />
        </div>
        {/* Sticker card skeleton */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 w-full max-w-2xl mb-6 animate-pulse">
          {/* Header row */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-2 border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-slate-200 rounded-md" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-8 w-36 bg-slate-100 rounded-md" />
          </div>
          {/* Body grid */}
          <div className="grid grid-cols-12 gap-2.5 my-2.5">
            {/* Left */}
            <div className="col-span-7 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 bg-slate-100 rounded-lg" />
                <div className="h-20 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-24 bg-slate-50 rounded-lg" />
            </div>
            {/* Right */}
            <div className="col-span-5 flex flex-col gap-2">
              <div className="h-28 bg-slate-100 rounded-lg" />
              <div className="h-28 bg-slate-50 rounded-lg" />
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t-2 border-slate-100">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        </div>
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-2xl">
          <div className="h-8 bg-[#870d4c]/20 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="col-span-2 md:col-span-1 h-8 bg-sky-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center justify-center py-20">
        <FileWarning size={48} className="text-slate-300 mb-4" />

        <p className="text-base font-semibold text-slate-600 mb-4">
          {t("order.stickerNotFound")}
        </p>

        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium text-sm shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} />
          <span>{t("order.goBack")}</span>
        </button>
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

      link.download = `Sticker-${
        order.orderNo || order.orderNumber || order.id
      }.png`;

      link.href = dataUrl;

      link.click();
    } catch (err) {
      console.error("Export failed:", err);

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
      await sendStickerToTelegram({
        ...order,
        shopCode: order?.shopCode || order?.shop_code || order?.shop?.code || user?.shop?.code
      }, courier);

      Swal.fire({
        icon: "success",
        title: t("common.success"),
        text: t("order.sentToTelegram"),
        confirmButtonColor: "#0284c7",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text: err.message || t("order.telegramSendError"),
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      <div className="w-full max-w-2xl flex items-center justify-between mb-5">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white px-3.5 py-0.5 rounded-lg shadow-xs border border-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{t("order.goBack")}</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#870d4c]/5 text-[#9d1159] rounded-lg text-sm font-medium">
          <Package size={14} />
          {t("order.stickerSize")}
        </div>
      </div>

      <div className="p-3 md:p-4 shadow-lg rounded-2xl mb-6 border border-slate-200 bg-white overflow-hidden">
        <div ref={printRef} className="flex justify-center items-center w-full">
          <AdminStickerCard
            order={order}
            courier={courier}
            setCourier={setCourier}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-2xl pt-1">
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 py-1 bg-[#9d1159] text-white rounded-lg hover:bg-[#9d1159] transition-colors font-medium shadow-sm cursor-pointer"
        >
          <Printer size={14} />
          {t("order.printSticker")}
        </button>

        <button
          onClick={handleSaveImage}
          disabled={loading === "img"}
          className="w-full flex items-center justify-center gap-2 py-1 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all font-medium shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading === "img" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}

          {loading === "img" ? t("order.saving") : t("order.downloadImage")}
        </button>

        <button
          onClick={handleSendTelegram}
          disabled={loading === "telegram"}
          className="col-span-2 md:col-span-1 justify-self-center w-3/4 sm:w-2/3 md:w-full flex items-center justify-center gap-2 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-all font-medium shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading === "telegram" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}

          {loading === "telegram"
            ? t("order.sending")
            : t("order.sendToTelegram")}
        </button>
      </div>
    </div>
  );
}
