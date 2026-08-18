// lib/staff.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type StaffSidebarSummary = {
  fullName: string;
  position: string;
  role: string;
  businessName: string;
  logoUrl: string | null;
};

export async function getStaffSidebarSummary(staffId: bigint): Promise<StaffSidebarSummary | null> {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      fullName: true,
      position: true,
      role: true,
      business: { select: { businessName: true, logoUrl: true } },
    },
  });

  if (!staff) return null;

  return {
    fullName: staff.fullName,
    position: staff.position,
    role: staff.role,
    businessName: staff.business.businessName,
    logoUrl: staff.business.logoUrl,
  };
}