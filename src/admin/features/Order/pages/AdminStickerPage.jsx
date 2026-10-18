import React, { useRef, useState, useEffect, useMemo } from "react";
import Swal from "../../../../lib/alert";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Printer,
  Download,
  ShoppingBag,
  Phone,
  User,
  MapPin,
  Tag,
  Bike,
  Receipt,
  ArrowLeft,
  Loader2,
  FileWarning,
  AlertTriangle,
  RotateCw,
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

import { createCardPng } from "../../../../utils/createCardPng";
import { useTranslation } from "react-i18next";
import { useOrderQuery, useOrdersQuery } from "../../../../queries/orders/useOrderQueries";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useDeliveryProvidersQuery } from "../../../../queries/deliveryProviders/useDeliveryProviderQueries";
import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { useAuth } from "@/hooks/useAuth";
import { usePrintReadyAssets } from "../../../../hooks/usePrintReadyAssets";
import { useDynamicShopBranding } from "../../../../hooks/useDynamicShopBranding";
import ProductStickerCard from "../components/ProductStickerCard";

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
    telegram: <FaTelegramPlane size={16} className="text-white" />,
    facebook: <FaFacebookF size={16} className="text-white" />,
    tiktok: <FaTiktok size={16} className="text-white" />,
    instagram: <FaInstagram size={16} className="text-white" />,
    twitter: <FaTwitter size={16} className="text-white" />,
    youtube: <FaYoutube size={16} className="text-white" />,
    linkedin: <FaLinkedinIn size={16} className="text-white" />,
    website: <Globe size={16} className="text-white" />,
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
  const shopCode =
    user?.shop?.code ||
    order?.shop_code ||
    order?.shopCode ||
    order?.shop?.code;
  const { data: settingData } = useSettingsQuery(shopCode);
  const [imgError, setImgError] = useState(false);
  const shopName = settingData?.shop_name || "Store";
  const socialMedia = Array.isArray(settingData?.social_media)
    ? settingData.social_media.slice(0, 2)
    : [];
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
          t("order.courier1") || "Courier 1",
          "J&T Express",
          t("order.courier2") || "Courier 2",
          t("order.courier3") || "Courier 3",
        ];

  return (
    <div
      id="admin-sticker-card"
      style={{
        width: "150mm",
        height: "100mm",
        minWidth: "150mm",
        minHeight: "100mm",
        maxWidth: "150mm",
        maxHeight: "100mm",
        padding: "3mm",
        borderColor: design.accent || "#0f172a",
        fontFamily:
          "'Geist Variable', 'Kantumruy Pro Variable', 'Kantumruy Pro', 'Battambang', 'Siemreap', 'Noto Sans Khmer', sans-serif",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
        lineHeight: 1.25,
      }}
      className="bg-white border rounded-none text-slate-900 select-none mx-auto flex flex-col justify-between overflow-hidden shadow-xs"
    >
      {/* Header */}
      <div
        className="flex flex-row items-center justify-between pb-1.5 border-b gap-2 shrink-0"
        style={{ borderColor: design.accent || "#0f172a" }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {design.showLogo && (
            <div
              className="rounded-lg overflow-hidden flex items-center justify-center w-10 h-10 shrink-0 border border-slate-200"
              style={{ backgroundColor: design.accent, color: accentText }}
            >
              {logoUrl && !imgError ? (
                <img
                  src={logoUrl}
                  alt={shopName}
                  className="w-10 h-10 object-cover"
                  onError={() => setImgError(true)}
                  crossOrigin="anonymous"
                />
              ) : (
                <ShoppingBag size={20} strokeWidth={2.5} />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-500 block leading-none mb-0.5">
              Have a good day!
            </span>
            <h1 className="font-black text-lg text-slate-900 leading-tight break-words">
              {shopName}
            </h1>
          </div>
        </div>

        {/* Shop phone + social icons */}
        {design.showSocial && socialMedia.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-[#fcfafb] px-2.5 py-1 rounded-lg border border-slate-300 shrink-0">
            {socialMedia.map((social, index) => (
              <div key={`${social.icon}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-slate-400 mr-1">|</span>}
                <div
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: design.accent, color: accentText }}
                >
                  {socialIconMap[String(social.icon || "").toLowerCase()] ? (
                    React.cloneElement(
                      socialIconMap[String(social.icon || "").toLowerCase()],
                      { className: "", color: accentText, size: 11 }
                    )
                  ) : (
                    <Globe size={11} color={accentText} />
                  )}
                </div>
                <span className="font-bold text-slate-900 text-xs whitespace-nowrap">
                  {social.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-12 gap-2 my-1.5 flex-1 items-stretch min-h-0">
        {/* Left Column */}
        <div className="col-span-7 flex flex-col gap-1.5 justify-between min-w-0">
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            {/* Sender */}
            <div className="border border-slate-800 rounded-lg p-2 bg-[#fcfafb]/60 flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5 shrink-0 whitespace-nowrap">
                <User size={11} className="shrink-0" />
                <span className="whitespace-nowrap">{t("order.sender") || "អ្នកផ្ញើ:"}</span>
              </div>
              <p className="font-bold text-xs text-slate-900 break-words leading-tight truncate">
                {order?.shop?.name || shopName}
              </p>
              <p className="text-[11px] text-slate-700 font-semibold mt-0.5 leading-tight whitespace-nowrap truncate">
                {shopPhone || order?.shop?.phone || "—"}
              </p>
            </div>

            {/* Receiver */}
            <div className="border border-slate-800 rounded-lg p-2 bg-[#fcfafb]/60 flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5 shrink-0 whitespace-nowrap">
                <Phone size={11} className="shrink-0" />
                <span className="whitespace-nowrap">{t("order.receiver") || "អ្នកទទួល:"}</span>
              </div>
              <p className="font-bold text-xs text-slate-900 break-words leading-tight truncate">
                {order?.customerName && order.customerName !== "N/A"
                  ? order.customerName
                  : t("order.generalCustomer") || "អតិថិជនទូទៅ"}
              </p>
              <p className="text-[11px] font-bold text-slate-900 tracking-wide mt-0.5 leading-tight whitespace-nowrap truncate">
                {order?.customerPhone || order?.phone || "—"}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border border-slate-800 rounded-lg p-2 flex-1 flex flex-col justify-start bg-white min-w-0">
            <div className="flex items-center justify-between mb-1 gap-1 shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 shrink-0 whitespace-nowrap">
                <MapPin size={12} className="text-slate-900 shrink-0" />
                <span className="whitespace-nowrap">{t("order.deliveryAddress") || "អាសយដ្ឋានដឹកជញ្ជូន:"}</span>
              </div>
              <div
                className="text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0"
                style={{
                  color: design.accent,
                  backgroundColor: subtleAccent,
                  borderColor: `${design.accent}33`,
                }}
              >
                {order?.deliveryProvider?.name ||
                  order?.deliveryMethod ||
                  t("order.none") ||
                  "JNT"}
              </div>
            </div>
            <p className="font-medium text-xs text-slate-800 leading-snug border border-slate-100 p-1.5 rounded bg-[#fcfafb] flex-1 break-words overflow-hidden">
              {order?.customerAddress || order?.address || t("order.noAddress") || "No delivery address"}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-5 flex flex-col gap-1.5 justify-between min-w-0">
          {/* KHQR PAYMENT */}
          {design.showQr && (
            <div className="border border-slate-800 rounded-lg overflow-hidden flex flex-col items-center bg-white shrink-0">
              <div
                className="w-full text-center py-0.5 text-[9px] font-black tracking-widest uppercase"
                style={{ backgroundColor: design.accent, color: accentText }}
              >
                KHQR PAYMENT
              </div>
              <div className="p-1 flex items-center justify-center bg-white">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="KHQR QR Code"
                    className="w-16 h-16 object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span className="w-16 h-16 flex items-center justify-center text-[10px] text-slate-500 text-center">
                    No QR
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="border border-slate-800 rounded-lg p-2 bg-[#fcfafb]/60 flex flex-col justify-center gap-1 text-xs">
            <div className="flex justify-between items-center bg-[#fcfafb] px-1.5 py-0.5 rounded border border-slate-100 text-[11px] gap-1">
              <span className="flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                <Tag size={11} className="shrink-0" />
                <span className="whitespace-nowrap">{t("order.items") || "ទំនិញ:"}</span>
              </span>
              <span className="font-bold text-slate-800 shrink-0 whitespace-nowrap tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#fcfafb] px-1.5 py-0.5 rounded border border-slate-100 text-[11px] gap-1">
              <span className="flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                <Bike size={11} className="shrink-0" />
                <span className="whitespace-nowrap">{t("order.shipping") || "ដឹកជញ្ជូន:"}</span>
              </span>
              <span className="font-bold text-slate-800 shrink-0 whitespace-nowrap tabular-nums">
                ${delivery.toFixed(2)}
              </span>
            </div>

            <div
              className="flex justify-between items-center px-1.5 py-1 rounded border text-slate-950 font-black text-xs gap-1"
              style={{
                backgroundColor: subtleAccent,
                borderColor: `${design.accent}33`,
              }}
            >
              <span className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Receipt size={12} className="shrink-0" />
                <span className="whitespace-nowrap">{t("order.total") || "សរុប:"}</span>
              </span>
              <span className="text-sm font-black text-slate-950 shrink-0 whitespace-nowrap tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex flex-row items-center justify-between pt-1.5 border-t text-xs gap-2 shrink-0"
        style={{ borderColor: design.accent || "#0f172a" }}
      >
        <div className="flex flex-wrap items-center justify-start gap-1 flex-1 min-w-0 mr-2">
          {couriers.map((c) => {
            const isSelected =
              String(courier || "").toLowerCase().trim() === String(c || "").toLowerCase().trim() ||
              (String(c || "").toLowerCase().includes("j&t") && String(courier || "").toLowerCase().includes("jnt")) ||
              (String(c || "").toLowerCase() === "jnt" && String(courier || "").toLowerCase().includes("j&t"));

            return (
              <div
                key={c}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all text-[10px] font-bold ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: design.accent,
                        backgroundColor: design.accent,
                        color: accentText,
                      }
                    : undefined
                }
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-white bg-white" : "border-slate-400 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: design.accent }}
                    />
                  )}
                </div>
                <span className="whitespace-nowrap">{c}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-black tracking-wide text-slate-900 text-right shrink-0 whitespace-nowrap">
          {design.footerText?.trim() || t("order.thankYouSticker") || "សូមអរគុណ! 🙏"}
        </p>
      </div>
    </div>
  );
}

export default function AdminStickerPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get("type"); // 'product' | 'order' | null
  const navigate = useNavigate();
  const { user } = useAuth();

  const isNumeric = /^\d+$/.test(String(id || ""));

  // Fetch orders
  const {
    data: singleOrderResponse,
    isLoading: singleOrderLoading,
    isError: singleOrderError,
    error: singleOrderErr,
    refetch: refetchSingleOrder,
  } = useOrderQuery(isNumeric && requestedType !== "product" ? id : undefined);

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
  } = useOrdersQuery();

  // Fetch products (for product barcode sticker support)
  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsErr,
    refetch: refetchProducts,
  } = useProductsQuery();

  // Determine matching order or product
  const matchedOrder = useMemo(() => {
    if (requestedType === "product") return null;

    const single =
      singleOrderResponse?.data ||
      (singleOrderResponse?.id ? singleOrderResponse : null);
    if (single) return single;

    if (!id) return null;

    return (
      orders.find(
        (o) =>
          String(o.orderNo) === String(id) ||
          String(o.orderNumber) === String(id) ||
          String(o.id) === String(id)
      ) || null
    );
  }, [requestedType, singleOrderResponse, orders, id]);

  const matchedProduct = useMemo(() => {
    if (!id) return null;
    if (matchedOrder && requestedType !== "product") return null;

    return (
      products.find(
        (p) =>
          String(p.id) === String(id) ||
          (p.sku && String(p.sku).toLowerCase() === String(id).toLowerCase())
      ) || null
    );
  }, [id, matchedOrder, requestedType, products]);

  const isProductMode = Boolean(matchedProduct && (!matchedOrder || requestedType === "product"));
  const currentItem = isProductMode ? matchedProduct : matchedOrder;

  // Settings
  const shopCode =
    user?.shop?.code ||
    matchedOrder?.shop_code ||
    matchedOrder?.shopCode ||
    matchedOrder?.shop?.code;

  const { data: settingData, isLoading: settingsLoading } =
    useSettingsQuery(shopCode);

  const settings = useMemo(() => {
    if (Array.isArray(settingData)) return settingData[0] || {};
    return settingData?.data ?? settingData ?? {};
  }, [settingData]);

  useDynamicShopBranding(shopCode, settings);

  // Sticker Design (saved per shop)
  const designKey = `admin-sticker-design:${user?.shop?.code || "default"}`;
  const [design, setDesign] = useState(DEFAULT_DESIGN);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(designKey));
      setDesign(
        saved && typeof saved === "object"
          ? {
              ...DEFAULT_DESIGN,
              ...saved,
              accent: /^#[0-9a-f]{6}$/i.test(saved.accent)
                ? saved.accent
                : DEFAULT_DESIGN.accent,
              footerText:
                typeof saved.footerText === "string"
                  ? saved.footerText.slice(0, 60)
                  : "",
            }
          : DEFAULT_DESIGN
      );
    } catch {
      setDesign(DEFAULT_DESIGN);
    }
  }, [designKey]);

  const updateDesign = (changes) => {
    const next = { ...design, ...changes };
    setDesign(next);
    try {
      window.localStorage.setItem(designKey, JSON.stringify(next));
    } catch {
      // Storage may be unavailable.
    }
  };

  const resetDesign = () => {
    setDesign(DEFAULT_DESIGN);
    try {
      window.localStorage.removeItem(designKey);
    } catch {
      // Storage may be unavailable.
    }
  };

  const printRef = useRef(null);
  const [loading, setLoading] = useState(null);
  const [courier, setCourier] = useState(t("order.courier1") || "Standard Courier");

  useEffect(() => {
    if (matchedOrder) {
      const deliveryName =
        matchedOrder?.deliveryProvider?.name || matchedOrder?.deliveryMethod;
      if (deliveryName) {
        setCourier(deliveryName);
      }
    }
  }, [matchedOrder]);

  const previewContainerRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({
    scale: 1,
    height: 378,
  });

  useEffect(() => {
    if (!currentItem || !previewContainerRef.current) return;

    const updatePreview = () => {
      const availableWidth = previewContainerRef.current?.clientWidth || 567;
      const scale = Math.min(1, availableWidth / 567);
      const height = printRef.current?.offsetHeight || 378;

      setPreviewSize((current) =>
        current.scale === scale && current.height === height
          ? current
          : { scale, height }
      );
    };

    const observer = new ResizeObserver(updatePreview);
    observer.observe(previewContainerRef.current);
    if (printRef.current) observer.observe(printRef.current);

    updatePreview();
    return () => observer.disconnect();
  }, [currentItem]);

  // Assets readiness
  const isInitialLoading =
    Boolean(isNumeric && singleOrderLoading && !matchedOrder) ||
    Boolean(ordersLoading && !matchedOrder && requestedType !== "product") ||
    Boolean(productsLoading && !matchedOrder && !matchedProduct);

  const isDataReady = Boolean(currentItem && !isInitialLoading && !settingsLoading);
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
      const dataUrl = await createCardPng(printRef.current, 2);
      const link = document.createElement("a");
      link.download = isProductMode
        ? `Product-Label-${currentItem.sku || currentItem.id}.png`
        : `Sticker-${currentItem.orderNo || currentItem.orderNumber || currentItem.id || "order"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
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
      const dataUrl = await createCardPng(printRef.current, 2);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = isProductMode
        ? `Product-Label-${currentItem.sku || currentItem.id}.png`
        : `Sticker-${currentItem.orderNo || currentItem.orderNumber || currentItem.id || "order"}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Sticker ${currentItem.orderNo || currentItem.name || currentItem.id}`,
        });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await Swal.fire({
          icon: "success",
          title: t("common.success") || "Saved",
          text: "Sticker image downloaded successfully.",
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

  const labels = i18n.language?.startsWith("km")
    ? {
        title: "កែរចនាស្លាកយីហោ",
        color: "ពណ៌",
        customColor: "ជ្រើសពណ៌ផ្សេង",
        logo: "ឡូហ្គោ",
        social: "បណ្តាញសង្គម",
        qr: "KHQR",
        footer: "សារខាងក្រោម",
        reset: "កំណត់ដូចដើម",
        note: "ការកែប្រែនឹងបង្ហាញនៅលើស្លាកយ័រ និងក្នុងឯកសារដែលទាញយក",
      }
    : {
        title: "Customize sticker",
        color: "Color",
        customColor: "Custom color",
        logo: "Logo",
        social: "Social media",
        qr: "KHQR",
        footer: "Footer message",
        reset: "Reset design",
        note: "Your changes appear in the preview, print, and downloaded image.",
      };

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-8 px-4 font-sans text-slate-800">
        <div className="w-full max-w-2xl flex items-center justify-between mb-5">
          <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-[#870d4c]/10 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-none p-4 w-full max-w-2xl mb-6 animate-pulse">
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
          <div className="grid grid-cols-12 gap-2.5 my-2.5">
            <div className="col-span-7 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 bg-slate-100 rounded-lg" />
                <div className="h-20 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-24 bg-slate-50 rounded-lg" />
            </div>
            <div className="col-span-5 flex flex-col gap-2">
              <div className="h-28 bg-slate-100 rounded-lg" />
              <div className="h-28 bg-slate-50 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t-2 border-slate-100">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-2xl">
          <div className="h-8 bg-[#870d4c]/20 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="col-span-2 md:col-span-1 h-8 bg-sky-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  const hasQueryError =
    (singleOrderError && !matchedOrder) ||
    (ordersError && productsError && !currentItem);

  if (hasQueryError && !currentItem) {
    const errorMsg =
      singleOrderErr?.message ||
      ordersErr?.message ||
      productsErr?.message ||
      "Failed to load sticker data from server.";
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {t("common.error") || "Error Loading Sticker"}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-5">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isNumeric) refetchSingleOrder();
              refetchOrders();
              refetchProducts();
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
  if (!currentItem) {
    return (
      <div className="min-h-screen bg-[#fcfafb] flex flex-col items-center justify-center py-20 font-sans">
        <FileWarning size={48} className="text-slate-300 mb-4" />
        <p className="text-base font-semibold text-slate-600 mb-4">
          {t("order.stickerNotFound") || "Sticker Not Found"}
        </p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium text-sm shadow-sm border border-slate-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t("order.goBack") || "Go Back"}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="print-page-root"
      className="min-h-screen bg-[#fcfafb] flex flex-col items-center py-4 px-2 sm:py-8 sm:px-4 font-sans text-slate-800"
    >
      {/* Clean @page and @media print CSS */}
      <style>{`
        @page {
          size: 150mm 100mm;
          margin: 0;
        }
        @media print {
          html, body {
            width: 150mm !important;
            height: 100mm !important;
            max-height: 100mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
          }
          #print-page-root {
            width: 150mm !important;
            height: 100mm !important;
            max-height: 100mm !important;
            min-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
          }
          .no-print,
          .print-controls,
          .print-controls button,
          section.no-print,
          nav,
          header {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          #sticker-preview-wrapper,
          #sticker-preview-wrapper > div,
          .sticker-scale-outer,
          .sticker-scale-inner,
          #sticker-print-ref {
            width: 150mm !important;
            height: 100mm !important;
            max-width: 150mm !important;
            max-height: 100mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            overflow: hidden !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #admin-sticker-card,
          #admin-sticker-card *,
          #product-sticker-card,
          #product-sticker-card * {
            visibility: visible !important;
          }
          #admin-sticker-card,
          #product-sticker-card {
            box-sizing: border-box !important;
            width: 150mm !important;
            max-width: 150mm !important;
            height: 100mm !important;
            max-height: 100mm !important;
            min-height: 100mm !important;
            margin: 0 auto !important;
            padding: 3mm !important;
            transform: none !important;
            zoom: 1 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
          }
        }
      `}</style>

      {/* Sticker Preview */}
      <div id="sticker-preview-wrapper" className="w-full max-w-2xl mb-4">
        <div ref={previewContainerRef} className="w-full">
          <div
            className="sticker-scale-outer mx-auto"
            style={{
              width: 567 * previewSize.scale,
              height: previewSize.height * previewSize.scale,
            }}
          >
            <div
              className="sticker-scale-inner"
              style={{
                width: 567,
                transform: `scale(${previewSize.scale})`,
                transformOrigin: "top left",
              }}
            >
              <div id="sticker-print-ref" ref={printRef}>
                {isProductMode ? (
                  <ProductStickerCard
                    product={currentItem}
                    settings={settings}
                    design={design}
                  />
                ) : (
                  <AdminStickerCard
                    order={currentItem}
                    courier={courier}
                    design={design}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print print-controls flex items-center justify-center gap-3 max-w-lg w-full mb-3">
        <button
          onClick={handlePrint}
          disabled={!isPrintReady}
          title={isPrintReady ? (t("order.printSticker") || "Print") : statusMessage}
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
          title={t("order.downloadImage") || "Download"}
          className="w-[104px] px-3 py-2 flex items-center justify-center bg-white text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group shadow-sm disabled:opacity-60"
        >
          {loading === "img" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:scale-110"
            />
          )}
        </button>

        <button
          onClick={handleShare}
          disabled={loading === "share" || !isPrintReady}
          title={t("order.share") || "Share"}
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

      {/* Original Customize Sticker Section (Only on Order Stickers, hidden in print) */}
      {!isProductMode && (
        <section
          className="no-print w-full max-w-2xl mt-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          aria-label={labels.title}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Palette size={16} />
              {labels.title}
            </h2>
            <button
              type="button"
              onClick={resetDesign}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw size={13} />
              {labels.reset}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-600 mr-1">
              {labels.color}
            </span>
            {PRESET_COLORS.map(({ name, color }) => (
              <button
                key={color}
                type="button"
                onClick={() => updateDesign({ accent: color })}
                aria-label={name}
                aria-pressed={design.accent === color}
                className={`h-7 w-7 rounded-full border-2 border-white shadow-sm cursor-pointer ${
                  design.accent === color
                    ? "ring-2 ring-offset-1 ring-slate-500"
                    : "ring-1 ring-slate-200"
                }`}
                style={{ backgroundColor: color }}
                title={name}
              />
            ))}
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="color"
                value={design.accent}
                onChange={(event) => updateDesign({ accent: event.target.value })}
                className="h-7 w-8 cursor-pointer border-0 bg-transparent"
                aria-label={labels.customColor}
              />
              {labels.customColor}
            </label>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
            {[
              ["showLogo", labels.logo],
              ["showSocial", labels.social],
              ["showQr", labels.qr],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={design[key]}
                  onChange={(event) =>
                    updateDesign({ [key]: event.target.checked })
                  }
                  className="accent-[#870d4c]"
                />
                {label}
              </label>
            ))}
          </div>

          <label className="block text-xs font-medium text-slate-700">
            {labels.footer}
            <input
              type="text"
              maxLength={60}
              value={design.footerText}
              onChange={(event) =>
                updateDesign({ footerText: event.target.value })
              }
              placeholder={t("order.thankYouSticker") || "Thank you for your order!"}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#870d4c] focus:ring-1 focus:ring-[#870d4c]"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">{labels.note}</p>
        </section>
      )}
    </div>
  );
}
