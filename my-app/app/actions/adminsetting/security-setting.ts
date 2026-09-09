"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import { logEvent } from "@/lib/log-event";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

const SECURITY_PATH = "/setting/security";

export async function updatePasswordAction(data: {
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated. Please log in again." };
  }

  const { currentPassword, newPassword } = data;
  if (!currentPassword) {
    return { success: false, error: "Current password is required." };
  }
  if (!newPassword || newPassword.length < 12) {
    return { success: false, error: "New password must be at least 12 characters." };
  }
  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
    return { success: false, error: "New password must contain both uppercase and lowercase letters." };
  }
  if (!/[0-9]/.test(newPassword)) {
    return { success: false, error: "New password must contain at least one number." };
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return { success: false, error: "New password must contain at least one special character." };
  }

  try {
    const prisma = getPrisma();
    const staff = await prisma.staff.findUnique({
      where: { id: BigInt(session.userId) },
      select: { id: true, email: true, password: true },
    });

    if (!staff) {
      return { success: false, error: "User account not found." };
    }

    const matches = await bcrypt.compare(currentPassword, staff.password);
    if (!matches) {
      await logEvent({
        event: "Password Change Failed",
        module: "Auth",
        level: "Warning",
        status: "Failed",
        userName: staff.email,
        isSecurityEvent: true,
      });
      return { success: false, error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: "New password must be different from current password." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.staff.update({
      where: { id: staff.id },
      data: { password: hashedPassword },
    });

    await logEvent({
      event: "Password Updated Successfully",
      module: "Auth",
      status: "Success",
      userName: staff.email,
      isSecurityEvent: true,
    });

    revalidatePath(SECURITY_PATH);
    return { success: true, message: "Password updated successfully." };
  } catch (err) {
    console.error("Failed to update password:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update password.",
    };
  }
}

export async function updateSessionSettingsAction(data: {
  timeoutMinutes: number;
  reauthForSensitive?: boolean;
  rememberDevice?: boolean;
  notifyOnAutoLogout?: boolean;
}) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    const prisma = getPrisma();
    await prisma.securitySettings.upsert({
      where: { id: 1 },
      update: {
        sessionTimeoutMinutes: data.timeoutMinutes,
      },
      create: {
        id: 1,
        sessionTimeoutMinutes: data.timeoutMinutes,
      },
    });

    revalidatePath(SECURITY_PATH);
    return { success: true, message: "Session timeout settings saved." };
  } catch (err) {
    console.error("Failed to save session settings:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save session settings.",
    };
  }
}

export async function updateMfaSettingsAction(data: {
  authenticator: boolean;
  smsRecovery: boolean;
}) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    const prisma = getPrisma();
    const enforce = data.authenticator || data.smsRecovery;
    const method = data.authenticator ? "Authenticator App" : "SMS";

    await prisma.securitySettings.upsert({
      where: { id: 1 },
      update: {
        enforce2FA: enforce,
        twoFAMethod: method,
      },
      create: {
        id: 1,
        enforce2FA: enforce,
        twoFAMethod: method,
      },
    });

    revalidatePath(SECURITY_PATH);
    return { success: true, message: "MFA settings updated successfully." };
  } catch (err) {
    console.error("Failed to update MFA settings:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update MFA settings.",
    };
  }
}

export async function updateRecoveryEmailAction(email: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.staff.findUnique({
      where: { email: trimmedEmail },
      select: { id: true },
    });

    if (existing && existing.id.toString() !== session.userId) {
      return { success: false, error: "This email is already in use by another account." };
    }

    await prisma.staff.update({
      where: { id: BigInt(session.userId) },
      data: { email: trimmedEmail },
    });

    await logEvent({
      event: "Recovery Email Updated",
      module: "Auth",
      status: "Success",
      userName: trimmedEmail,
      isSecurityEvent: true,
    });

    revalidatePath(SECURITY_PATH);
    return { success: true, message: "Recovery email updated successfully." };
  } catch (err) {
    console.error("Failed to update recovery email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update email.",
    };
  }
}

export async function generateBackupCodesAction() {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    const codes = Array.from({ length: 8 }, () => {
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      return `${part1}-${part2}`;
    });

    await logEvent({
      event: "New Backup Codes Generated",
      module: "Auth",
      status: "Success",
      userName: session.email,
      isSecurityEvent: true,
    });

    return { success: true, codes };
  } catch (err) {
    console.error("Failed to generate backup codes:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate backup codes.",
    };
  }
}
