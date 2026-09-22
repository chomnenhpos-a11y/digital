import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import Swal from "sweetalert2";
import { telegramService } from "../../../../services/telegramService";

const inputClass =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/20";
const TelegramConnectionSection = ({ settingData }) => {
  const { t } = useTranslation();
  const { register, setValue } = useFormContext();

  const [telegramGroupToVerify, setTelegramGroupToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState({
    loading: false,
    info: null,
    error: null,
  });

  // Auto-fetch existing chat info when settings load
  useEffect(() => {
    let isMounted = true;
    const fetchChatInfo = async () => {
      if (settingData?.chat_id && !verifyStatus.info) {
        try {
          const result = await telegramService.verifyGroup(settingData.chat_id);
          if (isMounted && result.success && result.data) {
            setVerifyStatus((prev) => ({ ...prev, info: result.data }));
          }
        } catch (err) {
          console.error("Failed to fetch Telegram chat info:", err);
        }
      }
    };
    fetchChatInfo();
    return () => {
      isMounted = false;
    };
  }, [settingData?.chat_id]);

  const handleVerifyTelegram = async () => {
    if (!telegramGroupToVerify) return;

    setVerifyStatus({ loading: true, info: null, error: null });

    try {
      const result = await telegramService.verifyGroup(telegramGroupToVerify);
      if (result.success && result.data) {
        setVerifyStatus({ loading: false, info: result.data, error: null });
        setValue("chat_id", result.data.chat_id, {
          shouldValidate: true,
          shouldDirty: true,
        });

        Swal.fire({
          icon: "success",
          title: t("common.success", "Success! ✅"),
          text: t(
            "settings.telegramVerifySuccess",
            "Telegram group verified successfully!"
          ),
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      const errorMsg =
        err.message ||
        t("settings.verificationFailed", "Verification failed");
      setVerifyStatus({ loading: false, info: null, error: errorMsg });

      Swal.fire({
        icon: "error",
        title: t("common.error", "Error"),
        text: errorMsg,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#fcfafb] flex items-center justify-center shrink-0">
          <Send size={19} className="text-slate-700" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {t("settings.telegramBotIntegration", "Telegram Bot Integration")}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-5">
            {t(
              "settings.telegramBotIntegrationDesc",
              "To receive order notifications, add your bot to a Telegram group as an Admin, then enter the group username (e.g. @my_shop) or link (e.g. https://t.me/my_shop) and verify it to get the Chat ID."
            )}
          </p>
        </div>
      </div>

      {/* Verify input row */}
      <div className="max-w-xl">
        <label
          htmlFor="telegram-verify-input"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {t("settings.verifyGroupUsername", "Verify Group Username or Link")}
        </label>
        <div className="flex gap-2">
          <input
            id="telegram-verify-input"
            type="text"
            value={telegramGroupToVerify}
            onChange={(e) => setTelegramGroupToVerify(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleVerifyTelegram();
              }
            }}
            placeholder="@shop_orders or https://t.me/..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleVerifyTelegram}
            disabled={verifyStatus.loading || !telegramGroupToVerify}
            className="h-10 px-4 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {verifyStatus.loading
              ? t("settings.verifying", "Verifying...")
              : t("settings.verify", "Verify")}
          </button>
        </div>
      </div>

      {/* Hidden field — receives the verified chat_id */}
      <input type="hidden" {...register("chat_id")} />

      {/* Connection status card */}
      {verifyStatus.info && (
        <div className="max-w-xl p-4 bg-white border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-600 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-xs font-bold">
              {t("settings.statusConnected", "Status: Connected")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">
                {t("settings.group", "Group:")}
              </span>{" "}
              {verifyStatus.info.title || "N/A"}
            </div>
            <div>
              <span className="font-semibold text-slate-700">
                {t("settings.username", "Username:")}
              </span>{" "}
              {verifyStatus.info.username
                ? `@${verifyStatus.info.username}`
                : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {verifyStatus.error && (
        <div className="max-w-xl p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600 font-medium">{verifyStatus.error}</p>
        </div>
      )}
    </div>
  );
};

export default TelegramConnectionSection;
