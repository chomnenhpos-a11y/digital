import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, Image as ImageIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliveryProviderSchema } from "../schemas/delivery_providerSchema";

export default function DeliveryProviderForm({ onSubmit, initialData }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deliveryProviderSchema),
    defaultValues: {
      name: "",
      phone: "",
      shipping_fee: "",
      logo: "",
      is_active: 1,
    },
  });

  const [previewImage, setPreviewImage] = useState(null);
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        phone: initialData.phone || "",
        shipping_fee: initialData.shipping_fee || "",
        logo: initialData.logo || "",
        is_active: initialData.is_active === undefined ? 1 : initialData.is_active,
      });
      if (initialData.logo) {
        setPreviewImage(initialData.logo);
      }
    } else {
      reset({
        name: "",
        phone: "",
        shipping_fee: "",
        logo: "",
        is_active: 1,
      });
      setPreviewImage(null);
    }
  }, [initialData, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true });
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            {t('delivery.providerName')} *
            {errors.name && <span className="text-rose-500 text-xs font-medium">{t(errors.name.message)}</span>}
          </label>
          <input
            type="text"
            {...register("name")}
            placeholder="J&T, Vireak Buntham..."
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            {t('delivery.phone')} *
            {errors.phone && <span className="text-rose-500 text-xs font-medium">{t(errors.phone.message)}</span>}
          </label>
          <input
            type="text"
            {...register("phone")}
            placeholder="012345678"
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            {t('delivery.shippingFee')} *
            {errors.shipping_fee && <span className="text-rose-500 text-xs font-medium">{t(errors.shipping_fee.message)}</span>}
          </label>
          <input
            type="number"
            step="0.01"
            {...register("shipping_fee")}
            placeholder="2.50"
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-[#fcfafb] rounded-xl border border-slate-200">
          <label className="text-sm font-semibold text-slate-700">
            {t('common.status')}
          </label>
          <div className="flex items-center h-full pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!watch("is_active")}
                onChange={(e) => setValue("is_active", e.target.checked ? 1 : 0)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d1159]"></div>
              <span className={`ml-3 text-sm font-medium ${watch("is_active") ? 'text-[#870d4c]' : 'text-slate-500'}`}>
                {watch("is_active") ? t('common.statusActive') : t('common.statusInactive')}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          {t('delivery.logo')}
        </label>
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2 px-3 py-2 text-sm bg-[#fcfafb] rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition">
            <Upload size={16} className="text-gray-500" />
            <span className="flex-1 truncate text-left text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
              {watch("logo")?.name ? watch("logo").name : t('common.selectImage')}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-[#fcfafb] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={20} className="text-gray-400" />
            )}
          </div>
        </div>
        {errors.logo && (
          <p className="text-xs text-red-500 mt-1">
            {errors.logo?.message ? t(errors.logo.message) : ""}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-[#870d4c] to-[#9d1159] hover:from-[#9d1159] hover:to-[#44092e] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isEditing ? t('common.updateBtn') : t('common.saveBtn')}
        </button>
      </div>
    </form>
  );
}
