import { z } from "zod";

/* ─── Shared building blocks ─────────────────────────────── */
const fullName = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(80, "Full name is too long.");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.") // bcrypt silently truncates beyond 72 bytes
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9()\-.\s]{7,20}$/, "Enter a valid phone number.");

export const staffRoles = ["Waiter", "Chef", "Cashier", "Host", "Kitchen Staff", "Manager"] as const;
export const businessTypes = ["Restaurant", "Hotel", "Cafe", "Bar / Lounge", "Cloud Kitchen"] as const;

/* ─── Per-role schemas ───────────────────────────────────── */
const staffSchema = z.object({
  role: z.literal("staff"),
  fullName,
  email,
  password,
  phone,
  staffRole: z.enum(staffRoles as unknown as [string, ...string[]]).refine((value) => staffRoles.includes(value as (typeof staffRoles)[number]), {
    message: "Select a valid position.",
  }),
  inviteCode: z
    .string()
    .trim()
    .min(4, "Enter the invite code your manager gave you.")
    .max(20, "Invite code is too long."),
});

const adminSchema = z.object({
  role: z.literal("admin"),
  fullName,
  email,
  password,
  businessName: z.string().trim().min(2, "Business name is required.").max(120),
  businessType: z.enum(businessTypes as unknown as [string, ...string[]]).refine((value) => businessTypes.includes(value as (typeof businessTypes)[number]), {
    message: "Select a valid business type.",
  }),
  businessAddress: z.string().trim().min(5, "Enter a full business address.").max(200),
  businessPhone: phone,
});

const userSchema = z.object({
  role: z.literal("user"),
  fullName,
  email,
  password,
  phone,
});

/* ─── Combined, role-discriminated schema ────────────────── */
export const signupSchema = z.discriminatedUnion("role", [staffSchema, adminSchema, userSchema]);

export type SignupInput = z.infer<typeof signupSchema>;

/* ─── FormData -> validated object ───────────────────────── */
export function parseSignupFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return signupSchema.safeParse(raw);
}