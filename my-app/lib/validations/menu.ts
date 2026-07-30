import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  category: z.string().trim().min(1, "Select a category."),
  price: z.coerce.number({ message: "Enter a valid price." }).positive("Price must be greater than 0.").max(9999),
  calories: z.coerce.number().int().positive().max(20000).optional().or(z.literal("")),
  description: z.string().trim().max(500, "Description is too long.").optional().or(z.literal("")),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

export const specialSchema = z
  .object({
    menuItemId: z.coerce.string().min(1, "Select a dish."),
    badgeLabel: z.string().trim().min(1, "Badge label is required.").max(40),
    scheduleType: z.enum(["recurring", "one-time"]),
    weekday: z.coerce.number().int().min(0).max(6).optional(),
    date: z.string().optional(), // "YYYY-MM-DD"
  })
  .refine((data) => data.scheduleType !== "recurring" || data.weekday !== undefined, {
    message: "Select a day of the week.",
    path: ["weekday"],
  })
  .refine((data) => data.scheduleType !== "one-time" || !!data.date, {
    message: "Select a date.",
    path: ["date"],
  });

export type SpecialInput = z.infer<typeof specialSchema>;