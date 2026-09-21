import { z } from "zod";

export const saleFormSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, '')) // Remove spaces just in case
    .transform((val) => val.startsWith('0') ? val.slice(1) : val) // Remove leading 0 if any
    .refine((val) => /^\d{8,9}$/.test(val), "common.invalidPhoneLength")
    .transform((val) => `+855${val}`), // Transform to E.164 format

  address: z
    .string()
    .trim()
    .min(2, "validation.requiredAddress"),

  deliveryFee: z
    .coerce
    .number()
    .min(0, "validation.shippingFeeNegative")
    .optional(),
  deliveryProviderId: z
    .union([z.string(), z.number()])
    .nullable()
    .optional(),
});