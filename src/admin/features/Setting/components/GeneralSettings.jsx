import React, { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  MessageCircle,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  FileText,
  X,
  Send,
  Users,
  Video,
  Camera,
  AtSign,
  Play,
  Briefcase,
  QrCode,
  Save,
  RotateCcw,
  // NEW ICONS ADDED FOR INPUTS:
  Phone,
  Tag,
  Info
} from "lucide-react";
import Select from "react-select";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useGeneralSetting } from "../hooks/useGeneralSetting";
import SectionHeader from "./common/SectionHeader";
import FormField from "./common/SettingFormField";
import ImageUpload from "./common/ImageUpload";
import { telegramService } from "../../../../services/telegramService";

const socialIconOptions = [
  {
    value: "telegram",
    label: "Telegram",
    icon: Send,
    color: "#229ED9",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Users,
    color: "#1877F2",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: Video,
    color: "#000000",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: Camera,
    color: "#E4405F",
  },
  {
    value: "twitter",
    label: "Twitter / X",
    icon: AtSign,
    color: "#111827",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: Play,
    color: "#FF0000",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Briefcase,
    color: "#0A66C2",
  },
  {
    value: "website",
    label: "Website / Other",
    icon: Globe,
    color: "#475569",
  },
];



const inputClass =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/30/10";

const textareaClass =
  "w-full min-h-[96px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/30/10";

