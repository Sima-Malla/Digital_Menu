"use server";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { getSession, destroySession } from "@/lib/session";

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
  // Must already be logged in (with temporary credentials) to onboard —
  // this action updates "your own" row, identified from the session, never
  // from a userId passed in the form itself (which could be tampered with).
  const session = await getSession();

  if (!session) {
    return { success: false, message: "Your session has expired. Please log in again." };
  }

  if (session.role !== "staff" && session.role !== "admin") {
    return { success: false, message: "Onboarding isn't available for this account type." };
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

  // If they're changing to a new email, make sure no OTHER account owns it.
  const existing = await prisma.users.findUnique({
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

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.users.update({
    where: { id: BigInt(session.userId) },
    data: {
      email,
      password: hashedPassword,
      needsOnboarding: false,
    },
  });

  // Force re-authentication with the new credentials — the temporary
  // login/password combo should never work again after this point.
  await destroySession();

  return { success: true, message: "Credentials updated." };
}