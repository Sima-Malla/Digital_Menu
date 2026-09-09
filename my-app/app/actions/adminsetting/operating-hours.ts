"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const ALLOWED_ROLES = ["owner", "manager"];
const SETTINGS_PATH = "/settings/operating-hours"; // adjust to your actual route

async function requireBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) return null;
  return BigInt(session.businessId);
}

export async function updateDayHoursAction(
  dayOfWeek: number,
  open: string,
  close: string
): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  if (!open.trim() || !close.trim()) {
    return { success: false, message: "Both open and close times are required." };
  }

  await prisma.businessHours.upsert({
    where: { businessId_dayOfWeek: { businessId, dayOfWeek } },
    update: { openTime: open.trim(), closeTime: close.trim(), isOpen: true },
    create: { businessId, dayOfWeek, openTime: open.trim(), closeTime: close.trim(), isOpen: true },
  });

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function toggleDayOpenAction(
  dayOfWeek: number,
  isOpen: boolean
): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  await prisma.businessHours.upsert({
    where: { businessId_dayOfWeek: { businessId, dayOfWeek } },
    update: { isOpen },
    create: { businessId, dayOfWeek, isOpen, openTime: null, closeTime: null },
  });

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function addSpecialHoursAction(input: {
  name: string;
  date: string;
  status: "LIMITED" | "CLOSED" | "EXTENDED";
  hours: string;
}): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  if (!input.name.trim() || !input.date.trim()) {
    return { success: false, message: "Event name and date are required." };
  }

  await prisma.specialHours.create({
    data: {
      businessId,
      name: input.name.trim(),
      date: input.date.trim(),
      status: input.status,
      hours: input.status === "CLOSED" ? "--" : input.hours.trim(),
    },
  });

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteSpecialHoursAction(id: string): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  await prisma.specialHours.deleteMany({
    where: { id: BigInt(id), businessId }, // deleteMany + businessId filter, not delete-by-id alone — prevents deleting another business's row
  });

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}