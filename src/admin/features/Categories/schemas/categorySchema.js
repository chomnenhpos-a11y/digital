import { z } from "zod";

export const getCategorySchema = (t) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t
          ? t("category.nameRequired", "Category name is required.")
          : "Category name is required.",
      }),
    name_local: z
      .string()
      .trim()
      .min(1, {
        message: t
          ? t("category.nameLocalRequired", "Local category name is required.")
          : "Local category name is required.",
      }),
    slug: z
      .string()
      .trim()
      .min(1, {
        message: t
          ? t("category.slugRequired", "Slug is required.")
          : "Slug is required.",
      }),
    image: z.any().optional(),
    description: z
      .string()
      .trim()
      .min(1, {
        message: t
          ? t("category.descRequired", "Description is required.")
          : "Description is required.",
      }),
  });

export const categorySchema = getCategorySchema();