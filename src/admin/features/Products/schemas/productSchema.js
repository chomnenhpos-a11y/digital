import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Product name is required.",
    }),

  categoryId: z
    .string()
    .min(1, {
      message: "Category is required.",
    }),

  stockQuantity: z.coerce
    .number()
    .int({
      message: "Stock quantity must be a whole number.",
    })
    .min(0, {
      message: "Stock quantity must be 0 or greater.",
    }),

  price: z.coerce
    .number()
    .min(0, {
      message: "Price must be 0 or greater.",
    }),

  discountPrice: z.coerce
    .number()
    .min(0, {
      message: "Discount price must be 0 or greater.",
    }),

  salePrice: z.coerce
    .number()
    .min(0, {
      message: "Sale price must be 0 or greater.",
    }),

  description: z
    .string()
    .trim()
    .min(1, {
      message: "Product description is required.",
    }),

  images: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]).nullable().optional(),
        url: z.string(),
        file: z.any().nullable().optional(),
        isNew: z.boolean().optional(),
      })
    )
    .optional(),
});