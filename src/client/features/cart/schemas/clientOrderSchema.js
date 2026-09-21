import { z } from "zod"

export const clientOrderSchema = (t) =>
  z.object({
    phone: z
      .string()
      .trim()
      .transform((val) => val.replace(/\s+/g, ""))
      .transform((val) => (val.startsWith("0") ? val.slice(1) : val))
      .refine(
        (val) => /^\d{8,9}$/.test(val),
        t("cart.invalidPhone")
      )
      .transform((val) => "+855" + val),

    address: z
      .string()
      .trim()
      .min(2, t("validation.requiredAddress")),

    deliveryMethod: z.union([z.string().min(1), z.number()], {
      errorMap: () => ({
        message: t("validation.requiredDelivery"),
      }),
    }),
  })
