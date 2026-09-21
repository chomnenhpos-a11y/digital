import * as z from "zod";

export const passwordRule = (t) => z
  .string()
  .trim()
  .min(8, { message: t("validation.passwordMinLength") });
