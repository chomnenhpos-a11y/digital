import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { slideSchema } from "../schemas/slideSchema";
import GradientPicker from "./GradientPicker";

export default function SlideForm({ onSubmit, initialData }) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      tag: "",
      title: "",
      description: "",
      discountPercentage: "",
      ctaText: "",
      backgroundColor:
        "linear-gradient(90deg, #FF5733 0%, #FFC300 100%)",
      status: "Active",
    },
  });

  const isEditing = !!initialData;
  const backgroundColor = watch("backgroundColor");

  useEffect(() => {
    reset({
      tag: initialData?.tag || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      discountPercentage:
        initialData?.discountPercentage ?? "",
      ctaText: initialData?.ctaText || "",
      backgroundColor:
        initialData?.backgroundColor ||
        "linear-gradient(90deg, #FF5733 0%, #FFC300 100%)",
      status: initialData?.status || "Active",
    });
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
    >
      {/* Section 1: Core Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {t("promotions.badge")}
          </label>
          <input
            type="text"
            {...register("tag")}
            placeholder={t("promotions.badgePlaceholder")}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/10"
          />
          {errors.tag && (
            <p className="text-xs text-red-500 mt-1">
              {errors.tag?.message ? t(errors.tag.message) : ""}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {t("promotions.titleLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title")}
            placeholder={t("promotions.titlePlaceholder")}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/10"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">
              {errors.title?.message ? t(errors.title.message) : ""}
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Discount & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {t("promotions.discount")}
          </label>
          <input
            type="number"
            min="0"
            max="100"
            {...register("discountPercentage", {
              setValueAs: (value) =>
                value === "" ? undefined : Number(value),
            })}
            placeholder={t("promotions.discountPlaceholder")}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/10"
          />
          {errors.discountPercentage && (
            <p className="text-xs text-red-500 mt-1">
              {errors.discountPercentage?.message
                ? t(errors.discountPercentage.message)
                : ""}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {t("promotions.status")}
          </label>
          <select
            {...register("status")}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/10"
          >
            <option value="Active">{t("promotions.active")}</option>
            <option value="Inactive">{t("promotions.inactive")}</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-500 mt-1">
              {errors.status?.message ? t(errors.status.message) : ""}
            </p>
          )}
        </div>
      </div>

      {/* Section 3: Action & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {t("promotions.ctaLabel")}
          </label>
          <input
            type="text"
            {...register("ctaText")}
            placeholder={t("promotions.ctaPlaceholder")}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/10"
          />
          {errors.ctaText && (
            <p className="text-xs text-red-500 mt-1">
              {errors.ctaText?.message ? t(errors.ctaText.message) : ""}
            </p>
          )}
        </div>
      </div>

      {/* Section 4: Full-width Background Gradient Picker */}
      <div className="p-4 bg-[#fcfafb] border border-slate-200/80 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            {t("promotions.bgColorLabel")}
          </label>
          {/* Live Preview Swatch */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Preview:</span>
            <div
              className="w-8 h-4 rounded-md shadow-inner border border-slate-200"
              style={{ background: backgroundColor }}
            />
          </div>
        </div>

        <GradientPicker
          value={backgroundColor}
          onChange={(value) =>
            setValue("backgroundColor", value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />

        {errors.backgroundColor && (
          <p className="text-xs text-red-500 mt-1">
            {errors.backgroundColor?.message
              ? t(errors.backgroundColor.message)
              : ""}
          </p>
        )}
      </div>

      {/* Section 5: Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          {t("promotions.descriptionLabel")}
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder={t("promotions.descPlaceholder")}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none resize-none transition focus:border-[#870d4c] focus:ring-2 focus:ring-[#870d4c]/10"
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">
            {errors.description?.message
              ? t(errors.description.message)
              : ""}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl bg-[#9d1159] text-white hover:bg-[#9d1159] active:scale-[0.98] transition shadow-sm shadow-[#870d4c]/20"
        >
          <Save size={16} />
          {isEditing ? t("promotions.updateBtn") : t("promotions.saveBtn")}
        </button>
      </div>
    </form>
  );
}