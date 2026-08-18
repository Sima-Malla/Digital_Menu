// lib/business.ts
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

export type BusinessSummary = {
  businessName: string;
  logoUrl: string | null;
};

export async function getBusinessSummary(businessId: bigint): Promise<BusinessSummary | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { businessName: true, logoUrl: true },
  });

  if (!business) return null;

  return {
    businessName: business.businessName,
    logoUrl: business.logoUrl,
  };
}