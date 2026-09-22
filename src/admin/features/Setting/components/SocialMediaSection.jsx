import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Trash2,
  Globe,
  Link as LinkIcon,
  Send,
  Users,
  Video,
  Camera,
  AtSign,
  Play,
  Briefcase,
} from "lucide-react";
import Select from "react-select";
import SectionHeader from "./common/SectionHeader";
import FormField from "./common/SettingFormField";

const getSocialIconOptions = (t) => [
  { value: "telegram",  label: t("settings.socialIconTelegram",  "Telegram"),       icon: Send,     color: "#229ED9" },
  { value: "facebook",  label: t("settings.socialIconFacebook",  "Facebook"),       icon: Users,    color: "#1877F2" },
  { value: "tiktok",   label: t("settings.socialIconTikTok",   "TikTok"),          icon: Video,    color: "#000000" },
  { value: "instagram",label: t("settings.socialIconInstagram","Instagram"),       icon: Camera,   color: "#E4405F" },
  { value: "twitter",  label: t("settings.socialIconTwitter",  "Twitter / X"),     icon: AtSign,   color: "#111827" },
  { value: "youtube",  label: t("settings.socialIconYouTube",  "YouTube"),         icon: Play,     color: "#FF0000" },
  { value: "linkedin", label: t("settings.socialIconLinkedIn", "LinkedIn"),        icon: Briefcase,color: "#0A66C2" },
  { value: "website",  label: t("settings.socialIconWebsite",  "Website / Other"), icon: Globe,    color: "#475569" },
];

const inputClass =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/20";
const SocialMediaSection = ({ fields, append, remove }) => {
  const { t } = useTranslation();
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const socialIconOptions = getSocialIconOptions(t);
  const socialMedia = watch("social_media");

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={LinkIcon}
        title={t("settings.socialMedia", "Social Media")}
        description={t(
          "settings.socialMediaDesc",
          "Manage the social media links displayed on your storefront."
        )}
      />

      <div className="space-y-3">
        {fields.length > 0 ? (
          fields.map((field, index) => {
            const currentName = socialMedia?.[index]?.title?.trim() || "";
            const currentIcon = socialMedia?.[index]?.icon || "";

            const matchedByIcon = socialIconOptions.find(
              (option) => option.value === currentIcon
            );
            const matchedByName = socialIconOptions.find(
              (option) =>
                option.label.toLowerCase() === currentName.toLowerCase()
            );
            const selectedOption =
              matchedByIcon ||
              matchedByName ||
              socialIconOptions.find((option) => option.value === "website");

            const Icon = selectedOption.icon;

            return (
              <div
                key={field.id}
                className="group rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[48px_1fr_1.5fr_40px] md:grid-cols-[48px_1fr_1fr_40px] gap-3 items-end">
                  {/* Icon picker */}
                  <Controller
                    name={`social_media.${index}.icon`}
                    control={control}
                    render={({ field: selectField }) => {
                      const hasIconError = !!errors.social_media?.[index]?.icon;
                      return (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-2">
                            {t("settings.icon", "Icon")}
                            <span className="text-red-500 ml-1">*</span>
                          </label>

                          <Select
                            value={
                              socialIconOptions.find(
                                (option) => option.value === selectField.value
                              ) || null
                            }
                            onChange={(option) =>
                              selectField.onChange(option?.value || "")
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
                                borderColor: hasIconError
                                  ? "#ef4444"
                                  : state.isFocused
                                  ? "#870d4c"
                                  : "#e2e8f0",
                                boxShadow: hasIconError
                                  ? "0 0 0 2px rgba(239,68,68,.15)"
                                  : state.isFocused
                                  ? "0 0 0 2px rgba(135,13,76,.12)"
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
                                backgroundColor: state.isFocused ? "#f8fafc" : "white",
                                color: "#334155",
                                cursor: "pointer",
                              }),
                            }}
                            formatOptionLabel={(option, { context }) => {
                              const OptionIcon = option.icon;
                              if (context === "value") {
                                return (
                                  <OptionIcon
                                    size={17}
                                    style={{ color: option.color }}
                                    aria-hidden="true"
                                  />
                                );
                              }
                              return (
                                <div className="flex items-center gap-2">
                                  <OptionIcon
                                    size={15}
                                    style={{ color: option.color }}
                                    aria-hidden="true"
                                  />
                                  <span className="text-xs">{option.label}</span>
                                </div>
                              );
                            }}
                          />

                          {hasIconError && (
                            <p className="text-xs text-red-500 mt-1.5">
                              {t(
                                errors.social_media[index].icon.message,
                                "Icon is required"
                              )}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* Social media name */}
                  <FormField
                    label={t("settings.socialMediaName", "Social Media Name")}
                    error={errors.social_media?.[index]?.title}
                  >
                    <div className="relative">
                      <Icon
                        size={16}
                        aria-hidden="true"
                        className="absolute left-3 top-3 pointer-events-none transition-colors"
                        style={{ color: selectedOption.color || "#94a3b8" }}
                      />
                      <input
                        type="text"
                        placeholder={t(
                          "settings.socialMediaNamePlaceholder",
                          "Facebook"
                        )}
                        aria-invalid={!!errors.social_media?.[index]?.title}
                        className={`${inputClass} font-medium pl-9`}
                        {...register(`social_media.${index}.title`)}
                      />
                    </div>
                  </FormField>

                  {/* URL */}
                  <FormField
                    label={t("settings.socialMediaUrl", "URL")}
                    error={errors.social_media?.[index]?.url}
                  >
                    <div className="relative">
                      <LinkIcon
                        size={14}
                        aria-hidden="true"
                        className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="url"
                        placeholder={t(
                          "settings.socialMediaPlaceholder",
                          "https://example.com"
                        )}
                        aria-invalid={!!errors.social_media?.[index]?.url}
                        className={`${inputClass} pl-9`}
                        {...register(`social_media.${index}.url`)}
                      />
                    </div>
                  </FormField>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="h-10 w-10 rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center"
                    title={t("common.delete", "Delete")}
                    aria-label={`${t("common.delete", "Delete")} ${currentName || `#${index + 1}`}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>

                {/* Platform label preview */}
                {currentName && (
                  <div className="mt-2 ml-0 md:ml-[60px] flex items-center gap-2">
                    <Icon
                      size={13}
                      aria-hidden="true"
                      style={{ color: selectedOption.color }}
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
              <Globe size={19} className="text-slate-300" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t("settings.noSocialMedia", "No social media links added yet.")}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {t(
                "settings.addSocialMediaHint",
                "Add your social media name and URL below."
              )}
            </p>
          </div>
        )}

        {/* Add button */}
        <button
          type="button"
          onClick={() => append({ icon: "", title: "", url: "" })}
          className="w-full h-10 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-center gap-2"
        >
          <Plus size={15} aria-hidden="true" />
          {t("settings.addSocialMedia", "Add Social Media")}
        </button>
      </div>
    </div>
  );
};

export default SocialMediaSection;
