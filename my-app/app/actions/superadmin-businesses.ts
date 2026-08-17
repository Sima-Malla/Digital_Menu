// app/actions/superadmin-businesses.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; // shared singleton
import { getSession } from "@/lib/session";

export type SuperadminBusiness = {
  id: number;
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  revenue: string; // formatted, e.g. "$4,320"
};

export type ApiResult = {
  success: boolean;
  message?: string;
};

/** Every action re-checks the session itself — never trust a role passed
 * in from the client. */
async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    throw new Error("Not authorized.");
  }
  return session;
}

/**
 * 1. Business list ल्याउने — search/status/plan सबै DB query मै हुन्छ
 */
export async function getSuperadminBusinesses(filters: {
  search?: string;
  status?: string;
  plan?: string;
}): Promise<SuperadminBusiness[]> {
  await requireSuperAdmin().catch(() => null);

  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { businessName: { contains: filters.search, mode: "insensitive" } },
      { ownerName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.plan) where.plan = filters.plan;

  try {
    const businesses = await prisma.business.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Revenue = SUM of totalAmount across every order for that business.
    const revenueByBusiness = await prisma.order.groupBy({
      by: ["businessId"],
      _sum: { totalAmount: true },
    });
    const revenueMap = new Map(
      revenueByBusiness.map((r) => [r.businessId.toString(), Number(r._sum.totalAmount ?? 0)])
    );

    return businesses.map((b) => ({
      id: Number(b.id),
      logo: b.logoEmoji,
      name: b.businessName,
      owner: b.ownerName ?? "—",
      email: b.email ?? "—",
      phone: b.businessPhone ?? "—",
      plan: b.plan,
      status: b.status,
      revenue: `$${(revenueMap.get(b.id.toString()) ?? 0).toLocaleString()}`,
    }));
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
    return [];
  }
}

/**
 * 2. नयाँ Business थप्ने
 */
export async function createBusinessAction(payload: {
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
}): Promise<ApiResult> {
  const session = await requireSuperAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as super admin." };

  if (!payload.name || !payload.owner || !payload.email) {
    return { success: false, message: "Name, owner, and email are required." };
  }

  try {
    await prisma.business.create({
      data: {
        businessName: payload.name,
        ownerName: payload.owner,
        email: payload.email,
        businessPhone: payload.phone || null,
        logoEmoji: payload.logo || "🍽️",
        plan: payload.plan || "Basic",
        status: payload.status || "Active",
      },
    });

    revalidatePath("/superadmin/businesses");
    return { success: true };
  } catch (error) {
    console.error("Failed to create business:", error);
    // email has a @unique constraint — surface a clearer message for that case
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "A business with this email already exists."
        : "Failed to create business.";
    return { success: false, message };
  }
}

/**
 * 3. Business update गर्ने
 */
export async function updateBusinessAction(
  id: number,
  payload: Partial<{
    name: string;
    owner: string;
    email: string;
    phone: string;
    plan: string;
    status: string;
  }>
): Promise<ApiResult> {
  const session = await requireSuperAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as super admin." };

  try {
    await prisma.business.update({
      where: { id: BigInt(id) },
      data: {
        ...(payload.name !== undefined && { businessName: payload.name }),
        ...(payload.owner !== undefined && { ownerName: payload.owner }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.phone !== undefined && { businessPhone: payload.phone }),
        ...(payload.plan !== undefined && { plan: payload.plan }),
        ...(payload.status !== undefined && { status: payload.status }),
      },
    });

    revalidatePath("/superadmin/businesses");
    return { success: true };
  } catch (error) {
    console.error(`Failed to update business ${id}:`, error);
    return { success: false, message: "Failed to update business." };
  }
}

/**
 * 4. Business मेटाउने
 */
export async function deleteBusinessAction(id: number): Promise<ApiResult> {
  const session = await requireSuperAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as super admin." };

  try {
    // schema मा onDelete: Cascade भएकोले, यसको Staff/MenuItem/Order/etc.
    // पनि सँगै delete हुन्छन्।
    await prisma.business.delete({ where: { id: BigInt(id) } });

    revalidatePath("/superadmin/businesses");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete business ${id}:`, error);
    return { success: false, message: "Failed to delete business." };
  }
}