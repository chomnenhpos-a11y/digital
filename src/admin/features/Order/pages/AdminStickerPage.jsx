import React, { useRef, useState, useEffect } from "react";

import Swal from "sweetalert2";

import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";

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
  Share2,
  Palette,
  RotateCcw,
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
import { useDeliveryProvidersQuery } from "../../../../queries/deliveryProviders/useDeliveryProviderQueries";
import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_DESIGN = {
  accent: "#0f172a",
  showLogo: true,
  showSocial: true,
  showQr: true,
  footerText: "",
};

const PRESET_COLORS = [
  { name: "Classic", color: "#0f172a" },
  { name: "Plum", color: "#870d4c" },
  { name: "Teal", color: "#0f766e" },
];

function readableTextColor(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((value) => parseInt(value, 16));
  if (!channels || channels.length !== 3) return "#ffffff";
  const brightness = (channels[0] * 299 + channels[1] * 587 + channels[2] * 114) / 1000;
  return brightness > 150 ? "#0f172a" : "#ffffff";
}

function AdminStickerCard({ order, courier, design }) {
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
  const shopCode = user?.shop?.code || order?.shop_code || order?.shopCode || order?.shop?.code;
  const { data: settingData } = useSettingsQuery(shopCode);
  const [imgError, setImgError] = useState(false);
  const shopName = settingData?.shop_name || "N/A";
  const socialMedia = Array.isArray(settingData?.social_media)
    ? settingData.social_media.slice(0, 2) : [];
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
  const accentText = readableTextColor(design.accent);
  const subtleAccent = `${design.accent}12`;

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
        minHeight: "368px",
        width: "560px",
        borderColor: design.accent,
        fontFamily:
          "'Geist Variable', 'Battambang', 'Siemreap', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
      className="bg-white border-2 rounded-xl p-3 text-slate-900 select-none mx-auto flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between pb-2.5 border-b-2 gap-2" style={{ borderColor: design.accent }}>
        <div className="flex items-center gap-2.5">
          {design.showLogo && <div className="rounded-md overflow-hidden flex items-center justify-center w-10 h-10 shrink-0" style={{ backgroundColor: design.accent, color: accentText }}>
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
          </div>}

          <div>
            <span className="text-[11px] font-bold text-slate-600 block leading-tight">
              Have a good day!
            </span>

            <h1 className="font-black text-xl tracking-wider text-slate-900 leading-none max-w-[215px] truncate">
              {shopName}
            </h1>
          </div>
        </div>

        {/* Shop phone + social icons */}
        {design.showSocial && socialMedia.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-[#fcfafb] px-2 py-1.5 rounded-md border border-slate-300">
            {socialMedia.map((social, index) => (
              <div key={`${social.icon}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-slate-400 mr-1">|</span>}
                <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: design.accent, color: accentText }}>
                  {socialIconMap[String(social.icon || "").toLowerCase()] ? React.cloneElement(socialIconMap[String(social.icon || "").toLowerCase()], { className: "", color: accentText }) : (
                    <Globe size={14} color={accentText} />
                  )}
                </div>
                <span className="font-bold text-slate-900 max-w-[65px] truncate">{social.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-12 gap-2.5 my-2.5 flex-1 items-stretch">
        {/* Left */}
        <div className="col-span-7 flex flex-col gap-2 justify-between min-w-0">
          <div className="grid grid-cols-2 gap-2">
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

              <div className="text-[10px] font-bold px-2 py-0.5 rounded border truncate max-w-[95px]" style={{ color: design.accent, backgroundColor: subtleAccent, borderColor: `${design.accent}33` }}>
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
        <div className="col-span-5 flex flex-col gap-2 justify-between min-w-0">
          {/* KHQR */}
          {design.showQr && <div className="border border-slate-800 rounded-lg overflow-hidden flex flex-col items-center bg-white">
            <div className="w-full text-center py-1 text-[10px] font-black tracking-widest uppercase" style={{ backgroundColor: design.accent, color: accentText }}>
              KHQR PAYMENT
            </div>

            <div className="p-2 flex items-center justify-center bg-white">
              {qrCodeUrl ? <img
                src={qrCodeUrl}
                alt="KHQR QR Code"
                className="w-16 h-16 object-contain"
                crossOrigin="anonymous"
              /> : <span className="w-16 h-16 flex items-center justify-center text-[10px] text-slate-500 text-center">No QR</span>}
            </div>
          </div>}

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

            <div className="flex justify-between items-center p-1.5 rounded border text-slate-950 font-black text-xs" style={{ backgroundColor: subtleAccent, borderColor: `${design.accent}33` }}>
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
      <div className="flex flex-row items-center justify-between pt-2 border-t-2 text-xs gap-2" style={{ borderColor: design.accent }}>
        <div className="flex flex-wrap items-center justify-start gap-2">
          {couriers.map((c) => {
            const isSelected = courier === c;

            return (
              <button
                type="button"
                key={c}
                disabled
                className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all text-[11px] font-bold ${isSelected
                  ? ""
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                style={isSelected ? { borderColor: design.accent, backgroundColor: design.accent, color: accentText } : undefined}
              >
                <div
                  className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? "border-white bg-white" : "border-slate-400"
                    }`}
                  style={isSelected ? { borderColor: accentText, backgroundColor: accentText } : undefined}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: design.accent }} />
                  )}
                </div>

                <span>{c}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-black tracking-wide text-slate-900 text-right max-w-[140px] break-words">
          {design.footerText.trim() || t("order.thankYouSticker")}
        </p>
      </div>
    </div>
  );
}

