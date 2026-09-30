import { z } from "zod";
export const updateUserSchema = z.object({
  name: z
  .string()
  .trim()
  .min(1, "validation.requiredName")
  .max(100, "validation.maxLength100"),
  email: z
  .string()
  .trim()
  .min(1, "validation.requiredUsernameOrEmail")
  .email("validation.invalidEmail")
  .max(100, "validation.usernameMaxLength"),
  role: z
  .enum(["Admin", "User"], "validation.requiredRole"),
  status:z
  .enum(["0", "1"], "validation.requiredStatus"),
});

export const userSchema = updateUserSchema.extend({
  password: z
  .string()
  .min(6, "validation.passwordMinLength")
  .max(100, "validation.passwordMaxLength"),
  confirmPassword: z
  .string()
  .min(6, "validation.confirmPasswordMinLength")
  .max(100, "validation.confirmPasswordMaxLength"),   
}).refine((data) => data.password === data.confirmPassword, {
  message: "users.passwordsDoNotMatch",
  path: ["confirmPassword"],
});
