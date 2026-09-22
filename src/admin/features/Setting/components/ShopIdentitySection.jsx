import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Store, Tag, Phone, Info, MapPin, Image as ImageIcon } from "lucide-react";
import SectionHeader from "./common/SectionHeader";
import FormField from "./common/SettingFormField";
import ImageUpload from "./common/ImageUpload";

const inputClass =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/20";

const textareaClass =
  "w-full min-h-[96px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/20";

const ShopIdentitySection = ({ logoPreview, handleLogoChange, handleClearLogo }) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-5">
      {/* Desktop: fields left, logo right. Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Fields column ── */}
        <div className="flex-1 space-y-4">
          <SectionHeader
            icon={Store}
            title={t("settings.shopIdentity", "Shop Identity")}
            description={t(
              "settings.shopIdentityDesc",
              "Configure the basic information displayed across your shop."
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <FormField
              label={t("settings.shopName", "Shop Name")}
              required
              error={errors.shop_name}
            >
              <div className="relative">
                <Tag
                  size={16}
                  aria-hidden="true"
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="field-shop_name"
                  type="text"
                  placeholder={t("settings.shopNamePlaceholder", "Enter shop name")}
                  aria-invalid={!!errors.shop_name}
                  aria-describedby={errors.shop_name ? "error-shop_name" : undefined}
                  className={`${inputClass} pl-9`}
                  {...register("shop_name")}
                />
              </div>
            </FormField>

            {/* Support Phone */}
            <FormField
              label={t("settings.supportPhone", "Support Phone")}
              error={errors.phone}
            >
              <div className="relative">
                <Phone
                  size={16}
                  aria-hidden="true"
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="field-phone"
                  type="text"
                  placeholder={t("settings.phonePlaceholder", "+855 12 345 678")}
                  aria-invalid={!!errors.phone}
                  className={`${inputClass} pl-9`}
                  {...register("phone")}
                />
              </div>
            </FormField>

            {/* Shop Bio */}
            <FormField
              label={t("settings.bioShop", "Shop Bio")}
              error={errors.bio_shop}
              className="md:col-span-2"
            >
              <div className="relative">
                <Info
                  size={16}
                  aria-hidden="true"
                  className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"
                />
                <textarea
                  id="field-bio_shop"
                  placeholder={t(
                    "settings.bioShopPlaceholder",
                    "Write a short description about your shop"
                  )}
                  aria-invalid={!!errors.bio_shop}
                  className={`${textareaClass} pl-9`}
                  {...register("bio_shop")}
                />
              </div>
            </FormField>

            {/* Address */}
            <FormField
              label={t("settings.address", "Address")}
              error={errors.address}
              className="md:col-span-2"
            >
              <div className="relative">
                <MapPin
                  size={16}
                  aria-hidden="true"
                  className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"
                />
                <textarea
                  id="field-address"
                  placeholder={t(
                    "settings.addressDetailedPlaceholder",
                    "Enter your shop address"
                  )}
                  aria-invalid={!!errors.address}
                  className={`${textareaClass} pl-9`}
                  {...register("address")}
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* ── Logo column ── */}
        <div className="lg:w-56 shrink-0">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#fcfafb] flex items-center justify-center shrink-0">
              <ImageIcon size={19} className="text-slate-700" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t("settings.shopLogo", "Shop Logo")}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-5">
                {t("settings.shopLogoDesc", "Upload your shop logo (PNG, JPG, WEBP, max 1MB).")}
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-start">
            <ImageUpload
              id="logo-upload"
              preview={logoPreview}
              onChange={handleLogoChange}
              onClear={handleClearLogo}
              icon={ImageIcon}
              uploadText={t("settings.uploadLogo", "Upload Logo")}
              hint={t("settings.logoUploadHint", "PNG, JPG, WEBP · Max 1MB")}
              className="w-40 h-40 rounded-2xl border border-slate-200 bg-[#fcfafb]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopIdentitySection;
