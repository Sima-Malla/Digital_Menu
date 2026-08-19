"use server";

// Adjust this import to wherever your Prisma client singleton lives,
// e.g. `import prisma from "@/lib/prisma"` — this assumes a named export.
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/log-event";

export type SuperadminBusiness = {
  id: number;
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  revenue: string;
};

type GetBusinessesParams = {
  search?: string;
  status?: string;
  plan?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function getSuperadminBusinesses(
  params: GetBusinessesParams = {}
): Promise<SuperadminBusiness[]> {
  const { search, status, plan } = params;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (plan) where.plan = plan;

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { ownerName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const businesses = await prisma.business.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (businesses.length === 0) return [];

  const businessIds = businesses.map((b) => b.id);

  // One aggregate query for all businesses instead of N+1.
  const revenueRows = await prisma.order.groupBy({
    by: ["businessId"],
    where: {
      businessId: { in: businessIds },
      paymentStatus: "paid",
    },
    _sum: { totalAmount: true },
  });

  const revenueMap = new Map<string, number>();
  for (const row of revenueRows) {
    revenueMap.set(row.businessId.toString(), Number(row._sum.totalAmount ?? 0));
  }

  return businesses.map((b) => ({
    id: Number(b.id),
    logo: b.logoUrl || "🍽️",
    name: b.businessName,
    owner: b.ownerName || "—",
    email: b.email || "",
    phone: b.businessPhone || "",
    plan: b.plan,
    status: b.status,
    revenue: formatCurrency(revenueMap.get(b.id.toString()) ?? 0),
  }));
}

type CreateBusinessInput = {
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
};

export async function createBusinessAction(input: CreateBusinessInput) {
  try {
    if (!input.name?.trim() || !input.owner?.trim() || !input.email?.trim()) {
      return { success: false, message: "Name, owner and email are required." };
    }

    const existing = await prisma.business.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      return { success: false, message: "A business with this email already exists." };
    }

    const created = await prisma.business.create({
      data: {
        businessName: input.name.trim(),
        ownerName: input.owner.trim(),
        email: input.email.trim(),
        businessPhone: input.phone?.trim() || null,
        logoUrl: input.logo || "🍽️",
        plan: input.plan || "Basic",
        status: input.status || "Pending",
      },
    });

    await logEvent({
      event: "Business Created",
      module: "Businesses",
      status: "Success",
      business: created.businessName,
      details: `Owner: ${created.ownerName ?? "—"} · Plan: ${created.plan}`,
    });

    revalidatePath("/superadmin/businesses");
    return { success: true, message: "Business created." };
  } catch (err) {
    console.error("createBusinessAction error:", err);
    return { success: false, message: "Failed to create business." };
  }
}

type UpdateBusinessInput = Partial<{
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
}>;

// Statuses whose change is security/business-critical enough to flag as a warning.
const SENSITIVE_STATUSES = new Set(["Suspended", "Rejected", "Banned"]);

export async function updateBusinessAction(id: number, input: UpdateBusinessInput) {
  try {
    if (!id) {
      return { success: false, message: "Missing business id." };
    }

    // Fetch the current row first so we can tell whether status actually
    // changed, and still know the business name if something goes wrong.
    const before = await prisma.business.findUnique({
      where: { id: BigInt(id) },
      select: { businessName: true, status: true },
    });

    const updated = await prisma.business.update({
      where: { id: BigInt(id) },
      data: {
        ...(input.name !== undefined && { businessName: input.name.trim() }),
        ...(input.owner !== undefined && { ownerName: input.owner.trim() }),
        ...(input.email !== undefined && { email: input.email.trim() }),
        ...(input.phone !== undefined && { businessPhone: input.phone.trim() }),
        ...(input.logo !== undefined && { logoUrl: input.logo }),
        ...(input.plan !== undefined && { plan: input.plan }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });

    const statusChanged = input.status !== undefined && before && input.status !== before.status;

    if (statusChanged) {
      await logEvent({
        event: `Business Status: ${before!.status} → ${input.status}`,
        module: "Businesses",
        level: SENSITIVE_STATUSES.has(input.status!) ? "Warning" : "Info",
        status: "Completed",
        business: updated.businessName,
        isSecurityEvent: SENSITIVE_STATUSES.has(input.status!),
      });
    } else {
      await logEvent({
        event: "Business Updated",
        module: "Businesses",
        status: "Success",
        business: updated.businessName,
      });
    }

    revalidatePath("/superadmin/businesses");
    return { success: true, message: "Business updated." };
  } catch (err: unknown) {
    console.error("updateBusinessAction error:", err);
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return { success: false, message: "Another business already uses this email." };
    }
    return { success: false, message: "Failed to update business." };
  }
}

export async function deleteBusinessAction(id: number) {
  try {
    if (!id) {
      return { success: false, message: "Missing business id." };
    }

    // Grab the name before deleting — it's gone once the row is removed.
    const existing = await prisma.business.findUnique({
      where: { id: BigInt(id) },
      select: { businessName: true },
    });

    await prisma.business.delete({ where: { id: BigInt(id) } });

    await logEvent({
      event: "Business Deleted",
      module: "Businesses",
      level: "Warning",
      status: "Completed",
      business: existing?.businessName,
      isSecurityEvent: true,
    });

    revalidatePath("/superadmin/businesses");
    return { success: true, message: "Business deleted." };
  } catch (err) {
    console.error("deleteBusinessAction error:", err);
    return { success: false, message: "Failed to delete business." };
  }
}