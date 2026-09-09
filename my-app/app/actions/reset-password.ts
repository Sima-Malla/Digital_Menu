"use server";

import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { resetPasswordSchema } from "@/lib/validations/password-reset";
import { computeTokenHash } from "@/lib/auth-helpers";
import { logEvent } from "@/lib/log-event";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

export type ResetPasswordState = {
  success: boolean;
  message: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "fallback_secret_for_jwt_reset";
  return new TextEncoder().encode(secret);
}

type ResetTokenPayload = {
  email: string;
  userId: string;
  type: "staff" | "superadmin";
  hash: string;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  const parsed = resetPasswordSchema.safeParse({
    token,
    password,
    confirmPassword,
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "Invalid password input.";
    return { success: false, message: errorMsg };
  }

  let payload: ResetTokenPayload;
  try {
    const verified = await jwtVerify(token, getSecret());
    payload = verified.payload as unknown as ResetTokenPayload;
  } catch {
    return {
      success: false,
      message: "The password reset link is invalid or has expired. Please request a new one.",
    };
  }

  const { userId, type, hash } = payload;
  const bigUserId = BigInt(userId);

  if (type === "staff") {
    const staffMember = await prisma.staff.findUnique({
      where: { id: bigUserId },
      select: { id: true, email: true, password: true },
    });

    if (!staffMember) {
      return { success: false, message: "Account not found." };
    }

    const currentHash = computeTokenHash(staffMember.password, userId);
    if (currentHash !== hash) {
      return {
        success: false,
        message: "This password reset link has already been used or is no longer valid.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.staff.update({
      where: { id: bigUserId },
      data: { password: hashedPassword },
    });

    await logEvent({
      event: "Password Reset Completed",
      module: "Auth",
      status: "Success",
      userName: staffMember.email,
      isSecurityEvent: true,
    });
  } else if (type === "superadmin") {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: bigUserId },
      select: { id: true, email: true, password: true },
    });

    if (!superAdmin) {
      return { success: false, message: "Account not found." };
    }

    const currentHash = computeTokenHash(superAdmin.password, userId);
    if (currentHash !== hash) {
      return {
        success: false,
        message: "This password reset link has already been used or is no longer valid.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.superAdmin.update({
      where: { id: bigUserId },
      data: { password: hashedPassword },
    });

    await logEvent({
      event: "SuperAdmin Password Reset Completed",
      module: "Auth",
      status: "Success",
      userName: superAdmin.email,
      isSecurityEvent: true,
    });
  } else {
    return { success: false, message: "Invalid account type." };
  }

  return {
    success: true,
    message: "Your password has been successfully reset! You can now sign in with your new password.",
  };
}
