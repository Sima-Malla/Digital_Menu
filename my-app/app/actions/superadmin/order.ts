"use server";

// Adjust this import to wherever your Prisma client singleton lives.
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/log-event";

export type SuperadminOrder = {
  id: string;
  business: string;
  customer: string;
  customerPhone: string;
  orderType: string;
  amount: string;
  status: string;
  time: string;
};

export type Business = { id: string; name: string };
export type Stats = {
  totalOrders: number;
  grossRevenue: number;
  activeBusinesses: number;
  pendingIssues: number;
};

function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const VALID_STATUSES = ["new", "preparing", "ready", "completed", "delayed"];

type GetOrdersParams = {
  search?: string;
  status?: string;
  businessId?: string;
  page?: number;
  pageSize?: number;
};

export async function getOrders(
  params: GetOrdersParams = {}
): Promise<{ orders: SuperadminOrder[]; total: number }> {
  const { search, status, businessId, page = 1, pageSize = 10 } = params;

  const where: Record<string, unknown> = {};

  if (businessId) {
    try {
      where.businessId = BigInt(businessId);
    } catch {
      // ignore invalid id, returns empty results naturally via findMany
    }
  }

  if (status) where.status = status;

  if (search?.trim()) {
    const trimmed = search.trim();
    const idCandidate = trimmed.replace(/^#/, "");
    const isNumeric = /^\d+$/.test(idCandidate);

    where.OR = [
      { customer: { name: { contains: trimmed, mode: "insensitive" } } },
      { customer: { phone: { contains: trimmed, mode: "insensitive" } } },
      ...(isNumeric ? [{ id: BigInt(idCandidate) }] : []),
    ];
  }

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(100, pageSize));

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { business: true, customer: true },
      orderBy: { orderedAt: "desc" },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    prisma.order.count({ where }),
  ]);

  const orders: SuperadminOrder[] = rows.map((o) => ({
    id: o.id.toString(),
    business: o.business.businessName,
    customer: o.customer.name,
    customerPhone: o.customer.phone,
    orderType: o.orderType,
    amount: formatCurrency(Number(o.totalAmount)),
    status: o.status,
    time: formatTime(o.orderedAt),
  }));

  return { orders, total };
}

export async function getBusinesses(): Promise<Business[]> {
  const rows = await prisma.business.findMany({
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });
  return rows.map((b) => ({ id: b.id.toString(), name: b.businessName }));
}

export async function getStats(): Promise<Stats> {
  try {
    const [totalOrders, revenueAgg, activeBusinesses, pendingIssues] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { notIn: ["cancelled", "Cancelled", "rejected", "Rejected"] } },
      }),
      prisma.business.count({ where: { status: "Active" } }),
      prisma.order.count({
        where: { OR: [{ status: "delayed" }, { escalated: true }] },
      }),
    ]);

    return {
      totalOrders,
      grossRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
      activeBusinesses,
      pendingIssues,
    };
  } catch (error) {
    console.error("Failed to load order stats:", error);
    return {
      totalOrders: 0,
      grossRevenue: 0,
      activeBusinesses: 0,
      pendingIssues: 0,
    };
  }
}

export async function getOrderDetail(id: string) {
  let orderId: bigint;
  try {
    orderId = BigInt(id);
  } catch {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      business: true,
      customer: true,
      location: true,
      items: true,
    },
  });

  if (!order) return null;

  return {
    id: order.id.toString(),
    business: order.business.businessName,
    customer: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email ?? "—",
    location: order.location?.label ?? "—",
    orderType: order.orderType,
    paymentStatus: order.paymentStatus,
    status: order.status,
    delayReason: order.delayReason ?? "",
    items: order.items.map((it) => ({
      quantity: it.quantity,
      name: it.name,
      notes: it.notes ?? undefined,
      unitPrice: formatCurrency(Number(it.unitPrice)),
    })),
    totalAmount: formatCurrency(Number(order.totalAmount)),
  };
}

type UpdateOrderInput = {
  status: string;
  paymentStatus: string;
  delayReason: string;
};

export async function updateOrderAction(id: string, input: UpdateOrderInput) {
  try {
    let orderId: bigint;
    try {
      orderId = BigInt(id);
    } catch {
      return { success: false, message: "Invalid order id." };
    }

    if (!VALID_STATUSES.includes(input.status)) {
      return { success: false, message: "Invalid status." };
    }
    if (!["paid", "unpaid"].includes(input.paymentStatus)) {
      return { success: false, message: "Invalid payment status." };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
        paymentStatus: input.paymentStatus,
        delayReason: input.status === "delayed" ? input.delayReason?.trim() || null : null,
        escalated: input.status === "delayed",
      },
      include: { business: true },
    });

    await logEvent({
      event: `Order #${id} → ${input.status}`,
      module: "Orders",
      level: input.status === "delayed" ? "Warning" : "Info",
      status: "Completed",
      business: updated.business.businessName,
      details: `Payment: ${input.paymentStatus}${input.delayReason ? ` · Delay reason: ${input.delayReason}` : ""}`,
    });

    revalidatePath("/orders");
    return { success: true, message: "Order updated." };
  } catch (err) {
    console.error("updateOrderAction error:", err);
    return { success: false, message: "Failed to update order." };
  }
}

export async function deleteOrder(id: string) {
  try {
    let orderId: bigint;
    try {
      orderId = BigInt(id);
    } catch {
      return { success: false, message: "Invalid order id." };
    }

    // Fetch business name before deleting — it's gone once the row is removed.
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });

    await prisma.order.delete({ where: { id: orderId } });

    await logEvent({
      event: `Order #${id} Deleted`,
      module: "Orders",
      level: "Warning",
      status: "Completed",
      business: existing?.business.businessName,
    });

    revalidatePath("/orders");
    return { success: true, message: "Order deleted." };
  } catch (err) {
    console.error("deleteOrder error:", err);
    return { success: false, message: "Failed to delete order." };
  }
}

export async function exportOrdersAction(params: {
  search?: string;
  status?: string;
  businessId?: string;
}) {
  try {
    const { search, status, businessId } = params;
    const where: Record<string, unknown> = {};

    if (businessId) {
      try {
        where.businessId = BigInt(businessId);
      } catch {
        // ignore
      }
    }
    if (status) where.status = status;

    if (search?.trim()) {
      const trimmed = search.trim();
      const idCandidate = trimmed.replace(/^#/, "");
      const isNumeric = /^\d+$/.test(idCandidate);

      where.OR = [
        { customer: { name: { contains: trimmed, mode: "insensitive" } } },
        { customer: { phone: { contains: trimmed, mode: "insensitive" } } },
        ...(isNumeric ? [{ id: BigInt(idCandidate) }] : []),
      ];
    }

    const rows = await prisma.order.findMany({
      where,
      include: { business: true, customer: true, location: true },
      orderBy: { orderedAt: "desc" },
      take: 5000,
    });

    return rows.map((o) => ({
      id: o.id.toString(),
      business: o.business.businessName,
      customer: o.customer.name,
      customerPhone: o.customer.phone,
      location: o.location?.label ?? "—",
      orderType: o.orderType,
      amount: Number(o.totalAmount),
      status: o.status,
      paymentStatus: o.paymentStatus,
      orderedAt: o.orderedAt.toISOString(),
    }));
  } catch (err) {
    console.error("exportOrdersAction error:", err);
    return [];
  }
}