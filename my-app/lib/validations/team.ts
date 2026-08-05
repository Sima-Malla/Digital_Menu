import { z } from "zod";

export const positions = ["Chef", "Manager", "Waiter", "Host", "Barista", "Dishwasher"] as const;

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9()\-.\s]{7,20}$/, "Enter a valid phone number.")
  .optional()
  .or(z.literal(""));

export const inviteStaffSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone,
  position: z.enum(positions),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;