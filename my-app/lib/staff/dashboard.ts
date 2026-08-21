import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

const ACTIVE_STATUSES = ["new", "preparing", "ready"];

export type DashboardData = {
  businessName: string;
  totalOrdersToday: number;
  completedOrdersToday: number;
  activeOrdersCount: number;
  delayedOrdersCount: number;
  newOrdersPreview: {
    id: string;
    type: string;
    detail: string;
    orderedAt: string; // ISO — component computes "Xm ago" at render time
  }[];
  topItemsToday: { name: string; orders: number }[];
  typeBreakdown: { label: string; value: number; color: string }[];
  avgPrepMinutes: number | null; // null when no ready/completed orders yet today
  delayedAlert: { orderId: string; minutesAgo: number; reason: string } | null;
  tableActivity: { active: number; total: number };
};

const TYPE_COLORS: Record<string, string> = {
  "dine-in": "bg-slate-700",
  pickup: "bg-orange-500",
  delivery: "bg-blue-500",
};

const TYPE_LABELS: Record<string, string> = {
  "dine-in": "Dine-in",
  pickup: "Pickup",
  delivery: "Delivery",
};

export async function getStaffDashboardData(businessId: bigint): Promise<DashboardData> {
  // NOTE: uses server-local day boundaries, not Business.timezone — fine for
  // a single-region deployment, but worth revisiting with a timezone-aware
  // boundary (e.g. via a date library) if staff and server clocks diverge.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [business, todaysOrders, dineInLocations] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { businessName: true } }),
    prisma.order.findMany({
      where: { businessId, orderedAt: { gte: startOfDay } },
      include: { items: true, location: true },
      orderBy: { orderedAt: "desc" },
    }),
    prisma.location.findMany({ where: { businessId, type: "dine-in" } }),
  ]);

  const totalOrdersToday = todaysOrders.length;
  const completedOrdersToday = todaysOrders.filter((o) => o.status === "completed").length;
  const activeOrders = todaysOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const delayedOrders = todaysOrders.filter((o) => o.status === "delayed");

  /* ── New orders preview (latest 3 with status "new") ── */
  const newOrdersPreview = todaysOrders
    .filter((o) => o.status === "new")
    .slice(0, 3)
    .map((o) => {
      const itemsSummary = o.items.map((it) => `${it.quantity}x ${it.name}`).join(", ");
      const place = o.location?.label ?? TYPE_LABELS[o.orderType] ?? o.orderType;
      return {
        id: o.id.toString(),
        type: TYPE_LABELS[o.orderType] ?? o.orderType,
        detail: `${place} · ${itemsSummary || "No items"}`,
        orderedAt: o.orderedAt.toISOString(),
      };
    });

  /* ── Top selling items today (by quantity, across all of today's orders) ── */
  const qtyByItem = new Map<string, number>();
  for (const order of todaysOrders) {
    for (const item of order.items) {
      qtyByItem.set(item.name, (qtyByItem.get(item.name) ?? 0) + item.quantity);
    }
  }
  const topItemsToday = [...qtyByItem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, orders]) => ({ name, orders }));

  /* ── Order type breakdown (% of today's orders per orderType) ── */
  const countByType = new Map<string, number>();
  for (const order of todaysOrders) {
    countByType.set(order.orderType, (countByType.get(order.orderType) ?? 0) + 1);
  }
  const typeBreakdown = [...countByType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      label: TYPE_LABELS[type] ?? type,
      value: totalOrdersToday > 0 ? Math.round((count / totalOrdersToday) * 100) : 0,
      color: TYPE_COLORS[type] ?? "bg-gray-400",
    }));

  /* ── Average prep time (updatedAt - orderedAt, for orders that reached
     ready/completed today) — approximate: schema has no dedicated
     kitchenStartedAt/readyAt timestamps, only orderedAt/updatedAt ── */
  const prepDurations = todaysOrders
    .filter((o) => o.status === "ready" || o.status === "completed")
    .map((o) => (o.updatedAt.getTime() - o.orderedAt.getTime()) / 60000);
  const avgPrepMinutes =
    prepDurations.length > 0
      ? Math.round((prepDurations.reduce((a, b) => a + b, 0) / prepDurations.length) * 10) / 10
      : null;

  /* ── Delayed alert (most recent delayed order) ── */
  const topDelayed = delayedOrders[0];
  const delayedAlert = topDelayed
    ? {
        orderId: topDelayed.id.toString(),
        minutesAgo: Math.round((Date.now() - topDelayed.orderedAt.getTime()) / 60000),
        reason: topDelayed.delayReason ?? "No reason logged",
      }
    : null;

  /* ── Table activity (real Location data — dine-in only) ── */
  const activeLocationIds = new Set(
    activeOrders.filter((o) => o.locationId).map((o) => o.locationId!.toString())
  );

  return {
    businessName: business?.businessName ?? "Restaurant",
    totalOrdersToday,
    completedOrdersToday,
    activeOrdersCount: activeOrders.length,
    delayedOrdersCount: delayedOrders.length,
    newOrdersPreview,
    topItemsToday,
    typeBreakdown,
    avgPrepMinutes,
    delayedAlert,
    tableActivity: { active: activeLocationIds.size, total: dineInLocations.length },
  };
}