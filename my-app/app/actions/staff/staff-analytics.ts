"use server";

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

export interface AnalyticsData {
  avgOrderValue: string;
  avgFulfillmentTime: string;
  totalOrders: number;
  tableTurnover: string;
  weeklySales: { day: string; value: number }[];
  peakHours: { hour: string; value: number }[];
  bestSellers: { name: string; orders: number }[];
  worstSellers: { name: string; orders: number }[];
}

function getSinceDate(range: string): Date {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "Today":
      d.setHours(0, 0, 0, 0);
      return d;
    case "This Month":
      d.setMonth(d.getMonth() - 1);
      return d;
    case "Last 90 Days":
      d.setDate(d.getDate() - 90);
      return d;
    case "This Week":
    default:
      d.setDate(d.getDate() - 7);
      return d;
  }
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${period}`;
}

/**
 * Analytics scoped to the LOGGED-IN STAFF's own business only.
 * Previously this pulled orders across every business — fixed here by
 * first resolving the staff's businessId, then filtering all queries by it.
 */
export async function getStaffAnalytics(range: string = "This Week"): Promise<AnalyticsData | null> {
  const session = await getSession();
  if (!session || session.role !== "staff") return null;

  const staff = await prisma.staff.findUnique({ where: { email: session.email } });
  if (!staff || !staff.businessId) return null;

  const businessId = staff.businessId;
  const since = getSinceDate(range);

  try {
    const orders = await prisma.order.findMany({
      where: { businessId, orderedAt: { gte: since } },
      include: { items: true },
      orderBy: { orderedAt: "desc" },
    });

    const totalOrders = orders.length;

    let totalRevenue = 0;
    orders.forEach((o) => {
      totalRevenue += Number(o.totalAmount);
    });
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";

    // Fulfillment time: gap between orderedAt and updatedAt for completed orders
    const completed = orders.filter((o) => o.status === "completed");
    let avgFulfillmentMin = 0;
    if (completed.length > 0) {
      const totalMin = completed.reduce((sum, o) => {
        const diffMs = new Date(o.updatedAt).getTime() - new Date(o.orderedAt).getTime();
        return sum + diffMs / 60000;
      }, 0);
      avgFulfillmentMin = totalMin / completed.length;
    }

    // Best/worst sellers
    const itemCounts: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    const sortedItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, orders: count }))
      .sort((a, b) => b.orders - a.orders);
    const bestSellers = sortedItems.slice(0, 3);
    const worstSellers = sortedItems.length > 3 ? sortedItems.slice(-3).reverse() : [];

    // Weekly sales (Mon-Sun bar heights, relative to the busiest day)
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach((o) => {
      dayCounts[new Date(o.orderedAt).getDay()] += 1;
    });
    const maxDay = Math.max(...dayCounts, 1);
    const weeklySales = [1, 2, 3, 4, 5, 6, 0].map((i) => ({
      day: dayLabels[i],
      value: Math.round((dayCounts[i] / maxDay) * 100),
    }));

    // Peak hours (2-hour buckets, relative to busiest bucket)
    const hourBuckets: Record<number, number> = {};
    orders.forEach((o) => {
      const h = new Date(o.orderedAt).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    });
    const maxHour = Math.max(...Object.values(hourBuckets), 1);
    const hourSlots = [10, 12, 14, 16, 18, 20, 22];
    const peakHours = hourSlots.map((h) => ({
      hour: formatHour(h),
      value: Math.round(((hourBuckets[h] || 0) / maxHour) * 100),
    }));

    // Table turnover: orders per distinct location used
    const locationIds = new Set(orders.filter((o) => o.locationId).map((o) => o.locationId!.toString()));
    const tableTurnover = locationIds.size > 0 ? `${(totalOrders / locationIds.size).toFixed(1)}x` : "0x";

    return {
      avgOrderValue: `Rs. ${avgOrderValue}`,
      avgFulfillmentTime: `${avgFulfillmentMin.toFixed(1)} min`,
      totalOrders,
      tableTurnover,
      weeklySales,
      peakHours,
      bestSellers,
      worstSellers,
    };
  } catch (error) {
    console.error("Failed to fetch staff analytics:", error);
    return null;
  }
}
