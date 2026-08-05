"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type StaffRole = "Waiter" | "Chef" | "Manager";

export interface StaffProfile {
  id: string;
  name: string;
  staffId: string;
  role: StaffRole;
  phone: string;
  email: string;
  photo: string;
  onDuty: boolean;
}

/**
 * 1. Logged In Staff Profile Data Fetch गर्ने (Real Database बाट)
 */
export async function getStaffProfile(): Promise<StaffProfile | null> {
  try {
    const session = await getSession();
    if (!session || session.role !== "staff") return null;

    const staff = await prisma.staff.findUnique({
      where: { email: session.email },
    });

    if (!staff) return null;

    return {
      id: staff.id.toString(),
      name: staff.name || "Staff Member",
      staffId: staff.staffId || `STF-${staff.id}`,
      role: (staff.role as StaffRole) || "Waiter",
      phone: staff.phone || "",
      email: staff.email,
      photo: "/vegmomo.jpg",
      onDuty: staff.onDuty ?? false,
    };
  } catch (error) {
    console.error("Failed to fetch staff profile:", error);
    return null;
  }
}

/**
 * 2. Staff Phone Number Update गर्ने
 */
export async function updateStaffPhoneAction(phone: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session || session.role !== "staff") {
      return { success: false, message: "Unauthorized access." };
    }

    await prisma.staff.update({
      where: { email: session.email },
      data: { phone },
    });

    revalidatePath("/(staff)/settings");
    return { success: true, message: "Phone number updated successfully!" };
  } catch (error) {
    console.error("Failed to update staff phone:", error);
    return { success: false, message: "Failed to update phone number." };
  }
}

/* Added: Update Staff Name Action */
export async function updateStaffNameAction(name: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session || session.role !== "staff") {
      return { success: false, message: "Unauthorized access." };
    }

    const trimmed = name?.toString().trim() ?? "";
    if (!trimmed) {
      return { success: false, message: "Name cannot be empty." };
    }
    if (trimmed.length > 100) {
      return { success: false, message: "Name is too long." };
    }

    await prisma.staff.update({
      where: { email: session.email },
      data: { name: trimmed },
    });

    revalidatePath("/(staff)/settings");
    return { success: true, message: "Name updated successfully!" };
  } catch (error) {
    console.error("Failed to update staff name:", error);
    return { success: false, message: "Failed to update name." };
  }
}

/**
 * 3. Change Password Action (bcrypt comparison & hashing)
 */
export async function changeStaffPasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session || session.role !== "staff") {
      return { success: false, message: "Unauthorized access." };
    }

    const staff = await prisma.staff.findUnique({
      where: { email: session.email },
    });

    if (!staff) {
      return { success: false, message: "Staff record not found." };
    }

    // Current Password verification
    let isMatch = false;
    if (staff.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(currentPassword, staff.password);
    } else {
      isMatch = currentPassword === staff.password;
    }

    if (!isMatch) {
      return { success: false, message: "Current password is incorrect." };
    }

    // New Password hashing
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.staff.update({
      where: { id: staff.id },
      data: { password: hashedPassword },
    });

    revalidatePath("/(staff)/settings");
    return { success: true, message: "Password changed successfully!" };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, message: "Failed to change password." };
  }
}

/**
 * 4. Toggle On Duty Status Action
 */
export async function toggleDutyStatusAction(onDuty: boolean): Promise<{ success: boolean }> {
  try {
    const session = await getSession();
    if (!session || session.role !== "staff") return { success: false };

    await prisma.staff.update({
      where: { email: session.email },
      data: { onDuty },
    });

    revalidatePath("/(staff)/settings");
    revalidatePath("/(staff)/staffdashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle duty status:", error);
    return { success: false };
  }
}