"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

const SUPERADMIN_PATH = "/business";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    throw new Error("Not authorized.");
  }
  return session;
}

export async function approveBusinessAction(businessId: string) {
  await requireSuperAdmin();

  await prisma.staff.updateMany({
    where: { businessId: BigInt(businessId) },
    data: { needsOnboarding: false },
  });

  revalidatePath(SUPERADMIN_PATH);
}

export async function rejectBusinessAction(businessId: string) {
  await requireSuperAdmin();

  // Deletes the business AND its owner's Staff row (cascade), since a
  // rejected signup shouldn't leave an orphaned login account behind.
  await prisma.business.delete({
    where: { id: BigInt(businessId) },
  });

  revalidatePath(SUPERADMIN_PATH);
}