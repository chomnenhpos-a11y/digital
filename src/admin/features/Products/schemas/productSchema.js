import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: "validation.product.nameRequired",
    }),

  categoryId: z
    .string()
    .min(1, {
      message: "validation.product.categoryRequired",
    }),

  stockQuantity: z.coerce
    .number()
    .int({
      message: "validation.product.stockInt",
    })
    .min(0, {
      message: "validation.product.stockMin",
    }),

  price: z.coerce
    .number()
    .min(0, {
      message: "validation.product.priceMin",
    }),

  discountPrice: z.coerce
    .number()
    .min(0, {
      message: "validation.product.discountPriceMin",
    }),

  salePrice: z.coerce
    .number()
    .min(0, {
      message: "validation.product.salePriceMin",
    }),

  description: z
    .string()
    .trim()
    .min(1, {
      message: "validation.product.descriptionRequired",
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
}).refine(
  (data) => data.discountPrice <= data.price,
  {
    message: "validation.product.discountExceedsPrice",
    path: ["discountPrice"],
  }
);