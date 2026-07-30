import { z } from "zod";

export const checkoutSchema = z.object({
  businessId: z.string().min(1),
  orderType: z.enum(["dine-in", "pickup", "delivery"]),
  locationLabel: z.string().trim().max(60).optional().or(z.literal("")),
  customerName: z.string().trim().min(2, "Enter your name.").max(80),
  customerPhone: z.string().trim().regex(/^\+?[0-9()\-.\s]{7,20}$/, "Enter a valid phone number."),
  customerEmail: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(50),
        notes: z.string().trim().max(200).optional(),
      })
    )
    .min(1, "Your cart is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;