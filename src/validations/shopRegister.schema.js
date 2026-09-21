import * as z from "zod";
import { emailRule } from "./common/email";
import { passwordRule } from "./common/password";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const accountSetupSchema = (t) => z.object({
  name: z.string().min(2, {
    message: t("auth.nameMinLength") || "Name must be at least 2 characters.",
  }),

  email: emailRule(t),

  password: passwordRule(t),
});

export const shopIdentitySchema = (t) => z.object({
  shop_name: z.string().min(2, {
    message: t("validation.requiredShopName") || "Shop name is required.",
  }),

  phone: z.string().min(8, {
    message: t("validation.requiredPhone") || "Phone number is required.",
  }),

  address: z.string().min(2, {
    message: t("validation.requiredAddress") || "Address is required.",
  }),

  logo: z
    .any()
    .optional()
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return file[0]?.size <= MAX_FILE_SIZE;
    }, t("settings.imageTooLarge") || "Max file size is 1MB.")
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file[0]?.type);
    }, t("settings.invalidFile") || "Only .jpg, .jpeg, .png and .webp formats are supported."),
});

export const shopRegisterSchema = (t) => accountSetupSchema(t)
  .merge(shopIdentitySchema(t));
