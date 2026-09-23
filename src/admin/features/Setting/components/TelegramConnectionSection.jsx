import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Send, Users, Radio, X } from "lucide-react";
import Swal from "sweetalert2";
import { telegramService } from "../../../../services/telegramService";

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const GROUP_URL = BOT_USERNAME
    ? `https://t.me/${BOT_USERNAME}?startgroup=connect_shop`
    : "#";

  const CHANNEL_URL = BOT_USERNAME
    ? `https://t.me/${BOT_USERNAME}?startchannel&admin=post_messages`
    : "#";

  // =========================
  // AUTO FETCH EXISTING CHAT
  // =========================
  useEffect(() => {
    let isMounted = true;

    const fetchChatInfo = async () => {
      if (settingData?.chat_id && !verifyStatus.info) {
        try {
          const result = await telegramService.verifyGroup(
            settingData.chat_id
          );

          if (isMounted && result.success && result.data) {
            setVerifyStatus((prev) => ({
              ...prev,
              info: result.data,
            }));
          }
        } catch (err) {
          console.error(
            "Failed to fetch Telegram chat info:",
            err
          );
        }
      }
    };

    fetchChatInfo();

    return () => {
      isMounted = false;
    };
  }, [settingData?.chat_id]);

  // =========================
  // VERIFY GROUP / CHANNEL
  // =========================
  const handleVerifyTelegram = async () => {
    if (!telegramGroupToVerify.trim()) return;

    setVerifyStatus({
      loading: true,
      info: null,
      error: null,
    });

    try {
      const result = await telegramService.verifyGroup(
        telegramGroupToVerify.trim()
      );

      if (result.success && result.data) {
        setVerifyStatus({
          loading: false,
          info: result.data,
          error: null,
        });

        setValue("chat_id", result.data.chat_id, {
          shouldValidate: true,
          shouldDirty: true,
        });

        Swal.fire({
          icon: "success",
          text: t(
            "settings.telegramVerifySuccess",
            "Telegram group or channel verified successfully!"
          ),
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      const errorMsg =
        err?.message ||
        t(
          "settings.verificationFailed",
          "Verification failed"
        );

      setVerifyStatus({
        loading: false,
        info: null,
        error: errorMsg,
      });

      Swal.fire({
        icon: "error",
        title: t("common.error", "Error"),
        text: errorMsg,
      });
    }
  };

  // =========================
  // VALIDATE BOT CONFIG
  // =========================
  const handleTelegramLinkClick = (e) => {
    if (!BOT_USERNAME) {
      e.preventDefault();

      Swal.fire({
        icon: "error",
        title: t("common.error", "Error"),
        text: t(
          "settings.telegramBotNotConfigured",
          "Telegram bot is not configured."
        ),
      });

      return;
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-5">
        {/* =========================
            HEADER
        ========================= */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fcfafb] flex items-center justify-center shrink-0">
            <Send
              size={19}
              className="text-slate-700"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t(
                "settings.telegramBotIntegration",
                "Telegram Bot Integration"
              )}
            </h3>

            <p className="text-xs text-slate-500 mt-1 leading-5">
              {t(
                "settings.telegramBotIntegrationDesc",
                "Add the Telegram bot to a group or channel, then verify the username or link to get the Chat ID."
              )}
            </p>
          </div>
        </div>

        {/* =========================
            STEP 1 — ADD BOT
        ========================= */}
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            {t(
              "settings.step1AddBot",
              "Step 1 — Add Bot"
            )}
          </p>

          <button
            type="button"
            id="telegram-add-btn"
            onClick={() => setIsModalOpen(true)}
            className="
              flex items-center gap-2
              h-10 px-5
              rounded-xl
              bg-[#870d4c]
              text-white
              text-xs font-semibold
              hover:bg-[#6e0a3e]
              active:scale-95
              transition-all
              shadow-sm
            "
          >
            <Send
              size={14}
              aria-hidden="true"
            />

            {t(
              "settings.addToTelegram",
              "Add to Telegram"
            )}
          </button>
        </div>

        {/* =========================
            STEP 2 — VERIFY
        ========================= */}
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            {t(
              "settings.step2Verify",
              "Step 2 — Verify"
            )}
          </p>

          <label
            htmlFor="telegram-verify-input"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {t(
              "settings.verifyGroupUsername",
              "Verify Group / Channel Username or Link"
            )}
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="telegram-verify-input"
              type="text"
              value={telegramGroupToVerify}
              onChange={(e) =>
                setTelegramGroupToVerify(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleVerifyTelegram();
                }
              }}
              placeholder="@shop_orders or https://t.me/shop_orders"
              className={inputClass}
            />

            <button
              type="button"
              onClick={handleVerifyTelegram}
              disabled={
                verifyStatus.loading ||
                !telegramGroupToVerify.trim()
              }
              className="
                h-10 px-4
                rounded-xl
                bg-slate-800
                text-white
                text-xs font-semibold
                hover:bg-slate-700
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
                whitespace-nowrap
              "
            >
              {verifyStatus.loading
                ? t(
                    "settings.verifying",
                    "Verifying..."
                  )
                : t(
                    "settings.verify",
                    "Verify"
                  )}
            </button>
          </div>
        </div>

        {/* =========================
            HIDDEN CHAT ID
        ========================= */}
        <input
          type="hidden"
          {...register("chat_id")}
        />

        {/* =========================
            CONNECTED STATUS
        ========================= */}
        {verifyStatus.info && (
          <div className="max-w-xl p-4 bg-white border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-600 mb-3">
              <div
                className="w-2 h-2 rounded-full bg-green-500"
                aria-hidden="true"
              />

              <span className="text-xs font-bold">
                {t(
                  "settings.statusConnected",
                  "Status: Connected"
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-700">
                  {t(
                    "settings.chatTitle",
                    "Chat:"
                  )}
                </span>{" "}
                {verifyStatus.info.title || "N/A"}
              </div>

              <div>
                <span className="font-semibold text-slate-700">
                  {t(
                    "settings.username",
                    "Username:"
                  )}
                </span>{" "}
                {verifyStatus.info.username
                  ? `@${verifyStatus.info.username}`
                  : "N/A"}
              </div>

              {verifyStatus.info.type && (
                <div>
                  <span className="font-semibold text-slate-700">
                    {t(
                      "settings.type",
                      "Type:"
                    )}
                  </span>{" "}
                  {verifyStatus.info.type}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}
        {verifyStatus.error && (
          <div className="max-w-xl p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600 font-medium">
              {verifyStatus.error}
            </p>
          </div>
        )}
      </div>

      {/* =========================
          TELEGRAM MODAL
      ========================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="telegram-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="
              relative
              w-full max-w-sm
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#870d4c]/10 flex items-center justify-center">
                  <Send
                    size={15}
                    className="text-[#870d4c]"
                    aria-hidden="true"
                  />
                </div>

                <h2
                  id="telegram-modal-title"
                  className="text-sm font-bold text-slate-900"
                >
                  {t(
                    "settings.addTelegramBot",
                    "Add Telegram Bot"
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={t(
                  "common.close",
                  "Close"
                )}
                className="
                  w-8 h-8
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                  transition
                  flex items-center justify-center
                "
              >
                <X
                  size={16}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="text-xs text-slate-500 mb-4">
                {t(
                  "settings.addTelegramBotDesc",
                  "Choose where you want to add the bot."
                )}
              </p>

              <div className="space-y-3">
                {/* =========================
                    GROUP
                ========================= */}
                <a
                  id="telegram-add-group-btn"
                  href={GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTelegramLinkClick}
                  className="
                    w-full
                    flex items-center gap-3.5
                    p-4
                    rounded-xl
                    border border-slate-200
                    hover:border-[#870d4c]/40
                    hover:bg-[#870d4c]/[0.03]
                    transition-all
                    text-left
                    group
                  "
                >
                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-slate-100
                      group-hover:bg-[#870d4c]/10
                      flex items-center justify-center
                      shrink-0
                      transition-colors
                    "
                  >
                    <Users
                      size={18}
                      className="
                        text-slate-500
                        group-hover:text-[#870d4c]
                        transition-colors
                      "
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#870d4c] transition-colors">
                      {t(
                        "settings.telegramGroup",
                        "Telegram Group"
                      )}
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {t(
                        "settings.telegramGroupDesc",
                        "Add bot to a Telegram group."
                      )}
                    </p>
                  </div>
                </a>

                {/* =========================
                    CHANNEL
                ========================= */}
                <a
                  id="telegram-add-channel-btn"
                  href={CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTelegramLinkClick}
                  className="
                    w-full
                    flex items-center gap-3.5
                    p-4
                    rounded-xl
                    border border-slate-200
                    hover:border-[#870d4c]/40
                    hover:bg-[#870d4c]/[0.03]
                    transition-all
                    text-left
                    group
                  "
                >
                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-slate-100
                      group-hover:bg-[#870d4c]/10
                      flex items-center justify-center
                      shrink-0
                      transition-colors
                    "
                  >
                    <Radio
                      size={18}
                      className="
                        text-slate-500
                        group-hover:text-[#870d4c]
                        transition-colors
                      "
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#870d4c] transition-colors">
                      {t(
                        "settings.telegramChannel",
                        "Telegram Channel"
                      )}
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {t(
                        "settings.telegramChannelDesc",
                        "Add bot as a channel administrator."
                      )}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <p className="text-[10px] text-slate-400 text-center leading-4">
                {t(
                  "settings.addBotHint",
                  "After adding the bot, come back and verify your group or channel username below."
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TelegramConnectionSection;
