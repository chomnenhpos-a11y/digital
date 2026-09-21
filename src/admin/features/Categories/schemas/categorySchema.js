import { z } from "zod";
export const categorySchema = z.object({
    name: z
    .string()
    .trim()
    .min(1, { message: "Category name is required." }),
    slug: z
    .string()
    .trim()
    .min(1, { message: "Slug is required." }),
    image: z.any().optional(),
    description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." }),
})