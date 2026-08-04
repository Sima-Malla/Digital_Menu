"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

/**
 * Logged-in staff lai session bata verify garne,
 * ani Staff table bata full record lyaune (businessId sahit).
 */
export async function requireStaffAuth() {
  const session = await getSession();

  if (!session || session.role !== "staff") return null;

  try {
    const staff = await prisma.staff.findUnique({
      where: { id: BigInt(session.userId) },
    });
    return staff;
  } catch (error) {
    console.error("Staff auth check failed:", error);
    return null;
  }
}