const GeneralSettings = () => {
  const { t } = useTranslation();

  const {
    register,
    control,
    errors,
    fields,
    append,
    remove,
    watch,
    handleSubmit,
    onSubmit,
    handleCancel,
    handleLogoChange,
    handleQrUploadChange,
    handleSupportChange,
    handleClearLogo,
    handleClearQr,
    handleClearSupport,
    logoPreview,
    qrPreview,
    qrFileName,
    supportFileName,
    isSubmitting,
    setValue,
    settingData,
  } = useGeneralSetting();

  const socialMedia = watch("social_media");

  const [telegramGroupToVerify, setTelegramGroupToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState({ loading: false, info: null, error: null });

  useEffect(() => {
    let isMounted = true;
    const fetchChatInfo = async () => {
      if (settingData?.chat_id && !verifyStatus.info) {
        try {
          const result = await telegramService.verifyGroup(settingData.chat_id);
          if (isMounted && result.success && result.data) {
            setVerifyStatus(prev => ({ ...prev, info: result.data }));
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
        setValue('chat_id', result.data.chat_id, { shouldValidate: true, shouldDirty: true });

        Swal.fire({
          icon: "success",
          title: t("common.success", "Success! ✅"),
          text: t("settings.telegramVerifySuccess", "Telegram group verified successfully!"),
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      const errorMsg = err.message || t("settings.verificationFailed", "Verification failed");
      setVerifyStatus({ loading: false, info: null, error: errorMsg });

      Swal.fire({
        icon: "error",
        title: t("common.error", "Error"),
        text: errorMsg,
      });
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#9d1159] flex items-center justify-center">
                  <Store size={20} className="text-white" />
                </div>

                <div>
                  <h1 className="text-base font-bold text-slate-900">
                    {t("settings.generalSettings", "General Settings")}
                  </h1>

                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      "settings.generalDesc",
                      "Manage your shop information and branding.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <RotateCcw size={15} />

                  {t("common.cancel", "Cancel")}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg bg-[#9d1159] text-white text-xs font-semibold hover:bg-[#9d1159] transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={15} />

                  {isSubmitting
                    ? t("common.saving", "Saving...")
                    : t("settings.saveChanges", "Save Changes")}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-8 space-y-5">
                <section className="border border-slate-200 rounded-2xl p-5">
                  <SectionHeader
                    icon={Store}
                    title={t("settings.shopIdentity", "Shop Identity")}
                    description={t(
                      "settings.shopIdentityDesc",
                      "Configure the basic information displayed across your shop.",
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      label={t("settings.shopName", "Shop Name")}
                      required
                      error={errors.shop_name}
                    >
                      <div className="relative">
                        <Tag
                          size={16}
                          className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder={t(
                            "settings.shopNamePlaceholder",
                            "Enter shop name",
                          )}
                          className={`${inputClass} pl-9`}
                          {...register("shop_name")}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label={t("settings.supportPhone", "Support Phone")}
                      error={errors.phone}
                    >
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder={t(
                            "settings.phonePlaceholder",
                            "+855 12 345 678",
                          )}
                          className={`${inputClass} pl-9`}
                          {...register("phone")}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label={t("settings.bioShop", "Shop Bio")}
                      error={errors.bio_shop}
                      className="md:col-span-2"
                    >
                      <div className="relative">
                        <Info
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"
                        />
                        <textarea
                          placeholder={t(
                            "settings.bioShopPlaceholder",
                            "Write a short description about your shop",
                          )}
                          className={`${textareaClass} pl-9`}
                          {...register("bio_shop")}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label={t("settings.address", "Address")}
                      error={errors.address}
                      className="md:col-span-2"
                    >
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"
                        />
                        <textarea
                          placeholder={t(
                            "settings.addressDetailedPlaceholder",
                            "Enter your shop address",
                          )}
                          className={`${textareaClass} pl-9`}
                          {...register("address")}
                        />
                      </div>
                    </FormField>

                    <div className="md:col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Send size={18} className="text-[#229ED9]" />
                        <h3 className="text-sm font-bold text-slate-800">{t("settings.telegramBotIntegration", "Telegram Bot Integration")}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">
                        {t("settings.telegramBotIntegrationDesc", "To receive order notifications, add your bot to a Telegram group as an Admin, then enter the group username (e.g. @my_shop) or link (e.g. https://t.me/my_shop) and verify it to get the Chat ID.")}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {t("settings.verifyGroupUsername", "Verify Group Username or Link")}
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={telegramGroupToVerify}
                                onChange={(e) => setTelegramGroupToVerify(e.target.value)}
                                placeholder="@shop_orders or https://t.me/..."
                                className={`${inputClass}`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleVerifyTelegram}
                              disabled={verifyStatus.loading || !telegramGroupToVerify}
                              className="h-10 px-4 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-50"
                            >
                              {verifyStatus.loading ? t("settings.verifying", "Verifying...") : t("settings.verify", "Verify")}
                            </button>
                          </div>
                        </div>

                        <input type="hidden" {...register("chat_id")} />
                      </div>

                      {verifyStatus.info && (
                        <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-600 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-bold">{t("settings.statusConnected", "Status: Connected")}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div><span className="font-semibold text-slate-700">{t("settings.group", "Group:")}</span> {verifyStatus.info.title || 'N/A'}</div>
                            <div><span className="font-semibold text-slate-700">{t("settings.username", "Username:")}</span> {verifyStatus.info.username ? `@${verifyStatus.info.username}` : 'N/A'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="border border-slate-200 rounded-2xl p-5">
                  <SectionHeader
                    icon={LinkIcon}
                    title={t("settings.socialMedia", "Social Media")}
                    description={t(
                      "settings.socialMediaDesc",
                      "Manage the social media links displayed on your storefront.",
                    )}
                  />

                  <div className="space-y-3">
                    {fields.length > 0 ? (
                      fields.map((field, index) => {
                        const currentName =
                          socialMedia?.[index]?.title?.trim() || "";

                        const currentIcon = socialMedia?.[index]?.icon || "";

                        const matchedByIcon = socialIconOptions.find(
                          (option) => option.value === currentIcon,
                        );

                        const matchedByName = socialIconOptions.find(
                          (option) =>
                            option.label.toLowerCase() ===
                            currentName.toLowerCase(),
                        );

                        const selectedOption =
                          matchedByIcon ||
                          matchedByName ||
                          socialIconOptions.find(
                            (option) => option.value === "website",
                          );

                        const Icon = selectedOption.icon;

                        return (
                          <div
                            key={field.id}
                            className="group rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-[48px_1fr_1.5fr_40px] md:grid-cols-[48px_1fr_1fr_40px] gap-3 items-end">
                              <Controller
                                name={`social_media.${index}.icon`}
                                control={control}
                                render={({ field: selectField }) => (
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-2">
                                      {t("settings.icon", "Icon")}
                                    </label>

                                    <Select
                                      value={
                                        socialIconOptions.find(
                                          (option) =>
                                            option.value === selectField.value,
                                        ) || null
                                      }
                                      onChange={(option) =>
                                        selectField.onChange(
                                          option?.value || "",
                                        )
                                      }
                                      options={socialIconOptions}
                                      isSearchable={false}
                                      isClearable
                                      placeholder="—"
                                      menuPlacement="top"
                                      className="text-sm"
                                      styles={{
                                        control: (base, state) => ({
                                          ...base,
                                          minHeight: "40px",
                                          height: "40px",
                                          width: "48px",
                                          borderRadius: "10px",
                                          borderColor: state.isFocused
                                            ? "#3b82f6"
                                            : "#e2e8f0",
                                          boxShadow: state.isFocused
                                            ? "0 0 0 2px rgba(59,130,246,.08)"
                                            : "none",
                                          cursor: "pointer",
                                        }),

                                        valueContainer: (base) => ({
                                          ...base,
                                          padding: "0 8px",
                                          justifyContent: "center",
                                        }),

                                        indicatorsContainer: (base) => ({
                                          ...base,
                                          display: "none",
                                        }),

                                        singleValue: (base) => ({
                                          ...base,
                                          margin: 0,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }),

                                        menu: (base) => ({
                                          ...base,
                                          width: "190px",
                                          zIndex: 50,
                                        }),

                                        option: (base, state) => ({
                                          ...base,
                                          backgroundColor: state.isFocused
                                            ? "#f8fafc"
                                            : "white",
                                          color: "#334155",
                                          cursor: "pointer",
                                        }),
                                      }}
                                      formatOptionLabel={(
                                        option,
                                        { context },
                                      ) => {
                                        const OptionIcon = option.icon;

                                        if (context === "value") {
                                          return (
                                            <OptionIcon
                                              size={17}
                                              style={{
                                                color: option.color,
                                              }}
                                            />
                                          );
                                        }

                                        return (
                                          <div className="flex items-center gap-2">
                                            <OptionIcon
                                              size={15}
                                              style={{
                                                color: option.color,
                                              }}
                                            />

                                            <span className="text-xs">
                                              {option.label}
                                            </span>
                                          </div>
                                        );
                                      }}
                                    />
                                  </div>
                                )}
                              />

                              <FormField
                                label={t(
                                  "settings.socialMediaName",
                                  "Social Media Name",
                                )}
                                error={errors.social_media?.[index]?.title}
                              >
                                <div className="relative">
                                  {/* Dynamic Icon based on selected option */}
                                  <Icon
                                    size={16}
                                    className="absolute left-3 top-3 pointer-events-none transition-colors"
                                    style={{ color: selectedOption.color || '#94a3b8' }}
                                  />
                                  <input
                                    type="text"
                                    placeholder={t(
                                      "settings.socialMediaNamePlaceholder",
                                      "Facebook",
                                    )}
                                    className={`${inputClass} font-medium pl-9`}
                                    {...register(`social_media.${index}.title`)}
                                  />
                                </div>
                              </FormField>

                              <FormField
                                label={t("settings.socialMediaUrl", "URL")}
                                error={errors.social_media?.[index]?.url}
                              >
                                <div className="relative">
                                  <LinkIcon
                                    size={14}
                                    className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                                  />

                                  <input
                                    type="url"
                                    placeholder={t(
                                      "settings.socialMediaPlaceholder",
                                      "https://chomnenhdigita.com",
                                    )}
                                    className={`${inputClass} pl-9`}
                                    {...register(`social_media.${index}.url`)}
                                  />
                                </div>
                              </FormField>

                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="h-10 w-10 rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center"
                                title={t("common.delete", "Delete")}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {currentName && (
                              <div className="mt-2 ml-0 md:ml-[60px] flex items-center gap-2">
                                <Icon
                                  size={13}
                                  style={{
                                    color: selectedOption.color,
                                  }}
                                />

                                <span className="text-[10px] text-slate-400">
                                  {selectedOption.label !== currentName
                                    ? selectedOption.label
                                    : currentName}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-xl py-9 text-center">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-[#fcfafb] flex items-center justify-center mb-3">
                          <Globe size={19} className="text-slate-300" />
                        </div>

                        <p className="text-xs font-medium text-slate-500">
                          {t(
                            "settings.noSocialMedia",
                            "No social media links added yet.",
                          )}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          {t(
                            "settings.addSocialMediaHint",
                            "Add your social media name and URL below.",
                          )}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        append({
                          icon: "",
                          title: "",
                          url: "",
                        })
                      }
                      className="w-full h-10 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={15} />

                      {t("settings.addSocialMedia", "Add Social Media")}
                    </button>
                  </div>
                </section>
              </div>

              <div className="xl:col-span-4 space-y-5">
                <section className="border border-slate-200 rounded-2xl p-5">
                  <SectionHeader
                    icon={ImageIcon}
                    title={t("settings.shopLogo", "Shop Logo")}
                    description={t(
                      "settings.uploadLogo",
                      "Upload your shop logo.",
                    )}
                  />

                  <ImageUpload
                    id="logo-upload"
                    preview={logoPreview}
                    onChange={handleLogoChange}
                    onClear={handleClearLogo}
                    icon={ImageIcon}
                    uploadText={t("settings.uploadLogo", "Upload Logo")}
                  />
                </section>

                <section className="border border-slate-200 rounded-2xl p-5">
                  <SectionHeader
                    icon={QrCode}
                    title={t("settings.qrUpload", "KHQR Payment")}
                    description={t(
                      "settings.qrUploadDesc",
                      "Upload a QR code image for your customers payme.",
                    )}
                  />

                  <div className="flex flex-col items-center">
                    <ImageUpload
                      id="qr-upload"
                      preview={qrPreview}
                      onChange={handleQrUploadChange}
                      onClear={handleClearQr}
                      icon={QrCode}
                      uploadText={t("settings.uploadQr", "Upload QR Code")}
                      className="w-48 h-48 rounded-2xl border border-dashed border-slate-300 bg-[#fcfafb]"
                      iconSize={24}
                    />

                    {qrFileName && (
                      <div className="w-full mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#fcfafb] border border-slate-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText
                            size={14}
                            className="text-slate-400 shrink-0"
                          />

                          <span className="text-xs text-slate-600 truncate">
                            {qrFileName}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearQr}
                          className="text-slate-400 hover:text-red-500 transition shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                <section className="border border-slate-200 rounded-2xl p-5">
                  <SectionHeader
                    icon={MessageCircle}
                    title={t("settings.supportDocument", "Support Document")}
                    description={t(
                      "settings.supportDocumentDesc",
                      "Upload a document used for customer support.",
                    )}
                  />

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
                        <FileText size={18} className="text-slate-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {supportFileName ||
                            t(
                              "settings.selectSupportDocument",
                              "Select Support Document",
                            )}
                        </p>
                        <div className="flex items-center gap-1">
                          <Upload size={16} className="text-slate-400 shrink-0" />
                          <p className="text-[10px] text-slate-400 mt-1">
                            PDF, DOC, DOCX
                          </p>
                        </div>
                      </div>

                    </label>

                    {supportFileName && (
                      <button
                        type="button"
                        onClick={handleClearSupport}
                        className="absolute right-2 top-2 w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;