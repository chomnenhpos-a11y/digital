import { z } from "zod";
export const userSchema = z.object({
  name: z
  .string()
  .min(1, "validation.requiredName")
  .max(100, "validation.maxLength100"),
  email: z
  .string()
  .min(1, "validation.requiredUsernameOrEmail")
  .max(100, "validation.usernameMaxLength"),
  role: z
  .enum(["Admin", "User"], "validation.requiredRole"),
  password: z
  .string()
  .min(6, "validation.passwordMinLength")
  .max(100, "validation.passwordMaxLength"),
  confirmPassword: z
  .string()
  .min(6, "validation.confirmPasswordMinLength")
  .max(100, "validation.confirmPasswordMaxLength"),   
}).refine((data) => data.password === data.confirmPassword, {
  message: "users.passwordsDoNotMatch"
});