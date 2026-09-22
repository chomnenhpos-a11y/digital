import React from "react";
import { useTranslation } from "react-i18next";
import { QrCode, MessageCircle, FileText, Upload, X } from "lucide-react";
import SectionHeader from "./common/SectionHeader";
import ImageUpload from "./common/ImageUpload";
const PaymentDocumentsSection = ({
  qrPreview,
  qrFileName,
  handleQrUploadChange,
  handleClearQr,
  supportFileName,
  handleSupportChange,
  handleClearSupport,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#fcfafb] flex items-center justify-center shrink-0">
          <QrCode size={19} className="text-slate-700" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {t("settings.qrUpload", "KHQR Payment")}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-5">
            {t(
              "settings.paymentDocumentsDesc",
              "Upload your KHQR payment image and support documents."
            )}
          </p>
        </div>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Panel 1: KHQR image ── */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-slate-500" aria-hidden="true" />
            <h4 className="text-xs font-bold text-slate-800">
              {t("settings.qrUpload", "KHQR Payment")}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            {t("settings.qrUploadDesc", "Upload a QR code image for your customers payment.")}
          </p>

          <div className="flex flex-col items-center gap-3">
            <ImageUpload
              id="qr-upload"
              preview={qrPreview}
              onChange={handleQrUploadChange}
              onClear={handleClearQr}
              icon={QrCode}
              uploadText={t("settings.uploadQr", "Upload QR Code")}
              hint={t("settings.qrUploadHint", "PNG, JPG, WEBP · Max 1MB")}
              className="w-48 h-48 rounded-2xl border border-dashed border-slate-300 bg-[#fcfafb]"
              iconSize={24}
            />

            {/* File name badge */}
            {qrFileName && (
              <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="text-xs text-slate-600 truncate">{qrFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearQr}
                  aria-label={t("common.delete", "Remove")}
                  className="text-slate-400 hover:text-red-500 transition shrink-0"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Panel 2: Support document ── */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-slate-500" aria-hidden="true" />
            <h4 className="text-xs font-bold text-slate-800">
              {t("settings.supportDocument", "Support Document")}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            {t("settings.supportDocumentDesc", "Upload a document used for customer support.")}
          </p>

          <div className="relative">
            <input
              id="support-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleSupportChange}
            />

            <label
              htmlFor="support-upload"
              className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 bg-[#fcfafb] hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-slate-500" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {supportFileName ||
                    t("settings.selectSupportDocument", "Select Support Document")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Upload size={12} className="text-slate-400 shrink-0" aria-hidden="true" />
                  <p className="text-[10px] text-slate-400">PDF, DOC, DOCX</p>
                </div>
              </div>
            </label>

            {supportFileName && (
              <button
                type="button"
                onClick={handleClearSupport}
                aria-label={t("common.delete", "Remove document")}
                className="absolute right-2 top-2 w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDocumentsSection;
