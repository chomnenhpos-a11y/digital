import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Save,
  ImagePlus,
  X,
  ChevronDown,
  Search,
  RefreshCw,
  Radio,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { productSchema } from "../schemas/productSchema";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";
import { normalizeProductMedia } from "../../../../utils/productMedia.js";
import ProductMediaLinks from "./ProductMediaLinks.jsx";
import {
  compressImage,
  compressMultipleImages,
} from "../../../../utils/imageCompressor";
import { DotCircleWithLabelDemo } from "../../../components/common/Loading.jsx";

export default function ProductsForm({
  onSubmit,
  initialData,
  isSubmitting: isSubmittingProp,
}) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategoriesQuery();

  const [discountType, setDiscountType] = useState("amount"); // "amount" | "percent"
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const isEditing = !!initialData;
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),

    defaultValues: {
      name: "",
      categoryId: "",
      stockQuantity: "",
      price: "",
      status: "0",
      discountPrice: "",
      discountPercent: "",
      salePrice: "",
      description: "",
      images: [],
      media: [],
    },
  });

  const name = watch("name");
  const price = watch("price");
  const discountPrice = watch("discountPrice");
  const discountPercent = watch("discountPercent");
  const stockQuantity = watch("stockQuantity");
  const images = watch("images");

  const isSubmitting = Boolean(
    isSubmittingProp || formIsSubmitting || isSubmittingLocal,
  );

  useEffect(() => {
    if (!initialData) {
      reset({
        name: "",
        categoryId: "",
        stockQuantity: "",
        price: "",
        status: "0",
        discountPrice: "",
        discountPercent: "",
        salePrice: "",
        description: "",
        images: [],
        media: [],
      });

      setDiscountType("amount");
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

      status: String(initialData.status ?? "0"),

      discountPrice:
        initialData.discountPrice ?? initialData.discount_price ?? 0,

      discountPercent: "",

      salePrice: initialData.salePrice ?? initialData.sale_price ?? "",

      description: initialData.description || "",
      media: normalizeProductMedia(initialData.media ?? initialData.rawMedia),
      images: (initialData.images || []).map((img, i) =>
        typeof img === "string" ? { id: `existing-${i}`, url: img } : img,
      ),
    });
  }, [initialData, reset]);

  // Effective discount in $$ amount, from whichever input mode is active
  const effectiveDiscountAmount = useMemo(() => {
    const currentPrice = Number(price) || 0;

    if (discountType === "percent") {
      const pct = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
      return (pct / 100) * currentPrice;
    }

    return Math.max(Number(discountPrice) || 0, 0);
  }, [discountType, price, discountPrice, discountPercent]);

  // Shown as (%) on the label
  const discountPercentage = useMemo(() => {
    const currentPrice = Number(price) || 0;

    if (currentPrice <= 0) {
      return discountType === "percent"
        ? Math.min(Math.max(Number(discountPercent) || 0, 0), 100)
        : 0;
    }

    return Math.min(
      Math.max((effectiveDiscountAmount / currentPrice) * 100, 0),
      100,
    ).toFixed(2);
  }, [discountType, price, discountPercent, effectiveDiscountAmount]);

  const calculatedSalePrice = useMemo(() => {
    if (price === "") return "";
    const currentPrice = Number(price);
    if (currentPrice <= 0) return "0.00";
    return Math.max(
      0,
      currentPrice - effectiveDiscountAmount,
    ).toFixed(2);
  }, [price, effectiveDiscountAmount]);

  const handleDiscountTypeChange = (type) => {
    if (type === discountType) return;

    const currentPrice = Number(price) || 0;

    // Convert the current discount so switching modes keeps the sale price
    if (type === "percent") {
      const amount = Number(discountPrice) || 0;
      const pct = currentPrice > 0 ? (amount / currentPrice) * 100 : 0;

      setValue("discountPercent", String(+Math.min(pct, 100).toFixed(2)), {
        shouldValidate: true,
      });
    } else {
      const pct = Number(discountPercent) || 0;

      setValue(
        "discountPrice",
        String(
          +((Math.min(Math.max(pct, 0), 100) / 100) * currentPrice).toFixed(2),
        ),
        { shouldValidate: true },
      );
    }

    setDiscountType(type);
  };

  useEffect(() => {
    setValue("salePrice", calculatedSalePrice, {
      shouldValidate: true,
    });
  }, [calculatedSalePrice, setValue]);

  const handleImageAdd = async (e) => {
    const incomingFiles = Array.from(e.target.files || []);

    if (!incomingFiles.length) return;
    // អ្នកអាចទុកការត្រួតពិនិត្យ 5MB នេះ ឬលុបចេញក៏បាន ព្រោះយើងនឹង Compress វា
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const validFiles = incomingFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });
    if (!validFiles.length) return;
    setIsCompressing(true);
    try {
      // ដំណើរការ Compress រូបភាពទាំងអស់ដែលជ្រើសរើស
      const compressedFiles = await compressMultipleImages(validFiles);
      const currentImages = watch("images") || [];
      // ប្រើ compressedFiles ជំនួស validFiles
      const newImages = [
        ...currentImages,
        ...compressedFiles.map((file) => ({
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
    } catch (error) {
      console.error("Compression error:", error);
      alert("មានបញ្ហាក្នុងការបង្រួមទំហំរូបភាព");
    } finally {
      // បិទ Loading វិញ
      setIsCompressing(false);
    }
  };

  const handleImageReplaceClick = (index) => {
    setReplaceIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleImageReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert(`${file.name} is larger than 5MB`);
      return;
    }
    setIsCompressing(true);

    try {
      const compressedFile = await compressImage(file);
      const currentImages = [...(watch("images") || [])];
      const oldImage = currentImages[replaceIndex];
      if (oldImage?.isNew && oldImage?.url) {
        URL.revokeObjectURL(oldImage.url);
      }
      currentImages[replaceIndex] = {
        id: null,
        url: URL.createObjectURL(compressedFile),
        file: compressedFile,
        isNew: true,
      };
      setValue("images", currentImages, {
        shouldValidate: true,
      });
      setReplaceIndex(null);
    } catch (error) {
      console.error("Replace compression error:", error);
    } finally {
      setIsCompressing(false);
    }
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
    setIsSubmittingLocal(true);
    try {
      const payload = new FormData();

      if (isEditing && initialData?.id) {
        payload.append("id", String(initialData.id));
      }

      payload.append("name", data.name.trim());

      payload.append("category_id", String(data.categoryId || ""));

      payload.append("stock_quantity", String(data.stockQuantity || 0));

      payload.append("price", String(data.price || 0));

      payload.append("status", String(data.status || "0"));

      // Backend always stores the discount as a fixed amount, so convert
      // a percentage discount back to a $$ value before submitting.
      const finalDiscountPrice =
        discountType === "percent"
          ? +(
              (Math.min(Math.max(Number(data.discountPercent) || 0, 0), 100) /
                100) *
              (Number(data.price) || 0)
            ).toFixed(2)
          : Number(data.discountPrice) || 0;

      payload.append("discount_price", String(finalDiscountPrice));

      payload.append("salePrice", String(data.salePrice || 0));

      payload.append("description", data.description || "");
      payload.append("media", JSON.stringify(data.media || []));

      const finalImages = data.images || [];

      finalImages.forEach((image) => {
        if (image?.file) {
          payload.append("images", image.file, image.file.name);
        } else if (image?.url) {
          // Append existing image URL so the backend knows to keep it
          payload.append("images", image.url);
        }
      });

      await onSubmit(payload);
    } catch (error) {
      console.error("Failed to prepare product:", error);
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const totalImageCount = images?.length || 0;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t("products.productNameLabel")} {!isEditing && "*"}
          </label>

          <input
            type="text"
            {...register("name")}
            placeholder={t("products.productNamePlaceholder")}
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.name && (
            <p className="text-xs text-red-500 mt-1">
              {t(errors.name.message)}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t("products.categoryLabel")} {!isEditing && "*"}
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
              {t(errors.categoryId.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t("products.stockLabel")}
          </label>

          <input
            type="number"
            {...register("stockQuantity")}
            min="0"
            placeholder="0"
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.stockQuantity && (
            <p className="text-xs text-red-500 mt-1">
              {t(errors.stockQuantity.message)}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t("products.originalPriceLabel")}
          </label>

          <input
            type="number"
            {...register("price")}
            min="0"
            step="0.01"
            placeholder="0.00"
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          />

          {errors.price && (
            <p className="text-xs text-red-500 mt-1">
              {t(errors.price.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">
                {t("products.discountLabel")}
              </label>

              {discountPercentage > 0 && (
                <span className="text-xs text-red-600">
                  ({discountPercentage}%)
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-md">
              <button
                type="button"
                onClick={() => handleDiscountTypeChange("percent")}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  discountType === "percent"
                    ? "bg-white text-[#870d4c] shadow-sm"
                    : "text-gray-500 hover:text-[#870d4c]"
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleDiscountTypeChange("amount")}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  discountType === "amount"
                    ? "bg-white text-[#870d4c] shadow-sm"
                    : "text-gray-500 hover:text-[#870d4c]"
                }`}
              >
                $
              </button>
            </div>
          </div>
          <div>
            {discountType === "percent" ? (
              <input
                type="number"
                {...register("discountPercent")}
                min="0"
                max="100"
                step="0.01"
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder={t(
                  "products.discountPercentPlaceholder",
                  "Discount %",
                )}
                className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
              />
            ) : (
              <input
                type="number"
                {...register("discountPrice")}
                min="0"
                step="0.01"
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
              />
            )}

            {discountType === "percent" && effectiveDiscountAmount > 0 && (
              <p className="text-[11px] text-gray-500 mt-1">
                {t("products.discountEqualLabel", "Equal to")} ≈ $
                {effectiveDiscountAmount.toFixed(2)}
              </p>
            )}

            {discountType === "percent"
              ? errors.discountPercent && (
                  <p className="text-xs text-red-500 mt-1">
                    {t(errors.discountPercent.message)}
                  </p>
                )
              : errors.discountPrice && (
                  <p className="text-xs text-red-500 mt-1">
                    {t(errors.discountPrice.message)}
                  </p>
                )}
          </div>
        </div>
        <div className=" mt-4">
          <label className="block text-xs font-semibold text-gray-600">
            {t("products.salePriceLabel")}
          </label>

          <input
            type="number"
            value={calculatedSalePrice}
            readOnly
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] text-gray-600 rounded-lg outline-none cursor-not-allowed"
          />
        </div>

      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t("products.status")}
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="0">{t("products.activeStatus")}</option>
            <option value="1">{t("products.inactiveStatus")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {t("products.descriptionLabel")}
        </label>

        <textarea
          {...register("description")}
          rows="3"
          placeholder={t("products.descriptionPlaceholder")}
          className="w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none resize-none focus:ring-2 focus:ring-gray-200"
        />

        {errors.description && (
          <p className="text-xs text-red-500 ">
            {t(errors.description.message)}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-gray-600">
            {t("products.productImagesLabel")}
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
            htmlFor={
              isCompressing || isSubmitting ? undefined : "product-image-upload"
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#870d4c]/5 text-[#870d4c] transition-colors ${
              isCompressing || isSubmitting
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "hover:bg-[#870d4c]/10 cursor-pointer"
            }`}
          >
            <ImagePlus size={14} />
            {t("products.addImage")}
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
                  disabled={isCompressing || isSubmitting}
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  title={t("common.deleteImage")}
                >
                  <X size={11} strokeWidth={3} />
                </button>

                <button
                  type="button"
                  disabled={isCompressing || isSubmitting}
                  onClick={() => handleImageReplaceClick(index)}
                  className="absolute -top-2 -left-0 w-5 h-5 rounded-full bg-[#870d4c] text-white flex items-center justify-center shadow-md hover:bg-[#9d1159] disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  title={t("common.changeImage")}
                >
                  <RefreshCw size={11} strokeWidth={3} />
                </button>

                {image.isNew && (
                  <span className="absolute bottom-1 right-1 text-[9px] bg-green-500 text-white px-1 rounded">
                    {t("common.new")}
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

            <p className="font-medium">{t("products.clickToAddImage")}</p>

            <p className="mt-1 text-[10px]">
              {t("products.supportedImageFormats")}
            </p>
          </label>
        )}
      </div>

      <ProductMediaLinks
        control={control}
        register={register}
        errors={errors}
      />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isCompressing || isSubmitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-[#9d1159] text-white hover:bg-[#850b4a] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-w-[140px]"
        >
          {isSubmitting ? (
            <DotCircleWithLabelDemo
              size="sm"
              label={
                isEditing
                  ? t("products.updatingProduct", "Updating...")
                  : t("products.savingProduct", "Saving...")
              }
              className="flex-row gap-2"
            />
          ) : (
            <>
              <Save size={16} />

              {isEditing
                ? t("products.updateProductBtn")
                : t("products.saveProductBtn")}
            </>
          )}
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
          {selectedCategory
            ? selectedCategory.name
            : t("products.selectCategory")}
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
              placeholder={t("products.searchCategoryPlaceholder")}
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
              {t("products.selectCategory")}
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
                {t("common.noResultsFor")} "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
