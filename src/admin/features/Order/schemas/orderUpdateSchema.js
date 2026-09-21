import { z } from "zod";

export const orderUpdateSchema = z.object({
  customerPhone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, '')) // Remove spaces
    .transform((val) => val.startsWith('0') ? val.slice(1) : val) // Remove leading 0
    .refine((val) => /^\d{8,9}$/.test(val), "common.invalidPhoneLength")
    .transform((val) => `+855${val}`),

  status: z.string().min(1, "validation.requiredStatus"),

  paymentStatus: z.string().min(1, "validation.requiredPaymentStatus"),

  customerAddress: z
    .string()
    .trim()
    .min(2, "validation.requiredAddress"),

  deliveryFee: z.coerce
    .number()
    .min(0, "validation.shippingFeeMin"),

  items: z
    .array(
      z.object({
        productId: z.coerce.number().positive("validation.requiredProduct"),
        quantity: z.coerce
          .number()
          .int()
          .min(1, "validation.quantityMin"),
        price: z.coerce.number().min(0),
      })
    )
    .min(1, "validation.requiredAtLeastOneProduct"),
});