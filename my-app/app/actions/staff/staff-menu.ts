"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { requireStaffAuth } from "../staff-auth";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

// ── Types shared with the frontend ──────────────────────────
export type AvailabilityStatus = "available" | "low-stock" | "out-of-stock";

export type MenuItemData = {
  id: number;
  name: string;
  img: string;
  meta: string;
  category: string;
  price: string;
  status: AvailabilityStatus;
};

function normalizeStatus(status: string): AvailabilityStatus {
  if (status === "low-stock" || status === "out-of-stock") return status;
  return "available";
}

// ── 1. Menu items fetch garne ───────────────────────────────
export async function getStaffMenuItems(): Promise<MenuItemData[]> {
  const staff = await requireStaffAuth();
  if (!staff || !staff.businessId) return [];

  const items = await prisma.menuItem.findMany({
    where: {
      businessId: staff.businessId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: Number(item.id),
    name: item.name,
    img: item.imageUrl || "/placeholder-dish.png",
    meta: item.description || "",
    category: item.category,
    price: `$${Number(item.price).toFixed(2)}`,
    status: normalizeStatus(item.status),
  }));
}

// ── 2. Dish ko availability status update garne ─────────────
export async function updateStaffDishStatus(
  id: number,
  newStatus: AvailabilityStatus
): Promise<{ success: boolean }> {
  const staff = await requireStaffAuth();
  if (!staff || !staff.businessId) return { success: false };

  try {
    const existing = await prisma.menuItem.findFirst({
      where: {
        id: BigInt(id),
        businessId: staff.businessId,
      },
    });

    if (!existing) return { success: false };

    await prisma.menuItem.update({
      where: { id: BigInt(id) },
      data: { status: newStatus },
    });

    revalidatePath("/menu-editor");
    revalidatePath("/staffdashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update dish status:", error);
    return { success: false };
  }
}