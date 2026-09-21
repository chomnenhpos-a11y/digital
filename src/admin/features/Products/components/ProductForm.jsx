import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Save,
  ImagePlus,
  X,
  ChevronDown,
  Search,
  RefreshCw,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { productSchema } from "../schemas/productSchema";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";

export default function ProductsForm({ onSubmit, initialData }) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategoriesQuery();

  const [discountPercentage, setDiscountPercentage] = useState(0);
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),

    defaultValues: {
      name: "",
      categoryId: "",
      stockQuantity: "",
      price: "",
      discountPrice: "",
      salePrice: "",
      description: "",
      images: [],
    },
  });

  const name = watch("name");
  const price = watch("price");
  const discountPrice = watch("discountPrice");
  const stockQuantity = watch("stockQuantity");
  const images = watch("images");

  useEffect(() => {
    if (!initialData) {
      reset({
        name: "",
        categoryId: "",
        stockQuantity: "",
        price: "",
        discountPrice: "",
        salePrice: "",
        description: "",
        images: [],
      });

      setDiscountPercentage(0);

      return;
    }

    reset({
      name: initialData.name || "",

      categoryId: String(
        initialData.categoryId ?? initialData.category_id ?? "",
      ),

      stockQuantity:
        initialData.stockQuantity ?? initialData.stock_quantity ?? 0,

      price: initialData.price ?? "",

      discountPrice:
        initialData.discountPrice ?? initialData.discount_price ?? 0,

      salePrice: initialData.salePrice ?? initialData.sale_price ?? "",

      description: initialData.description || "",
      images: (initialData.images || []).map((img, i) =>
        typeof img === "string" ? { id: `existing-${i}`, url: img } : img,
      ),
    });
  }, [initialData, reset]);

  useEffect(() => {
    const currentPrice = Number(price);
    const currentDiscount = Number(discountPrice);

    if (currentPrice > 0 && currentDiscount > 0) {
      setDiscountPercentage(
        Math.min(Math.round((currentDiscount / currentPrice) * 100), 100),
      );
    } else {
      setDiscountPercentage(0);
    }
  }, [price, discountPrice]);

  const calculatedSalePrice = useMemo(() => {
    if (price === "") return "";

    const currentPrice = Number(price);
    const currentDiscount = Number(discountPrice) || 0;

    if (currentPrice <= 0) return 0;

    return Math.max(0, currentPrice - currentDiscount);
  }, [price, discountPrice]);

  useEffect(() => {
    setValue("salePrice", calculatedSalePrice, {
      shouldValidate: true,
    });
  }, [calculatedSalePrice, setValue]);

  const handleImageAdd = (e) => {
    const incomingFiles = Array.from(e.target.files || []);

    if (!incomingFiles.length) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const validFiles = incomingFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    const currentImages = watch("images") || [];

    const newImages = [
      ...currentImages,
      ...validFiles.map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      })),
    ];

    setValue("images", newImages, {
      shouldValidate: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageReplaceClick = (index) => {
    setReplaceIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleImageReplace = (e) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert(`${file.name} is larger than 5MB`);
      return;
    }

    const currentImages = [...(watch("images") || [])];
    const oldImage = currentImages[replaceIndex];

    if (oldImage?.isNew && oldImage?.url) {
      URL.revokeObjectURL(oldImage.url);
    }

    currentImages[replaceIndex] = {
      id: null,
      url: URL.createObjectURL(file),
      file,
      isNew: true,
    };

    setValue("images", currentImages, {
      shouldValidate: true,
    });
    setReplaceIndex(null);
  };

  const removeImage = (index) => {
    const currentImages = [...(watch("images") || [])];

    const removedImage = currentImages[index];

    if (removedImage?.isNew && removedImage?.url) {
      URL.revokeObjectURL(removedImage.url);
    }

    currentImages.splice(index, 1);

    setValue("images", currentImages, {
      shouldValidate: true,
    });
  };

  const handleFormSubmit = async (data) => {
    try {
      const payload = new FormData();

      if (isEditing && initialData?.id) {
        payload.append("id", String(initialData.id));
      }

      payload.append("name", data.name.trim());

      payload.append("category_id", String(data.categoryId || ""));

      payload.append("stock_quantity", String(data.stockQuantity || 0));

      payload.append("price", String(data.price || 0));

      payload.append("discount_price", String(data.discountPrice || 0));

      payload.append("salePrice", String(data.salePrice || 0));

      payload.append("description", data.description || "");

      const finalImages = data.images || [];

      finalImages.forEach((image) => {
        if (image?.file) {
          payload.append("images", image.file, image.file.name);
        } else if (image?.url) {
          // Append existing image URL so the backend knows to keep it
          payload.append("images", image.url);
        }
      });

      onSubmit(payload);
    } catch (error) {
      console.error("Failed to prepare product:", error);
    }
  };

  const totalImageCount = images?.length || 0;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('products.productNameLabel')} {!isEditing && "*"}
          </label>

          <input
            type="text"
            {...register("name")}
            placeholder={t('products.productNamePlaceholder')}
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('products.categoryLabel')} {!isEditing && "*"}
          </label>

          <SearchableCategorySelect
            categories={categories}
            value={watch("categoryId")}
            onChange={(value) =>
              setValue("categoryId", String(value), {
                shouldValidate: true,
              })
            }
          />

          {errors.categoryId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('products.stockLabel')}
          </label>

          <input
            type="number"
            {...register("stockQuantity")}
            min="0"
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.stockQuantity && (
            <p className="text-xs text-red-500 mt-1">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('products.originalPriceLabel')}
          </label>

          <input
            type="number"
            {...register("price")}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.price && (
            <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-xs font-semibold text-gray-600">
              {t('products.discountLabel')}
            </label>

            <span className="text-xs text-red-600">
              ({discountPercentage}%)
            </span>
          </div>

          <input
            type="number"
            {...register("discountPrice")}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.discountPrice && (
            <p className="text-xs text-red-500 mt-1">
              {errors.discountPrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('products.salePriceLabel')}
          </label>

          <input
            type="number"
            value={calculatedSalePrice}
            readOnly
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] text-gray-600 rounded-lg outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {t('products.descriptionLabel')}
        </label>

        <textarea
          {...register("description")}
          rows="3"
          placeholder={t('products.descriptionPlaceholder')}
          className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none resize-none focus:ring-2 focus:ring-gray-200"
        />

        {errors.description && (
          <p className="text-xs text-red-500 ">{errors.description.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-gray-600">
            {t('products.productImagesLabel')}
            {totalImageCount > 0 && (
              <span className="ml-1 text-[#870d4c]">({totalImageCount})</span>
            )}
          </label>

          <input
            ref={fileInputRef}
            id="product-image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageAdd}
            className="hidden"
          />

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageReplace}
            className="hidden"
          />

          <label
            htmlFor="product-image-upload"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#870d4c]/5 text-[#870d4c] hover:bg-[#870d4c]/10 cursor-pointer transition-colors"
          >
            <ImagePlus size={14} />
            {t('products.addImage')}
          </label>
        </div>

        {totalImageCount > 0 ? (
          <div className="flex flex-wrap gap-3 p-3 bg-[#fcfafb] rounded-xl border border-dashed border-gray-200">
            {images.map((image, index) => (
              <div key={image.id ?? `new-${index}`} className="relative">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 z-10"
                  title={t('common.deleteImage')}
                >
                  <X size={11} strokeWidth={3} />
                </button>

                <button
                  type="button"
                  onClick={() => handleImageReplaceClick(index)}
                  className="absolute -top-2 -left-0 w-5 h-5 rounded-full bg-[#870d4c] text-white flex items-center justify-center shadow-md hover:bg-[#9d1159] z-10"
                  title={t('common.changeImage')}
                >
                  <RefreshCw size={11} strokeWidth={3} />
                </button>

                {image.isNew && (
                  <span className="absolute bottom-1 right-1 text-[9px] bg-green-500 text-white px-1 rounded">
                    {t('common.new')}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <label
            htmlFor="product-image-upload"
            className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed border-gray-200 bg-[#fcfafb] text-gray-400 cursor-pointer hover:border-[#870d4c]/50 hover:text-[#870d4c] transition-colors"
          >
            <ImagePlus size={24} />

            <p className="font-medium">{t('products.clickToAddImage')}</p>

            <p className="mt-1 text-[10px]">
              {t('products.supportedImageFormats')}
            </p>
          </label>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[#9d1159] text-white hover:bg-[#9d1159] transition"
        >
          <Save size={16} />

          {isEditing ? t('products.updateProductBtn') : t('products.saveProductBtn')}
        </button>
      </div>
    </form>
  );
}

function SearchableCategorySelect({ categories, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedCategory = categories.find(
    (category) => String(category.id) === String(value),
  );

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (categoryId) => {
    onChange(String(categoryId));

    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg flex justify-between items-center cursor-pointer ${
          isOpen ? "ring-2 ring-gray-200" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCategory ? "text-gray-900" : "text-gray-500"}>
          {selectedCategory ? selectedCategory.name : t('products.selectCategory')}
        </span>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 relative">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#fcfafb] rounded-md outline-none"
              placeholder={t('products.searchCategoryPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            <div
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect("")}
            >
              {t('products.selectCategory')}
            </div>

            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                    String(value) === String(category.id)
                      ? "bg-[#870d4c]/5 text-[#870d4c] font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleSelect(category.id)}
                >
                  {category.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {t('common.noResultsFor')} "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
