import React, { useEffect, useState } from "react";
import { Save, Image as ImageIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../schemas/categorySchema";
import { useTranslation } from "react-i18next";

export default function CategoryForm({ onSubmit, initialData }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      description: "",
    },
  });

  const [previewImage, setPreviewImage] = useState(null);
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        image: initialData.image || "",
        description: initialData.description || "",
      });
      if (initialData.image) {
        setPreviewImage(initialData.image);
      }
    } else {
      reset({
        name: "",
        slug: "",
        image: "",
        description: "",
      });
      setPreviewImage(null);
    }
  }, [initialData, reset]);

  const name = watch("name");
  useEffect(() => {
    if (!isEditing && name) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      setValue("slug", slug, {
        shouldValidate: true,
      });
    }
  }, [name, isEditing, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
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
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between mb-1">
            {t('category.nameLabel')} {!isEditing && "*"}
          </label>
          <input
            type="text"
            {...register("name")}
            placeholder={t('category.namePlaceholder')}
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between mb-1">
            Slug {!isEditing && "*"}
          </label>
          <input
            type="text"
            {...register("slug")}
            placeholder="slug"
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />
          {errors.slug && (
            <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 block">
          {t('category.descLabel')}
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder={t('category.descPlaceholder')}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#870d4c] focus:ring-4 focus:ring-[#870d4c]/10 transition-all duration-200 resize-none bg-[#fcfafb]/50 hover:bg-white focus:bg-white text-slate-700"
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          {t('category.imageLabel')}
        </label>
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2 px-3 py-2 text-sm bg-[#fcfafb] rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition">
            <Upload size={16} className="text-gray-500" />
            <span className="flex-1 truncate text-left text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
              {watch("image")?.name ? watch("image").name : t('category.selectImage')}
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
        {errors.image && (
          <p className="text-xs text-red-500 mt-1">
            {errors.image.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-[#870d4c] to-[#9d1159] hover:from-[#9d1159] hover:to-[#44092e] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isEditing ? t('category.updateBtn') : t('category.saveBtn')}
        </button>
      </div>
    </form>
  );
}