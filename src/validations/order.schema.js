import * as z from "zod";

export const createOrderSchema = z.object({
  productId: z
  .string()
  .min(1, "Product ID is required"),
  quantity: z
  .number()
  .min(1, "Quantity must be at least 1"),
  shippingAddress: z
  .string() 
  .min(10, "Shipping address is too short"),
});
