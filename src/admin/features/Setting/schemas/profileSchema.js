import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "validation.requiredName"),
  email: z.string().email("validation.invalidEmail"),
});
