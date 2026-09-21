import { z } from "zod";

export const deliveryProviderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "delivery.nameRequired" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "delivery.phoneRequired" }),
  shipping_fee: z
    .any()
    .refine((val) => val !== "" && val !== null && val !== undefined, { message: "delivery.feeRequired" }),
  is_active: z.union([z.boolean(), z.number(), z.string()]).optional(),
  logo: z.any().optional(),
});
