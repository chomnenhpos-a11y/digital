import React, { useEffect, useRef, useState } from "react";
import { ReactQRCode as QRCode } from "@lglab/react-qr-code";
import { useAuth } from "../../../../hooks/useAuth";
import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";
import { Copy, Download, Link as LinkIcon, QrCode as QrCodeIcon, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const DEFAULT_DESIGN = {
  foreground: "#000000ff",
  background: "#ffffff",
  moduleStyle: "square",
  finderStyle: "square",
  showLogo: true,
};

const MODULE_STYLES = ["square", "rounded", "circle", "diamond"];
const FINDER_STYLES = ["square", "rounded", "circle"];

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first, second) {
  const light = Math.max(relativeLuminance(first), relativeLuminance(second));
  const dark = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

export default function AdminQRCode() {
  const { t, i18n } = useTranslation();
  const isKhmer = i18n.language?.startsWith("km");
  const label = (english, khmer) => (isKhmer ? khmer : english);
  const { user } = useAuth();
  const shopCode = user?.shop?.code || "";
  const { data: settingsData } = useSettingsQuery(shopCode);
  const logoShop = settingsData?.logo || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  const logoShopUrl = logoShop
    ? /^https?:\/\//i.test(logoShop)
      ? logoShop
      : `${apiBaseUrl}${logoShop.startsWith("/") ? "" : "/"}${logoShop}`
    : "";

  const [copied, setCopied] = useState(false);
  const [roundLogoUrl, setRoundLogoUrl] = useState("");
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const qrRef = useRef(null);
  const shopUrl = shopCode ? `${window.location.origin}/${shopCode}` : "";
  const contrast = contrastRatio(design.foreground, design.background);
  const hasEnoughContrast =
    contrast >= 4.5 &&
    relativeLuminance(design.foreground) < relativeLuminance(design.background);

  useEffect(() => {
    if (!logoShopUrl) {
      setRoundLogoUrl("");
      return;
    }

    let cancelled = false;
    setRoundLogoUrl("");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(100, 100, 100, 0, Math.PI * 2);
        ctx.clip();
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        ctx.drawImage(
          image,
          (image.naturalWidth - side) / 2,
          (image.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          200,
          200,
        );
        setRoundLogoUrl(canvas.toDataURL("image/png"));
      } catch (error) {
        console.error("Unable to prepare shop logo:", error);
        setRoundLogoUrl("");
      }
    };
    image.onerror = () => {
      if (!cancelled) setRoundLogoUrl("");
    };
    image.src = logoShopUrl;
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [logoShopUrl]);

  const updateDesign = (key, value) => {
    setDesign((current) => ({ ...current, [key]: value }));
  };

  const copyToClipboard = async () => {
    if (!shopUrl) return;
    try {
      await navigator.clipboard.writeText(shopUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: t("qrcode.copiedLink"),
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Failed to copy shop link:", error);
    }
  };

  const downloadQRCode = () => {
    if (!hasEnoughContrast) return;
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The embedded shop logo is a data URL, so it is included in the SVG export.
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgUrl = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      try {
        ctx.fillStyle = design.background;
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.drawImage(image, 0, 0, 1024, 1024);
        const link = document.createElement("a");
        link.download = `QR_Code_${shopCode.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Failed to download QR code:", error);
        Swal.fire({
          icon: "error",
          title: label("Download failed", "ការទាញយកមិនបានជោគជ័យ"),
          text: label("Unable to export the QR image.", "មិនអាចរក្សាទុករូបភាព QR បានទេ។"),
        });
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      Swal.fire({ icon: "error", title: label("Download failed", "ការទាញយកមិនបានជោគជ័យ") });
    };
    image.src = svgUrl;
  };

  if (!shopCode) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          <QrCodeIcon size={48} className="mb-4 text-amber-400" />
          <h2 className="mb-2 text-xl font-bold">{t("qrcode.noStoreCode")}</h2>
          <p className="max-w-sm text-slate-500">
            {t("qrcode.pleaseSetStoreCode1")} {t("qrcode.pleaseSetStoreCode2")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-8">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#870d4c]/5 text-[#870d4c] md:h-20 md:w-20">
          <QrCodeIcon className="h-10 w-10 md:h-16 md:w-16" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">{t("qrcode.storeQRCode")}</h3>
          <p className="text-sm text-slate-500">{t("qrcode.scanToVisitStore")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div ref={qrRef} className="max-w-full overflow-hidden rounded-xl border border-slate-100 shadow-sm">
            <QRCode
              value={shopUrl}
              size={256}
              level="H"
              marginSize={4}
              background={design.background}
              dataModulesSettings={{ color: design.foreground, style: design.moduleStyle }}
              finderPatternOuterSettings={{ color: design.foreground, style: design.finderStyle }}
              finderPatternInnerSettings={{ color: design.foreground, style: design.finderStyle }}
              imageSettings={
                design.showLogo && roundLogoUrl
                  ? { src: roundLogoUrl, width: 48, height: 48, excavate: true }
                  : undefined
              }
              svgProps={{ className: "block h-auto max-w-full", role: "img", "aria-label": "Store QR code" }}
            />
          </div>
          {!hasEnoughContrast && (
            <p role="alert" className="mt-4 text-center text-sm text-rose-600">
              {label("Use a dark QR color and a lighter background with strong contrast.", "សូមជ្រើសពណ៌ QR ងងឹត និងផ្ទៃក្រោយភ្លឺដែលមានភាពផ្ទុយគ្នាច្បាស់។")}
            </p>
          )}
          <button
            type="button"
            onClick={downloadQRCode}
            disabled={!hasEnoughContrast}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#870d4c] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#700a3e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} /> {t("qrcode.downloadAsImage")}
          </button>
        </div>

        <div className="space-y-4">
          <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-800">{label("Customize QR code", "កែរចនា QR Code")}</h3>
              <button
                type="button"
                onClick={() => setDesign({ ...DEFAULT_DESIGN })}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-[#870d4c] hover:bg-[#870d4c]/5"
              >
                <RotateCcw size={15} /> {label("Reset", "កំណត់ឡើងវិញ")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { key: "foreground", title: label("QR color", "ពណ៌ QR") },
                { key: "background", title: label("Background", "ផ្ទៃក្រោយ") },
              ].map(({ key, title }) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  <span>{title}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{design[key].toUpperCase()}</span>
                    <input
                      type="color"
                      value={design[key]}
                      onChange={(event) => updateDesign(key, event.target.value)}
                      aria-label={title}
                      className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent"
                    />
                  </span>
                </label>
              ))}
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                <span>{label("Module shape", "រូបរាងចំណុច QR")}</span>
                <select value={design.moduleStyle} onChange={(event) => updateDesign("moduleStyle", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[#870d4c]">
                  {MODULE_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                <span>{label("Corner shape", "រូបរាងជ្រុង QR")}</span>
                <select value={design.finderStyle} onChange={(event) => updateDesign("finderStyle", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[#870d4c]">
                  {FINDER_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.showLogo}
                disabled={!logoShopUrl}
                onChange={(event) => updateDesign("showLogo", event.target.checked)}
                className="h-4 w-4 accent-[#870d4c]"
              />
              {label("Show shop logo", "បង្ហាញឡូហ្គោហាង")}
            </label>
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{t("qrcode.storeLink")}</h3>
              <p className="text-sm text-slate-500">{t("qrcode.copyLinkToSend")}</p>
            </div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-700" htmlFor="store-qr-url">URL</label>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-[#fcfafb] focus-within:border-[#870d4c]">
              <span className="border-r border-slate-200 px-4 py-3 text-slate-400"><LinkIcon size={18} /></span>
              <input id="store-qr-url" readOnly value={shopUrl} onFocus={(event) => event.target.select()} className="w-full min-w-0 bg-transparent px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <button type="button" onClick={copyToClipboard} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {copied ? t("qrcode.copied") : <><Copy size={16} /> {t("qrcode.copyLink")}</>}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
