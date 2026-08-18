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

export async function getDashboardData(): Promise<DashboardData | null> {
  const businessId = await getBusinessId();
  if (!businessId) return null;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { businessName: true },
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  // 7 days ago (start of that day)
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 86400000);

  const [
    todaySalesAgg,
    activeOrdersCount,
    liveOrdersCount,
    totalMenuItems,
    weeklyOrders,
    topItems,
    recentOrdersRaw,
  ] = await Promise.all([
    // Today's completed sales
    prisma.order.aggregate({
      where: { businessId, status: "completed", orderedAt: { gte: todayStart, lt: todayEnd } },
      _sum: { totalAmount: true },
    }),
    // Active orders (new + preparing + ready)
    prisma.order.count({
      where: { businessId, status: { in: ["new", "preparing", "ready"] } },
    }),
    // Live (new only)
    prisma.order.count({
      where: { businessId, status: "new" },
    }),
    // Total menu items
    prisma.menuItem.count({ where: { businessId, isActive: true } }),
    // Last 7 days orders for chart
    prisma.order.findMany({
      where: { businessId, orderedAt: { gte: sevenDaysAgo, lt: todayEnd } },
      select: { orderedAt: true, totalAmount: true },
    }),
    // Top 3 menu items by order count (all time)
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { businessId } },
      _count: { menuItemId: true },
      _sum: { unitPrice: true },
      orderBy: { _count: { menuItemId: "desc" } },
      take: 3,
    }),
    // Recent 5 orders
    prisma.order.findMany({
      where: { businessId },
      include: { customer: true, items: true },
      orderBy: { orderedAt: "desc" },
      take: 5,
    }),
  ]);

  // Build weekly sales — ordered Mon to Sun for the last 7 days
  const salesByDay: { day: string; date: Date; value: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo.getTime() + i * 86400000);
    salesByDay.push({ day: DAYS[d.getDay()], date: d, value: 0 });
  }
  for (const o of weeklyOrders) {
    const orderDate = new Date(o.orderedAt.getFullYear(), o.orderedAt.getMonth(), o.orderedAt.getDate());
    const entry = salesByDay.find((e) => e.date.getTime() === orderDate.getTime());
    if (entry) entry.value += Number(o.totalAmount);
  }
  const weeklySales: WeeklySalesEntry[] = salesByDay.map(({ day, value }) => ({
    day,
    value: Math.round(value),
  }));

  // Resolve popular dishes with menu item details
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

  // Recent orders
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
