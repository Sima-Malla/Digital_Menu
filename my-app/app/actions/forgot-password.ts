"use server";

import { SignJWT } from "jose";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { forgotPasswordSchema } from "@/lib/validations/password-reset";
import { computeTokenHash } from "@/lib/auth-helpers";
import { logEvent } from "@/lib/log-event";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

export type ForgotPasswordState = {
  success: boolean;
  message: string;
  resetUrl?: string;
  email?: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "fallback_secret_for_jwt_reset";
  return new TextEncoder().encode(secret);
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")?.toString(),
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "Invalid email address.";
    return { success: false, message: errorMsg };
  }

  const email = parsed.data.email;

  // Search Staff first, then SuperAdmin
  const staffMember = await prisma.staff.findUnique({
    where: { email },
    select: { id: true, email: true, password: true },
  });

  const superAdmin = staffMember
    ? null
    : await prisma.superAdmin.findUnique({
        where: { email },
        select: { id: true, email: true, password: true },
      });

  const account = staffMember ?? superAdmin;
  const accountType = staffMember ? "staff" : "superadmin";

  if (!account) {
    // Standard secure message to avoid account enumeration
    return {
      success: true,
      message: "If an account with that email exists, password reset instructions have been generated.",
    };
  }

  const userId = account.id.toString();
  const tokenHash = computeTokenHash(account.password, userId);

  // Sign JWT valid for 15 minutes
  const token = await new SignJWT({
    email: account.email,
    userId,
    type: accountType,
    hash: tokenHash,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecret());

  const resetUrl = `/reset-password?token=${encodeURIComponent(token)}`;

  await logEvent({
    event: "Password Reset Requested",
    module: "Auth",
    status: "Success",
    userName: email,
    isSecurityEvent: true,
  });

  return {
    success: true,
    message: "Password reset link generated successfully.",
    resetUrl,
    email: account.email,
  };
}
