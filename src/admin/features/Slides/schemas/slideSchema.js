import { z } from "zod";

const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const RGB_REGEX =
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/;

const LINEAR_GRADIENT_REGEX =
  /^linear-gradient\(\s*(?:\d+(?:\.\d+)?deg\s*,\s*)?.+\)$/i;

const RADIAL_GRADIENT_REGEX =
  /^radial-gradient\(\s*.+\)$/i;

const optionalString = (maxLen, maxMessage) =>
  z
    .string()
    .trim()
    .max(maxLen, maxMessage)
    .optional()
    .or(z.literal(""));

export const slideSchema = z.object({
  tag: optionalString(50, "validation.tagMax"),

  title: z
    .string()
    .trim()
    .min(1, "validation.titleRequired")
    .max(150, "validation.titleMax"),

  description: optionalString(
    500,
    "validation.descriptionMax"
  ),

  discountPercentage: z
    .union([
      z.literal(""),
      z.coerce
        .number({
          message: "validation.discountNumber",
        })
        .min(0, "validation.discountMin")
        .max(100, "validation.discountMax"),
    ])
    .optional(),

  ctaText: optionalString(50, "validation.ctaMax"),

  backgroundColor: z
    .string()
    .trim()
    .min(1, "validation.backgroundRequired")
    .refine(
      (value) =>
        HEX_REGEX.test(value) ||
        RGB_REGEX.test(value) ||
        LINEAR_GRADIENT_REGEX.test(value) ||
        RADIAL_GRADIENT_REGEX.test(value),
      {
        message: "validation.invalidBackground",
      }
    ),

  status: z.enum(["Active", "Inactive"], {
    message: "validation.statusRequired",
  }),
});

export default slideSchema;