export default function AdminStickerPage() {
  const { t, i18n } = useTranslation();

  const { id: paramNo } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();
  const designKey = `admin-sticker-design:${user?.shop?.code || "default"}`;
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const labels = i18n.language?.startsWith("km")
    ? { title: "កែរចនាស្ទីកឃ័រ", color: "ពណ៌", customColor: "ជ្រើសពណ៌ផ្សេង", logo: "ឡូហ្គោ", social: "បណ្ដាញសង្គម", qr: "KHQR", footer: "សារខាងក្រោម", reset: "កំណត់ដូចដើម", note: "ការកែប្រែនឹងបង្ហាញនៅលើស្ទីកឃ័រ និងក្នុងឯកសារដែលទាញយក" }
    : { title: "Customize sticker", color: "Color", customColor: "Custom color", logo: "Logo", social: "Social media", qr: "KHQR", footer: "Footer message", reset: "Reset design", note: "Your changes appear in the preview, print, and downloaded image." };

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(designKey));
      setDesign(saved && typeof saved === "object"
        ? {
          ...DEFAULT_DESIGN,
          ...saved,
          accent: /^#[0-9a-f]{6}$/i.test(saved.accent) ? saved.accent : DEFAULT_DESIGN.accent,
          footerText: typeof saved.footerText === "string" ? saved.footerText.slice(0, 60) : "",
        }
        : DEFAULT_DESIGN);
    } catch {
      setDesign(DEFAULT_DESIGN);
    }
  }, [designKey]);

  const updateDesign = (changes) => {
    const next = { ...design, ...changes };
    setDesign(next);
    try { window.localStorage.setItem(designKey, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
  };

  const resetDesign = () => {
    setDesign(DEFAULT_DESIGN);
    try { window.localStorage.removeItem(designKey); } catch { /* Storage may be unavailable. */ }
  };

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

    documentTitle: `Sticker-${order?.orderNo || order?.orderNumber || order?.id || "sticker"
      }`,

    pageStyle: `
      @page {
        size: 150mm 100mm;
        margin: 0;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        #admin-sticker-card {
          width: 560px !important;
          margin: 0 auto !important;
          zoom: 0.92;
        }
      }
    `,
  });

  const previewContainerRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({
    scale: 1,
    height: 368,
  });

  useEffect(() => {
    if (!order || !previewContainerRef.current) return;

    const updatePreview = () => {
      const availableWidth = previewContainerRef.current?.clientWidth || 560;
      const scale = Math.min(1, availableWidth / 560);
      const height = printRef.current?.offsetHeight || 368;

      setPreviewSize((current) => current.scale === scale && current.height === height
        ? current : { scale, height });
    };

    const observer = new ResizeObserver(updatePreview);
    observer.observe(previewContainerRef.current);
    if (printRef.current) observer.observe(printRef.current);

    updatePreview();
    return () => observer.disconnect();
  }, [order]);
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

      link.download = `Sticker-${order.orderNo || order.orderNumber || order.id
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

  const handleShare = async () => {
    if (!printRef.current) return;

    setLoading("share");

    try {
      await document.fonts.ready;

      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File(
        [blob],
        `Sticker-${order.orderNo || order.orderNumber || order.id}.png`,
        { type: "image/png" }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Sticker ${order.orderNo || order.orderNumber || order.id}`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("common.failed"),
          text: "Sharing is not supported on this device/browser.",
          confirmButtonColor: "#0f172a",
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);

        Swal.fire({
          icon: "error",
          title: t("common.failed"),
          text: err.message || t("common.error") || "Share failed",
          confirmButtonColor: "#0f172a",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-4 px-2 sm:py-8 sm:px-4 font-sans text-slate-800">
      <div className="w-full max-w-2xl mb-4">
        <div ref={previewContainerRef} className="w-full">
          <div
            className="mx-auto"
            style={{
              width: 560 * previewSize.scale,
              height: previewSize.height * previewSize.scale,
            }}
          >
            <div
              style={{
                width: 560,
                transform: `scale(${previewSize.scale})`,
                transformOrigin: "top left",
              }}
            >
              <div ref={printRef}>
                <AdminStickerCard
                  order={order}
                  courier={courier}
                  design={design}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
        <button
          onClick={handlePrint}
          title={t("order.printSticker")}
          className="w-full flex items-center justify-center gap-2 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm cursor-pointer"
        >
          <Printer size={18} />
        </button>

        <button
          onClick={handleSaveImage}
          disabled={loading === "img"}
          title={t("order.downloadImage")}
          className="w-full flex items-center justify-center gap-2 py-1 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all font-medium shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading === "img" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
        </button>

        <button
          onClick={handleShare}
          disabled={loading === "share"}
          title={t("order.share") || "Share"}
          className="w-full flex items-center justify-center gap-2 py-1 bg-pink-900 text-white rounded-lg hover:bg-pink-700 transition-all font-medium shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading === "share" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Share2 size={18} />
          )}
        </button>
      </div>
      <section className="w-full max-w-2xl mt-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm" aria-label={labels.title}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Palette size={16} />{labels.title}</h2>
          <button type="button" onClick={resetDesign} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <RotateCcw size={13} />{labels.reset}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-600 mr-1">{labels.color}</span>
          {PRESET_COLORS.map(({ name, color }) => (
            <button key={color} type="button" onClick={() => updateDesign({ accent: color })} aria-label={name} aria-pressed={design.accent === color}
              className={`h-7 w-7 rounded-full border-2 border-white shadow-sm ${design.accent === color ? "ring-2 ring-offset-1 ring-slate-500" : "ring-1 ring-slate-200"}`}
              style={{ backgroundColor: color }} title={name} />
          ))}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
            <input type="color" value={design.accent} onChange={(event) => updateDesign({ accent: event.target.value })} className="h-7 w-8 cursor-pointer border-0 bg-transparent" aria-label={labels.customColor} />
            {labels.customColor}
          </label>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
          {[["showLogo", labels.logo], ["showSocial", labels.social], ["showQr", labels.qr]].map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" checked={design[key]} onChange={(event) => updateDesign({ [key]: event.target.checked })} className="accent-[#870d4c]" />{label}
            </label>
          ))}
        </div>
        <label className="block text-xs font-medium text-slate-700">
          {labels.footer}
          <input type="text" maxLength={60} value={design.footerText} onChange={(event) => updateDesign({ footerText: event.target.value })}
            placeholder={t("order.thankYouSticker")}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#870d4c] focus:ring-1 focus:ring-[#870d4c]" />
        </label>
        <p className="mt-2 text-xs text-slate-500">{labels.note}</p>
      </section>
    </div>
  );
}
