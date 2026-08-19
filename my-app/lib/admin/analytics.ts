// lib/analytics.ts
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

export type AnalyticsData = {
  businessName: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topCategory: string;
  salesTrend: { label: string; revenue: number; orders: number }[];
  orderChannels: { label: string; pct: number; color: string }[];
  topItems: { name: string; qty: number; revenue: number }[];
  heatmapDays: string[];
  heatmapHourLabels: string[];
  heatmapMatrix: number[][]; // 0-4 intensity, [day][hour]
  returningCustomerPct: number;
};

const CHANNEL_COLORS: Record<string, string> = {
  "dine-in": "#f97316",
  delivery: "#3b82f6",
  pickup: "#4b5563",
};

const CHANNEL_LABELS: Record<string, string> = {
  "dine-in": "Dine-in",
  delivery: "Delivery",
  pickup: "Takeaway",
};

const HEATMAP_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // 10am–10pm
const HEATMAP_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function getAnalyticsData(
  businessId: bigint,
  daysBack = 30
): Promise<AnalyticsData> {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const [business, orders] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { businessName: true } }),
    prisma.order.findMany({
      where: { businessId, orderedAt: { gte: since } },
      include: { items: true, customer: true },
      orderBy: { orderedAt: "asc" },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  /* ── Top category (by revenue, via MenuItem.category) ── */
  const menuItemIds = Array.from(
    new Set(orders.flatMap((o) => o.items.map((it) => it.menuItemId)))
  );
  const menuItems = menuItemIds.length
    ? await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        select: { id: true, category: true },
      })
    : [];
  const categoryById = new Map(menuItems.map((m) => [m.id.toString(), m.category]));

  const categoryRevenue = new Map<string, number>();
  const itemStats = new Map<string, { name: string; qty: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const lineRevenue = Number(item.unitPrice) * item.quantity;

      const category = categoryById.get(item.menuItemId.toString()) ?? "Uncategorized";
      categoryRevenue.set(category, (categoryRevenue.get(category) ?? 0) + lineRevenue);

      const key = item.menuItemId.toString();
      const existing = itemStats.get(key);
      if (existing) {
        existing.qty += item.quantity;
        existing.revenue += lineRevenue;
      } else {
        itemStats.set(key, { name: item.name, qty: item.quantity, revenue: lineRevenue });
      }
    }
  }

  const topCategory =
    [...categoryRevenue.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const topItems = [...itemStats.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  /* ── Sales trend (daily revenue + order count over the window) ── */
  const trendMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const key = order.orderedAt.toISOString().slice(0, 10); // YYYY-MM-DD
    const bucket = trendMap.get(key) ?? { revenue: 0, orders: 0 };
    bucket.revenue += Number(order.totalAmount);
    bucket.orders += 1;
    trendMap.set(key, bucket);
  }
  const salesTrend = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      label: new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      revenue: v.revenue,
      orders: v.orders,
    }));

  /* ── Order channels (orderType breakdown) ── */
  const channelCounts = new Map<string, number>();
  for (const order of orders) {
    channelCounts.set(order.orderType, (channelCounts.get(order.orderType) ?? 0) + 1);
  }
  const orderChannels = [...channelCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      label: CHANNEL_LABELS[type] ?? type,
      pct: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
      color: CHANNEL_COLORS[type] ?? "#9ca3af",
    }));

  /* ── Peak hours heatmap (day-of-week x hour, intensity 0-4) ── */
  const rawMatrix: number[][] = Array.from({ length: 7 }, () =>
    Array(HEATMAP_HOURS.length).fill(0)
  );
  for (const order of orders) {
    const jsDay = order.orderedAt.getDay(); // 0=Sun..6=Sat
    const dayIndex = (jsDay + 6) % 7; // convert to Mon=0..Sun=6
    const hour = order.orderedAt.getHours();
    const hourIndex = HEATMAP_HOURS.indexOf(hour);
    if (hourIndex !== -1) {
      rawMatrix[dayIndex][hourIndex] += 1;
    }
  }
  const maxCount = Math.max(1, ...rawMatrix.flat());
  const heatmapMatrix = rawMatrix.map((row) =>
    row.map((count) => Math.min(4, Math.round((count / maxCount) * 4)))
  );

  /* ── Returning customers (customers with 2+ orders in window, over all customers seen) ── */
  const ordersByCustomer = new Map<string, number>();
  for (const order of orders) {
    const key = order.customerId.toString();
    ordersByCustomer.set(key, (ordersByCustomer.get(key) ?? 0) + 1);
  }
  const totalCustomers = ordersByCustomer.size;
  const returningCustomers = [...ordersByCustomer.values()].filter((c) => c > 1).length;
  const returningCustomerPct =
    totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

  return {
    businessName: business?.businessName ?? "Restaurant",
    totalRevenue,
    totalOrders,
    avgOrderValue,
    topCategory,
    salesTrend,
    orderChannels,
    topItems,
    heatmapDays: HEATMAP_DAY_LABELS,
    heatmapHourLabels: ["10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"],
    heatmapMatrix,
    returningCustomerPct,
  };
}