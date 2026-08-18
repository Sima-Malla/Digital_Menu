"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

const ALLOWED_ROLES = ["owner", "manager", "staff"];

/**
 * Logged-in staff lai session bata verify garne,
 * ani Staff table bata full record lyaune (businessId sahit).
 * Allows any business-side role (owner, manager, staff) — not just
 * literal "staff" — since this page/action should be usable by anyone
 * belonging to a business, regardless of permission level.
 */
export async function requireStaffAuth() {
  const session = await getSession();

  if (!session || !ALLOWED_ROLES.includes(session.role)) return null;

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