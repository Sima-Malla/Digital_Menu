// app/actions/superadmin/superadmin-dashboard.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    throw new Error("Not authorized.");
  }
  return session;
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfPrevMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

// ---------------------------------------------------------------------------
// Types (match the frontend's imports exactly)
// ---------------------------------------------------------------------------
export type DashboardStats = {
  totalRevenue: string;
  totalRevenueChange: string;
  activeBusinesses: number;
  activeBusinessesSubtitle: string;
  pendingApprovals: number;
};

export type QueueBusiness = {
  id: number;
  initials: string;
  name: string;
  regId: string;
  type: string;
  location: string;
  status: string;
  ownerName: string;
  email: string;
  phone: string;
  registeredAt: string;
};

export type TypeBreakdown = {
  type: string;
  count: number;
};

export type BusinessPerformance = {
  id: number;
  name: string;
  location: string;
  locationCount: number;
  revenueMTD: string;
  activeOrders: number;
  growth: string;
  positive: boolean;
};

type ApiResult = { success: boolean; message?: string };

// ---------------------------------------------------------------------------
// 1. Stat cards
// ---------------------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  await requireSuperAdmin().catch(() => null);

  try {
    const thisMonthStart = startOfMonth();
    const prevMonthStart = startOfPrevMonth();

    const [totalRevAgg, thisMonthAgg, prevMonthAgg, activeCount, pendingCount, typeGroups] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderedAt: { gte: thisMonthStart } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderedAt: { gte: prevMonthStart, lt: thisMonthStart } },
      }),
      prisma.business.count({ where: { status: "Active" } }),
      prisma.business.count({ where: { status: "Pending" } }),
      prisma.business.groupBy({ by: ["businessType"] }),
    ]);

    const thisMonth = Number(thisMonthAgg._sum.totalAmount ?? 0);
    const prevMonth = Number(prevMonthAgg._sum.totalAmount ?? 0);
    const changePct = prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : 0;
    const validTypesCount = typeGroups.filter((t) => t.businessType !== null).length;

    const revenueFooter = changePct !== 0
      ? `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% vs previous month`
      : "Overall Platform Revenue";

    return {
      totalRevenue: `Rs. ${Number(totalRevAgg._sum.totalAmount ?? 0).toLocaleString()}`,
      totalRevenueChange: revenueFooter,
      activeBusinesses: activeCount,
      activeBusinessesSubtitle: `Across ${validTypesCount} type${validTypesCount === 1 ? "" : "s"}`,
      pendingApprovals: pendingCount,
    };
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    return {
      totalRevenue: "Rs. 0",
      totalRevenueChange: "—",
      activeBusinesses: 0,
      activeBusinessesSubtitle: "—",
      pendingApprovals: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// 2. Registration queue (search + type filter happen server-side)
// ---------------------------------------------------------------------------
export async function getRegistrationQueue(filters?: {
  search?: string;
  type?: string;
}): Promise<QueueBusiness[]> {
  await requireSuperAdmin().catch(() => null);

  const where: Record<string, unknown> = { status: "Pending" };

  if (filters?.search) {
    where.OR = [
      { businessName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.type) where.businessType = filters.type;

  try {
    const pending = await prisma.business.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return pending.map((b) => ({
      id: Number(b.id),
      initials: initialsFor(b.businessName),
      name: b.businessName,
      regId: `BUS-${b.id.toString().padStart(4, "0")}`,
      type: b.businessType ?? "—",
      location: b.businessAddress ?? "—",
      status: b.status,
      ownerName: b.ownerName ?? "—",
      email: b.email ?? "—",
      phone: b.businessPhone ?? "—",
      registeredAt: b.createdAt.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));
  } catch (error) {
    console.error("Failed to load registration queue:", error);
    return [];
  }
}

export async function getQueueTypeOptions(): Promise<string[]> {
  await requireSuperAdmin().catch(() => null);

  try {
    const types = await prisma.business.findMany({
      where: { status: "Pending", businessType: { not: null } },
      select: { businessType: true },
      distinct: ["businessType"],
    });
    return types.map((t) => t.businessType as string).filter(Boolean);
  } catch (error) {
    console.error("Failed to load queue type options:", error);
    return [];
  }
}

export async function approveBusinessAction(id: number): Promise<ApiResult> {
  const session = await requireSuperAdmin().catch(() => null);
  if (!session) return { success: false, message: "Not authorized." };

  try {
    await prisma.business.update({ where: { id: BigInt(id) }, data: { status: "Active" } });
    revalidatePath("/superdashboard");
    revalidatePath("/superadmin/dashboard");
    return { success: true };
  } catch (error) {
    console.error(`Failed to approve business ${id}:`, error);
    return { success: false, message: "Failed to approve business." };
  }
}

export async function rejectBusinessAction(id: number): Promise<ApiResult> {
  const session = await requireSuperAdmin().catch(() => null);
  if (!session) return { success: false, message: "Not authorized." };

  try {
    await prisma.business.update({ where: { id: BigInt(id) }, data: { status: "Suspended" } });
    revalidatePath("/superdashboard");
    revalidatePath("/superadmin/dashboard");
    return { success: true };
  } catch (error) {
    console.error(`Failed to reject business ${id}:`, error);
    return { success: false, message: "Failed to reject business." };
  }
}

// ---------------------------------------------------------------------------
// 3. Business Types breakdown (all businesses, any status)
// ---------------------------------------------------------------------------
export async function getBusinessTypeBreakdown(): Promise<TypeBreakdown[]> {
  await requireSuperAdmin().catch(() => null);

  try {
    const grouped = await prisma.business.groupBy({
      by: ["businessType"],
      _count: { _all: true },
      orderBy: { _count: { businessType: "desc" } },
    });

    return grouped.map((g) => ({
      type: g.businessType ?? "Unspecified",
      count: g._count._all,
    }));
  } catch (error) {
    console.error("Failed to load business type breakdown:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 4. Business performance table (revenue MTD, active orders, growth)
// ---------------------------------------------------------------------------
export async function getBusinessPerformance(): Promise<BusinessPerformance[]> {
  await requireSuperAdmin().catch(() => null);

  try {
    const thisMonthStart = startOfMonth();
    const prevMonthStart = startOfPrevMonth();

    const businesses = await prisma.business.findMany({
      where: { status: "Active" },
      include: { locations: { select: { id: true } } },
    });

    const [thisMonthByBiz, prevMonthByBiz, activeOrdersByBiz] = await Promise.all([
      prisma.order.groupBy({
        by: ["businessId"],
        where: { orderedAt: { gte: thisMonthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["businessId"],
        where: { orderedAt: { gte: prevMonthStart, lt: thisMonthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["businessId"],
        where: { status: { in: ["new", "preparing", "ready", "delayed"] } },
        _count: { _all: true },
      }),
    ]);

    const thisMonthMap = new Map(thisMonthByBiz.map((r) => [r.businessId.toString(), Number(r._sum.totalAmount ?? 0)]));
    const prevMonthMap = new Map(prevMonthByBiz.map((r) => [r.businessId.toString(), Number(r._sum.totalAmount ?? 0)]));
    const activeOrdersMap = new Map(activeOrdersByBiz.map((r) => [r.businessId.toString(), r._count._all]));

    return businesses
      .map((b) => {
        const key = b.id.toString();
        const thisMonth = thisMonthMap.get(key) ?? 0;
        const prevMonth = prevMonthMap.get(key) ?? 0;
        const growthPct = prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : thisMonth > 0 ? 100 : 0;

        return {
          id: Number(b.id),
          name: b.businessName,
          location: b.businessAddress ?? "—",
          locationCount: b.locations.length,
          revenueMTD: `Rs. ${thisMonth.toLocaleString()}`,
          activeOrders: activeOrdersMap.get(key) ?? 0,
          growth: `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%`,
          positive: growthPct >= 0,
          _sortRevenue: thisMonth,
        };
      })
      .sort((a, b) => b._sortRevenue - a._sortRevenue)
      .slice(0, 10)
      .map(({ _sortRevenue, ...rest }) => rest);
  } catch (error) {
    console.error("Failed to load business performance:", error);
    return [];
  }
}