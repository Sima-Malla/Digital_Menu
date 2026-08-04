"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { requireStaffAuth } from "./staff-auth";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

// ── 1. Profile fetch garne (page load ma) ───────────────────
export async function getStaffProfile() {
  const staff = await requireStaffAuth();
  if (!staff) return null;

  return {
    name: staff.name,
    staffId: staff.staffId,
    role: staff.role,
    phone: staff.phone ?? "",
    email: staff.email,
    onDuty: staff.onDuty,
  };
}

// ── 2. Profile update garne (Name, Phone matra — Staff ID/Email read-only) ──
export async function updateStaffProfile(data: {
  name: string;
  phone: string;
}): Promise<{ success: boolean; message?: string }> {
  const staff = await requireStaffAuth();
  if (!staff) return { success: false, message: "Not authenticated." };

  if (!data.name.trim()) {
    return { success: false, message: "Name cannot be empty." };
  }

  try {
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        name: data.name.trim(),
        phone: data.phone.trim() || null,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}

// ── 3. Password change garne ─────────────────────────────────
export async function changeStaffPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const staff = await requireStaffAuth();
  if (!staff) return { success: false, message: "Not authenticated." };

  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "Please fill in all password fields." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New password and confirm password do not match." };
  }

  if (newPassword.length < 8) {
    return { success: false, message: "New password must be at least 8 characters." };
  }

  try {
    // Purano password milxa ki verify garne
    const currentMatches = await bcrypt.compare(currentPassword, staff.password);
    if (!currentMatches) {
      return { success: false, message: "Current password is incorrect." };
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.staff.update({
      where: { id: staff.id },
      data: { password: newHash },
    });

    return { success: true, message: "Password changed successfully." };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}