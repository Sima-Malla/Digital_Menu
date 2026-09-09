import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { toValidImageSrc } from "@/lib/image-utils";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type TrendingBusiness = {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string | null;
  orderCount: number;
};

const TRENDING_LIMIT = 8;
const TRENDING_WINDOW_DAYS = 30;

export async function getTrendingBusinesses(
  limit = TRENDING_LIMIT
): Promise<TrendingBusiness[]> {
  const since = new Date();
  since.setDate(since.getDate() - TRENDING_WINDOW_DAYS);

  // ── Step 1: rank by recent order volume ──────────────────────────
  const recentRanked = await prisma.order.groupBy({
    by: ["businessId"],
    where: { orderedAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const orderCountByBusiness = new Map<string, number>(
    recentRanked.map((r) => [r.businessId.toString(), r._count.id])
  );
  let rankedIds = recentRanked.map((r) => r.businessId);

  // ── Step 2: top up with all-time counts if the recent window is thin ──
  if (rankedIds.length < limit) {
    const allTimeRanked = await prisma.order.groupBy({
      by: ["businessId"],
      where: { businessId: { notIn: rankedIds } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit - rankedIds.length,
    });

    for (const r of allTimeRanked) {
      orderCountByBusiness.set(r.businessId.toString(), r._count.id);
    }
    rankedIds = [...rankedIds, ...allTimeRanked.map((r) => r.businessId)];
  }

  let businesses = await prisma.business.findMany({
    where: { id: { in: rankedIds }, listInMarketplace: true },
  });

  // findMany({ where: { id: { in } } }) does not preserve the `in` array's
  // order, so re-sort explicitly by the order counts we already computed.
  businesses.sort(
    (a, b) =>
      (orderCountByBusiness.get(b.id.toString()) ?? 0) -
      (orderCountByBusiness.get(a.id.toString()) ?? 0)
  );

  // ── Step 3: backfill with newest marketplace-listed businesses ──
  if (businesses.length < limit) {
    const excludeIds = businesses.map((b) => b.id);
    const filler = await prisma.business.findMany({
      where: { listInMarketplace: true, id: { notIn: excludeIds } },
      orderBy: { createdAt: "desc" },
      take: limit - businesses.length,
    });
    businesses = [...businesses, ...filler];
  }

 return businesses.map((b) => ({
    id: b.id.toString(),
    name: b.businessName,
    cuisine: b.businessType ?? "Restaurant",
    imageUrl: toValidImageSrc(b.bannerUrl) ?? toValidImageSrc(b.logoUrl),
    orderCount: orderCountByBusiness.get(b.id.toString()) ?? 0,
  }));
}