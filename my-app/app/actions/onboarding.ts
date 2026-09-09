"use server";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { getSession, destroySession } from "@/lib/session";
import { validatePasswordAgainstPolicy } from "@/app/actions/validate-password";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

export type OnboardingState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function completeOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await getSession();

  if (!session) {
    return { success: false, message: "Your session has expired. Please log in again." };
  }

  if (!["owner", "manager", "staff"].includes(session.role)) {
    return { success: false, message: "Onboarding isn't available for this account type." };
  }

  if (!session.businessId) {
    return { success: false, message: "No business is associated with this account." };
  }

  const parsed = onboardingSchema.safeParse({
    email: formData.get("email")?.toString(),
    password: formData.get("password")?.toString(),
    confirmPassword: formData.get("confirmPassword")?.toString(),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const { email, password } = parsed.data;

  const existing = await prisma.staff.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing && existing.id.toString() !== session.userId) {
    return {
      success: false,
      message: "That email is already in use by another account.",
      fieldErrors: { email: "This email is already registered." },
    };
  }

  const policyCheck = await validatePasswordAgainstPolicy(password);
  if (!policyCheck.valid) {
    return {
      success: false,
      message: "Password doesn't meet security requirements.",
      fieldErrors: { password: policyCheck.errors.join(" ") },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.staff.update({
    where: { id: BigInt(session.userId) },
    data: {
      email,
      password: hashedPassword,
      needsOnboarding: false,
    },
  });

  await destroySession();

  return { success: true, message: "Credentials updated." };
}
