import { z } from "zod";

const socialMediaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "validation.requiredTitle"),

  url: z
    .string()
    .trim()
    .min(1, "validation.requiredUrl")
    .url("validation.invalidUrl"),

  icon: z
    .string()
    .trim()
    .min(1, "validation.requiredIcon"),
});

export const settingSchema = z.object({
  shop_name: z
    .string()
    .min(1, "validation.requiredShopName"),

  shop_code: z
    .string()
    .min(1, "validation.requiredShopCode"),

  phone: z
    .string()
    .min(1, "validation.requiredPhone"),

  address: z
    .string()
    .min(1, "validation.requiredAddress"),

  chat_id: z.string().optional(),

  logo: z
    .union([
      z.instanceof(File),
      z.string(),
    ])
    .optional(),

  support: z
    .union([
      z.instanceof(File),
      z.string(),
    ])
    .optional(),

  social_media: z
    .array(socialMediaSchema)
    .optional(),
  bio_shop: z
    .string()
    .optional(),
  qr_upload: z
    .union([
      z.instanceof(File),
      z.string(),
    ])
    .optional(),
});