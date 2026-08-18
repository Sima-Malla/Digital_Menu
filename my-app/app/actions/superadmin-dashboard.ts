"use server";

import { revalidatePath } from "next/cache";
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

type ActionResult = { success: true } | { success: false; message: string };

async function requireSuperadmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") return null;
  return session;
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}
function pct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "New" : "0%";
  const p = Math.round(((current - previous) / previous) * 100);
  return `${p >= 0 ? "+" : ""}${p}%`;
}

// ---------------------------------------------------------------------------
// Top stat cards
// ---------------------------------------------------------------------------
export interface DashboardStats {
  totalRevenue: string;
  totalRevenueChange: string;
  activeBusinesses: number;
  activeBusinessesSubtitle: string;
  pendingApprovals: number;
  // NOTE: no uptime/monitoring table exists in the schema, so this can't be
  // computed from the DB. Wire this to your actual monitoring provider
  // (e.g. a status-page API) when you have one; static for now.
  systemHealth: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireSuperadmin();
  if (!session) {
    return {
      totalRevenue: "$0",
      totalRevenueChange: "",
      activeBusinesses: 0,
      activeBusinessesSubtitle: "",
      pendingApprovals: 0,
      systemHealth: "—",
    };
  }

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    revenueAgg,
    revenueThisMonthAgg,
    revenueLastMonthAgg,
    totalBusinesses,
    activeOwners,
    pendingOwners,
    businessTypeCount,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { orderedAt: { gte: startOfThisMonth } } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderedAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
    }),
    prisma.business.count(),
    prisma.staff.count({ where: { role: "owner", needsOnboarding: false, isActive: true } }),
    prisma.staff.count({ where: { role: "owner", needsOnboarding: true } }),
    prisma.business.findMany({ select: { businessType: true }, distinct: ["businessType"] }),
  ]);

  const distinctTypes = businessTypeCount.filter((b) => b.businessType).length;

  return {
    totalRevenue: fmtMoney(Number(revenueAgg._sum.totalAmount ?? 0)),
    totalRevenueChange: `${pct(
      Number(revenueThisMonthAgg._sum.totalAmount ?? 0),
      Number(revenueLastMonthAgg._sum.totalAmount ?? 0)
    )} vs last month`,
    activeBusinesses: activeOwners,
    activeBusinessesSubtitle: `Across ${distinctTypes} business types`,
    pendingApprovals: pendingOwners,
    systemHealth: "99.9%",
  };
}

// ---------------------------------------------------------------------------
// Registration Queue — businesses whose owner still needs onboarding approval
// ---------------------------------------------------------------------------
export interface QueueBusiness {
  id: number;
  initials: string;
  name: string;
  regId: string;
  type: string;
  location: string;
  status: "Pending Review" | "Verifying Info";
  email: string;
  phone: string;
  ownerName: string;
  registeredAt: string;
}

export async function getRegistrationQueue(search?: string): Promise<QueueBusiness[]> {
  const session = await requireSuperadmin();
  if (!session) return [];

  const businesses = await prisma.business.findMany({
    where: {
      staff: { some: { role: "owner", needsOnboarding: true } },
      ...(search
        ? {
            OR: [
              { businessName: { contains: search, mode: "insensitive" as const } },
              { businessType: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: { staff: { where: { role: "owner" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return businesses.map((b) => {
    const owner = b.staff[0];
    const initials = b.businessName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return {
      id: Number(b.id),
      initials,
      name: b.businessName,
      regId: `#REG-${b.id.toString().padStart(4, "0")}`,
      type: b.businessType ?? "—",
      location: b.businessAddress ?? "—",
      // No separate "verification step" field exists — everyone pending is
      // shown as "Pending Review". Add a real status column if you need the
      // "Verifying Info" distinction to mean something specific.
      status: "Pending Review",
      email: b.email ?? owner?.email ?? "",
      phone: b.businessPhone ?? "",
      ownerName: owner?.fullName ?? "—",
      registeredAt: b.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  });
}

export async function approveBusinessAction(businessId: number): Promise<ActionResult> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  try {
    const owner = await prisma.staff.findFirst({
      where: { businessId: BigInt(businessId), role: "owner" },
    });
    if (!owner) return { success: false, message: "Owner record not found for this business." };

    await prisma.staff.update({
      where: { id: owner.id },
      data: { needsOnboarding: false },
    });

    revalidatePath("/superdashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve business:", error);
    return { success: false, message: "Failed to approve business." };
  }
}

// ---------------------------------------------------------------------------
// Business type breakdown — replaces "Active Territories" (no geo field
// exists on Business to group by region/city, so this groups by the field
// that actually exists: businessType).
// ---------------------------------------------------------------------------
export interface TypeBreakdown {
  type: string;
  count: number;
}

export async function getBusinessTypeBreakdown(): Promise<TypeBreakdown[]> {
  const session = await requireSuperadmin();
  if (!session) return [];

  const businesses = await prisma.business.findMany({ select: { businessType: true } });
  const counts = new Map<string, number>();
  businesses.forEach((b) => {
    const type = b.businessType || "Unspecified";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// Business performance — replaces "Chain Performance Index". There's no
// "chain" entity in the schema (each Business is independent), so this is
// per-business. "Avg Rating" is dropped entirely — no review/rating model
// exists in the schema, so it can't be shown as real data.
// ---------------------------------------------------------------------------
export interface BusinessPerformance {
  id: number;
  name: string;
  locationCount: number;
  revenueMTD: string;
  activeOrders: number;
  growth: string;
  positive: boolean;
  status: "STABLE" | "ACTION REQ";
}

export async function getBusinessPerformance(): Promise<BusinessPerformance[]> {
  const session = await requireSuperadmin();
  if (!session) return [];

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const businesses = await prisma.business.findMany({
    include: {
      locations: true,
      _count: { select: { locations: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const results: BusinessPerformance[] = [];

  for (const b of businesses) {
    const [revenueThisMonth, revenueLastMonth, activeOrders] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { businessId: b.id, orderedAt: { gte: startOfThisMonth } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { businessId: b.id, orderedAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
      }),
      prisma.order.count({
        where: { businessId: b.id, status: { in: ["new", "preparing", "ready"] } },
      }),
    ]);

    const thisAmt = Number(revenueThisMonth._sum.totalAmount ?? 0);
    const lastAmt = Number(revenueLastMonth._sum.totalAmount ?? 0);
    const growthPct = lastAmt === 0 ? (thisAmt > 0 ? 100 : 0) : Math.round(((thisAmt - lastAmt) / lastAmt) * 100);

    results.push({
      id: Number(b.id),
      name: b.businessName,
      locationCount: b._count.locations,
      revenueMTD: fmtMoney(thisAmt),
      activeOrders,
      growth: `${growthPct >= 0 ? "+" : ""}${growthPct}%`,
      positive: growthPct >= 0,
      status: growthPct >= 0 ? "STABLE" : "ACTION REQ",
    });
  }

  return results.sort((a, b) => parseFloat(b.revenueMTD.replace(/[$,]/g, "")) - parseFloat(a.revenueMTD.replace(/[$,]/g, "")));
}