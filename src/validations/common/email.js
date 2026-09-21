import * as z from "zod";

export const emailRule = (t) => z
  .string()
  .trim()
  .min(5, { message: t("validation.requiredUsernameOrEmail") });
