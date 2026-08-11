// app/actions/order.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function timeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export type SuperadminOrder = {
  id: string;
  businessId: string;
  business: string;
  customer: string;
  customerPhone: string;
  orderType: string;
  amount: string;
  status: string;
  paymentStatus: string;
  time: string;
};

type GetOrdersParams = {
  search?: string;
  status?: string;
  businessId?: string;
  page?: number;
  pageSize?: number;
};

export async function getOrders({
  search = "",
  status = "",
  businessId = "",
  page = 1,
  pageSize = 10,
}: GetOrdersParams): Promise<{ orders: SuperadminOrder[]; total: number }> {
  const where: any = {};

  if (status) where.status = status;
  if (businessId) where.businessId = BigInt(businessId);

  if (search) {
    const conditions: any[] = [
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { phone: { contains: search, mode: "insensitive" } } },
    ];
    if (/^\d+$/.test(search.trim())) {
      conditions.push({ id: BigInt(search.trim()) });
    }
    where.OR = conditions;
  }

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        business: { select: { businessName: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { orderedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  const orders = rows.map((o) => ({
    id: o.id.toString(),
    businessId: o.businessId.toString(),
    business: o.business.businessName,
    customer: o.customer.name,
    customerPhone: o.customer.phone,
    orderType: o.orderType,
    amount: `$${Number(o.totalAmount).toFixed(2)}`,
    status: o.status,
    paymentStatus: o.paymentStatus,
    time: timeAgo(o.orderedAt),
  }));

  return { orders, total };
}

export async function getBusinesses() {
  const businesses = await prisma.business.findMany({
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });
  return businesses.map((b) => ({ id: b.id.toString(), name: b.businessName }));
}

export async function getStats() {
  const [totalOrders, revenueAgg, activeBusinesses, pendingIssues] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "paid" },
      }),
      prisma.business.count({ where: { needsOnboarding: false } }),
      prisma.order.count({
        where: { OR: [{ status: "delayed" }, { paymentStatus: "unpaid" }] },
      }),
    ]);

  return {
    totalOrders,
    grossRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    activeBusinesses,
    pendingIssues,
  };
}

export async function getOrderDetail(id: string) {
  const order = await prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: {
      business: { select: { businessName: true } },
      customer: { select: { name: true, phone: true, email: true } },
      location: { select: { label: true, type: true } },
      items: { select: { name: true, quantity: true, unitPrice: true, notes: true } },
    },
  });

  if (!order) return null;

  return {
    id: order.id.toString(),
    business: order.business.businessName,
    customer: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email ?? "-",
    location: order.location?.label ?? "-",
    orderType: order.orderType,
    status: order.status,
    paymentStatus: order.paymentStatus,
    delayReason: order.delayReason ?? "",
    totalAmount: `$${Number(order.totalAmount).toFixed(2)}`,
    time: timeAgo(order.orderedAt),
    items: order.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPrice: `$${Number(it.unitPrice).toFixed(2)}`,
      notes: it.notes ?? "",
    })),
  };
}

type UpdateOrderInput = {
  status: string;
  paymentStatus: string;
  delayReason?: string;
};

export async function updateOrderAction(id: string, data: UpdateOrderInput) {
  try {
    await prisma.order.update({
      where: { id: BigInt(id) },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus,
        delayReason: data.status === "delayed" ? data.delayReason || null : null,
      },
    });
    revalidatePath("/order");
    return { success: true, message: "Order updated." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to update order." };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id: BigInt(id) } });
    revalidatePath("/order");
    return { success: true, message: "Order deleted." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to delete order." };
  }
}