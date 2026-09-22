import React, { useState, useEffect, useCallback } from "react";
import { FormProvider } from "react-hook-form";
import { Store, Send, Link as LinkIcon, QrCode, Save, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGeneralSetting } from "../hooks/useGeneralSetting";
import SettingsTabs from "./SettingsTabs";
import ShopIdentitySection from "./ShopIdentitySection";
import TelegramConnectionSection from "./TelegramConnectionSection";
import SocialMediaSection from "./SocialMediaSection";
import PaymentDocumentsSection from "./PaymentDocumentsSection";

// ─── Tab configuration ───────────────────────────────────────────────────────
const TABS = [
  {
    id: "shop-identity",
    labelKey: "settings.tabShopIdentity",
    labelFallback: "Shop Identity",
    icon: Store,
    // Fields that belong to this tab (for error routing)
    fields: ["shop_name", "phone", "bio_shop", "address", "logo"],
  },
  {
    id: "telegram",
    labelKey: "settings.tabTelegram",
    labelFallback: "Telegram Bot",
    icon: Send,
    fields: ["chat_id"],
  },
  {
    id: "social-media",
    labelKey: "settings.tabSocialMedia",
    labelFallback: "Social Media",
    icon: LinkIcon,
    fields: ["social_media"],
  },
  {
    id: "payment-docs",
    labelKey: "settings.tabPaymentDocs",
    labelFallback: "Payment & Documents",
    icon: QrCode,
    fields: ["qr_upload", "support"],
  },
];

// Returns a Set of tab indices that contain at least one error
const getErrorTabs = (errors) => {
  const errorSet = new Set();
  TABS.forEach((tab, index) => {
    const hasError = tab.fields.some((fieldName) => {
      if (fieldName === "social_media") {
        return (
          errors.social_media !== undefined &&
          (Array.isArray(errors.social_media)
            ? errors.social_media.some(Boolean)
            : true)
        );
      }
      return errors[fieldName] !== undefined;
    });
    if (hasError) errorSet.add(index);
  });
  return errorSet;
};

// Returns the index of the first tab that contains an error, or -1
const getFirstErrorTab = (errors) => {
  for (let i = 0; i < TABS.length; i++) {
    const tab = TABS[i];
    const hasError = tab.fields.some((fieldName) => {
      if (fieldName === "social_media") {
        return (
          errors.social_media !== undefined &&
          (Array.isArray(errors.social_media)
            ? errors.social_media.some(Boolean)
            : true)
        );
      }
      return errors[fieldName] !== undefined;
    });
    if (hasError) return i;
  }
  return -1;
};

// ─── Component ───────────────────────────────────────────────────────────────
const GeneralSettings = () => {
  const { t } = useTranslation();

  const {
    // RHF methods object for FormProvider
    methods,
    // useFieldArray
    fields,
    append,
    remove,
    // Actions
    onSubmit,
    handleCancel,
    // Upload handlers
    handleLogoChange,
    handleQrUploadChange,
    handleSupportChange,
    handleClearLogo,
    handleClearQr,
    handleClearSupport,
    // Previews
    logoPreview,
    qrPreview,
    qrFileName,
    supportFileName,
    // State
    isSubmitting,
    settingData,
  } = useGeneralSetting();


  // errors and handleSubmit come from the shared methods object
  const errors = methods.formState.errors;
  const handleSubmit = methods.handleSubmit;

  const [activeTab, setActiveTab] = useState(0);
  // Track tabs that had errors after the last submit attempt
  const [errorTabs, setErrorTabs] = useState(new Set());
  // Trigger focus on first invalid field after tab switch
  const [focusOnMount, setFocusOnMount] = useState(false);

  // After switching to the error tab, focus the first invalid field
  useEffect(() => {
    if (!focusOnMount) return;
    setFocusOnMount(false);
    // Small delay to let the panel render
    const timer = setTimeout(() => {
      const el = document.querySelector(
        `#tabpanel-${TABS[activeTab].id} [aria-invalid="true"]`
      );
      el?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab, focusOnMount]);

  // Wrapped submit: on error, route to first tab with errors
  const handleFormSubmit = useCallback(
    handleSubmit(
      // ── Valid ──
      async (data) => {
        setErrorTabs(new Set());
        await onSubmit(data);
      },
      // ── Invalid ──
      (validationErrors) => {
        const errSet = getErrorTabs(validationErrors);
        setErrorTabs(errSet);
        const firstErrTab = getFirstErrorTab(validationErrors);
        if (firstErrTab !== -1 && firstErrTab !== activeTab) {
          setActiveTab(firstErrTab);
          setFocusOnMount(true);
        } else if (firstErrTab === activeTab) {
          // Already on the right tab — just focus
          setTimeout(() => {
            const el = document.querySelector(
              `#tabpanel-${TABS[activeTab].id} [aria-invalid="true"]`
            );
            el?.focus();
          }, 50);
        }
      }
    ),
    [handleSubmit, onSubmit, activeTab]
  );

  useEffect(() => {
    setErrorTabs(getErrorTabs(errors));
  }, [errors]);

  // Reset — also clears the visual error indicators
  const handleReset = () => {
    setErrorTabs(new Set());
    handleCancel();
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="w-full">
      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit} noValidate>
          {/* ── Page header ── */}
          <div className="bg-white border border-slate-200 rounded-2xl">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#9d1159] flex items-center justify-center shrink-0">
                    <Store size={19} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-900">
                      {t("settings.generalSettings", "General Settings")}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t(
                        "settings.generalDesc",
                        "Manage your shop information and branding."
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <RotateCcw size={14} aria-hidden="true" />
                    {t("settings.resetChanges", "Reset")}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-4 rounded-lg bg-[#9d1159] text-white text-xs font-semibold hover:bg-[#870d4c] transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={14} aria-hidden="true" />
                    {isSubmitting
                      ? t("common.saving", "Saving...")
                      : t("settings.saveAllChanges", "Save All Changes")}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="px-5 sm:px-6 p-2">
              <SettingsTabs
                tabs={TABS}
                activeTab={activeTab}
                onChange={handleTabChange}
                errorTabs={errorTabs}
              />
            </div>

            {/* ── Tab panels ── */}
            <div className="p-5 sm:p-6">
              {TABS.map((tab, index) => (
                <div
                  key={tab.id}
                  id={`tabpanel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab.id}`}
                  tabIndex={activeTab === index ? 0 : -1}
                  style={{ display: activeTab === index ? "block" : "none" }}
                >
                  {index === 0 && (
                    <ShopIdentitySection
                      logoPreview={logoPreview}
                      handleLogoChange={handleLogoChange}
                      handleClearLogo={handleClearLogo}
                    />
                  )}
                  {index === 1 && (
                    <TelegramConnectionSection settingData={settingData} />
                  )}
                  {index === 2 && (
                    <SocialMediaSection
                      fields={fields}
                      append={append}
                      remove={remove}
                    />
                  )}
                  {index === 3 && (
                    <PaymentDocumentsSection
                      qrPreview={qrPreview}
                      qrFileName={qrFileName}
                      handleQrUploadChange={handleQrUploadChange}
                      handleClearQr={handleClearQr}
                      supportFileName={supportFileName}
                      handleSupportChange={handleSupportChange}
                      handleClearSupport={handleClearSupport}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default GeneralSettings;