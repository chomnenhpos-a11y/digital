import * as z from "zod";

import { emailRule } from "./common/email";
import { passwordRule } from "./common/password";

export const loginSchema = (t) =>
  z.object({
    email: emailRule(t),
    password: z.string().trim().min(1, {
      message: t("auth.passwordRequired"),
    }),
  });

export const registerSchema = (t) =>
  z
    .object({
      fullName: z.string().min(2, {
        message: t("auth.nameMinLength"),
      }),
      email: emailRule(t),
      password: passwordRule(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

export const forgotPasswordSchema = (t) =>
  z.object({
    email: emailRule(t),
  });

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });