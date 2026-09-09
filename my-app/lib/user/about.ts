import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type AboutStats = {
  partnerBusinesses: number;
  monthlyOrders: number;
  cities: number; // approximate — see note below
};

export async function getAboutStats(): Promise<AboutStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [partnerBusinesses, monthlyOrders, addressRows] = await Promise.all([
    prisma.business.count(),
    prisma.order.count({ where: { orderedAt: { gte: thirtyDaysAgo } } }),
    // NOTE: Business has no dedicated `city` column — businessAddress is
    // free text. This counts distinct non-empty addresses as a rough stand-in
    // for "cities served," which overcounts if two businesses share a city
    // but have different street addresses. For an accurate city count, add
    // a `city` field to Business and group by that instead.
    prisma.business.findMany({
      where: { businessAddress: { not: null } },
      select: { businessAddress: true },
      distinct: ["businessAddress"],
    }),
  ]);

  return {
    partnerBusinesses,
    monthlyOrders,
    cities: addressRows.length,
  };
}

function formatCompact(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`;
  return `${n}`;
}

export function formatStat(n: number): string {
  return formatCompact(n);
}