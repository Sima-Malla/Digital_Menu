import { z } from "zod";

export const onboardingSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password is too long.")
      .regex(/[A-Za-z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
