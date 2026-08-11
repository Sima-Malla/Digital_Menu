// app/actions/staff-settings.ts
"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; // shared singleton
import { getSession } from "@/lib/session";

export type StaffProfile = {
  fullName: string;
  position: string; // job title for display — "Chef", "Waiter", etc.
  role: string; // permission level — "owner" | "manager" | "staff"
  phone: string;
  email: string;
};

export type ApiResult = {
  success: boolean;
  message?: string;
};

/**
 * 1. वर्तमान logged-in staff को profile ल्याउने
 */
export async function getStaffProfile(): Promise<StaffProfile | null> {
  const session = await getSession();
  if (!session) return null;

  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: {
      fullName: true,
      position: true,
      role: true,
      phone: true,
      email: true,
    },
  });

  if (!staff) return null;

  return {
    fullName: staff.fullName,
    position: staff.position,
    role: staff.role,
    phone: staff.phone ?? "",
    email: staff.email,
  };
}

/**
 * 2. Profile update गर्ने (केवल fullName र phone — email/role/position
 * यहाँबाट बदल्न पाइँदैन, admin ले मात्र बदल्नुपर्छ)
 */
export async function updateStaffProfile(payload: {
  fullName: string;
  phone: string;
}): Promise<ApiResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authorized." };
  }

  const fullName = payload.fullName?.trim();
  const phone = payload.phone?.trim();

  if (!fullName) {
    return { success: false, message: "Name cannot be empty." };
  }

  try {
    await prisma.staff.update({
      where: { id: BigInt(session.userId) },
      data: { fullName, phone: phone || null },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update staff profile:", error);
    return { success: false, message: "Failed to update profile." };
  }
}

/**
 * 3. Password बदल्ने — current password verify गरेर मात्र
 */
export async function changeStaffPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authorized." };
  }

  const { currentPassword, newPassword, confirmPassword } = payload;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "Please fill in all password fields." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New password and confirm password do not match." };
  }

  if (newPassword.length < 8) {
    return { success: false, message: "New password must be at least 8 characters." };
  }

  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { password: true },
  });

  if (!staff) {
    return { success: false, message: "Staff not found." };
  }

  const currentMatches = await bcrypt.compare(currentPassword, staff.password);
  if (!currentMatches) {
    return { success: false, message: "Current password is incorrect." };
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  try {
    await prisma.staff.update({
      where: { id: BigInt(session.userId) },
      data: { password: newHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to change staff password:", error);
    return { success: false, message: "Failed to change password." };
  }
}