"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

async function getBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session) return null;
  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  return staff?.businessId ?? null;
}

export type DashboardStats = {
  todaySales: number;
  activeOrders: number;
  liveOrders: number;
  totalMenuItems: number;
};

export type WeeklySalesEntry = { day: string; value: number };

export type PopularDish = {
  id: string;
  name: string;
  imageUrl: string | null;
  orderCount: number;
  revenue: number;
};

export type RecentOrder = {
  id: string;
  customer: string;
  initials: string;
  avatarBg: string;
  items: string;
  total: string;
  status: string;
};

export type DashboardData = {
  businessName: string;
  stats: DashboardStats;
  weeklySales: WeeklySalesEntry[];
  popularDishes: PopularDish[];
  recentOrders: RecentOrder[];
};

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function getNepalDayBounds() {
  const nowNepal = new Date(Date.now() + NEPAL_OFFSET_MS);
  const nepalMidnight =
    Date.UTC(nowNepal.getUTCFullYear(), nowNepal.getUTCMonth(), nowNepal.getUTCDate()) -
    NEPAL_OFFSET_MS;
  return {
    todayStart: new Date(nepalMidnight),
    todayEnd: new Date(nepalMidnight + 86400000),
    sevenDaysAgo: new Date(nepalMidnight - 6 * 86400000),
  };
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const businessId = await getBusinessId();
  if (!businessId) return null;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { businessName: true },
  });

  const { todayStart, todayEnd, sevenDaysAgo } = getNepalDayBounds();

  // DEBUG — terminal ma hernu
  const allTodayOrders = await prisma.order.findMany({
    where: { businessId, orderedAt: { gte: todayStart, lt: todayEnd } },
    select: { id: true, status: true, paymentStatus: true, totalAmount: true, orderedAt: true },
  });
  console.log("=== DASHBOARD DEBUG ===");
  console.log("todayStart (UTC):", todayStart.toISOString());
  console.log("todayEnd   (UTC):", todayEnd.toISOString());
  console.log("All orders today:", JSON.stringify(allTodayOrders.map(o => ({
    id: o.id.toString(),
    status: o.status,
    paymentStatus: o.paymentStatus,
    amount: o.totalAmount.toString(),
    orderedAt: o.orderedAt.toISOString(),
  })), null, 2));
  console.log("======================");

  const [
    todaySalesAgg,
    activeOrdersCount,
    liveOrdersCount,
    totalMenuItems,
    weeklyOrders,
    topItems,
    recentOrdersRaw,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        businessId,
        orderedAt: { gte: todayStart, lt: todayEnd },
        OR: [
          { status: "completed" },
          { paymentStatus: "paid" },
        ],
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: { businessId, status: { in: ["new", "preparing", "ready"] } },
    }),
    prisma.order.count({
      where: { businessId, status: "new" },
    }),
    prisma.menuItem.count({ where: { businessId, isActive: true } }),
    prisma.order.findMany({
      where: {
        businessId,
        orderedAt: { gte: sevenDaysAgo, lt: todayEnd },
        OR: [
          { status: "completed" },
          { paymentStatus: "paid" },
        ],
      },
      select: { orderedAt: true, totalAmount: true },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { businessId } },
      _count: { menuItemId: true },
      _sum: { unitPrice: true },
      orderBy: { _count: { menuItemId: "desc" } },
      take: 3,
    }),
    prisma.order.findMany({
      where: { businessId },
      include: { customer: true, items: true },
      orderBy: { orderedAt: "desc" },
      take: 5,
    }),
  ]);

  const salesByDay: { day: string; date: Date; value: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo.getTime() + i * 86400000);
    salesByDay.push({ day: DAYS[d.getDay()], date: d, value: 0 });
  }
  for (const o of weeklyOrders) {
    const nepalTime = new Date(o.orderedAt.getTime() + NEPAL_OFFSET_MS);
    const orderDayStart = new Date(
      Date.UTC(nepalTime.getUTCFullYear(), nepalTime.getUTCMonth(), nepalTime.getUTCDate()) -
        NEPAL_OFFSET_MS
    );
    const entry = salesByDay.find((e) => e.date.getTime() === orderDayStart.getTime());
    if (entry) entry.value += Number(o.totalAmount);
  }
  const weeklySales: WeeklySalesEntry[] = salesByDay.map(({ day, value }) => ({
    day,
    value: Math.round(value),
  }));

  const menuItemIds = topItems.map((t) => t.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, imageUrl: true },
  });
  const menuItemMap = Object.fromEntries(menuItems.map((m) => [m.id.toString(), m]));

  const popularDishes: PopularDish[] = topItems.map((t) => {
    const item = menuItemMap[t.menuItemId.toString()];
    return {
      id: t.menuItemId.toString(),
      name: item?.name ?? "Unknown",
      imageUrl: item?.imageUrl ?? null,
      orderCount: t._count.menuItemId,
      revenue: Number(t._sum.unitPrice ?? 0),
    };
  });

  const avatarColors = [
    "bg-orange-100 text-orange-600",
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
    "bg-pink-100 text-pink-500",
    "bg-gray-200 text-gray-600",
  ];
  const recentOrders: RecentOrder[] = recentOrdersRaw.map((o, i) => {
    const initials = o.customer.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const itemsSummary = o.items
      .slice(0, 2)
      .map((it) => `${it.quantity}x ${it.name}`)
      .join(", ");
    return {
      id: `#${o.id.toString()}`,
      customer: o.customer.name,
      initials,
      avatarBg: avatarColors[i % avatarColors.length],
      items: itemsSummary || "—",
      total: `Rs. ${Number(o.totalAmount).toFixed(2)}`,
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
    };
  });

  return {
    businessName: business?.businessName ?? "Dashboard",
    stats: {
      todaySales: Number(todaySalesAgg._sum.totalAmount ?? 0),
      activeOrders: activeOrdersCount,
      liveOrders: liveOrdersCount,
      totalMenuItems,
    },
    weeklySales,
    popularDishes,
    recentOrders,
  };
}
