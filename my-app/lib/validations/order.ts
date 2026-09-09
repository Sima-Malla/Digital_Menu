import { z } from "zod";

export const checkoutSchema = z
  .object({
    businessId: z.string().min(1),
    orderType: z.enum(["dine-in", "pickup", "delivery"]),
    locationLabel: z.string().trim().max(60).optional().or(z.literal("")),
    isWalkIn: z.boolean().default(false),
    customerName: z.string().trim().max(80),
    customerPhone: z.string().trim().max(20),
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
  })
  // Walk-in orders skip name/phone entirely; everyone else still needs both,
  // validated here (not on the base fields) so the walk-in path never has to
  // satisfy a rule that doesn't apply to it.
  .superRefine((data, ctx) => {
    if (data.isWalkIn) return;

    if (data.customerName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerName"],
        message: "Enter your name.",
      });
    }
    if (!/^\+?[0-9()\-.\s]{7,20}$/.test(data.customerPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerPhone"],
        message: "Enter a valid phone number.",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;