import React, { useEffect, useState } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ShopIdentityStep = ({
  register,
  errors,
  setValue,
  watch,
}) => {
  const { t } = useTranslation();
  const logo = watch("logo");
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (!logo || logo.length === 0) {
      setLogoPreview(null);
      return;
    }

    const file = logo[0];

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);

      return () => URL.revokeObjectURL(url);
    }

    if (typeof file === "string") {
      setLogoPreview(file);
    }
  }, [logo]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setValue("logo", undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    setValue("logo", [file], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeLogo = () => {
    setValue("logo", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* ជួរទី១៖ Shop Name និង Phone ដាក់ទំហំស្មើគ្នា (Grid 2 ຖັນ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Shop Name */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
            {t('auth.shopName')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register("shop_name")}
            placeholder="My Awesome Shop"
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-xs text-pink-950"
          />
          {errors.shop_name && (
            <span className="text-[10px] text-red-600 mt-0.5 block">
              {errors.shop_name.message}
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
            {t('auth.phone')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register("phone")}
            placeholder="012345678"
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-xs text-pink-950"
          />
          {errors.phone && (
            <span className="text-[10px] text-red-600 mt-0.5 block">
              {errors.phone.message}
            </span>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
          {t('auth.address')} <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("address")}
          placeholder="Shop Address..."
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-xs text-pink-950 min-h-[50px] resize-none"
        />
        {errors.address && (
          <span className="text-[10px] text-red-600 mt-0.5 block">
            {errors.address.message}
          </span>
        )}
      </div>

      {/* Logo (Compact Upload Box) */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
          {t('auth.logo')} <span className="text-gray-400 font-normal">(Optional)</span>
        </label>

        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          id="logo-upload"
          onChange={handleLogoChange}
        />

        <div className="flex items-center justify-between p-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:border-pink-900 transition-colors">
          <div className="flex items-center gap-2.5">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200/60 flex items-center justify-center text-gray-400">
                <ImageIcon size={18} />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-700">
                {logoPreview ? t('auth.logoSelected', 'Logo attached') : t('auth.chooseImage')}
              </p>
              <p className="text-[10px] text-gray-400">Max 1MB (JPG, PNG)</p>
            </div>
          </div>

          <label
            htmlFor="logo-upload"
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-100 hover:text-pink-900 transition-colors shadow-sm"
          >
            <UploadCloud size={14} className="inline mr-1" />
            {t('common.browse', 'Browse')}
          </label>
        </div>

        {errors.logo && (
          <span className="text-[10px] text-red-600 mt-0.5 block">
            {errors.logo.message}
          </span>
        )}
      </div>

    </div>
  );
};