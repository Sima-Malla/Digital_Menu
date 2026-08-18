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

const ALLOWED_ROLES = ["owner", "manager", "staff"];

async function requireBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) return null;
  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  return staff?.businessId ?? null;
}

export type AdminOrder = {
  id: string;
  customer: string;
  customerPhone: string;
  orderType: string;
  amount: string;
  status: string;
  time: string;
};

export type AdminOrderDetail = {
  id: string;
  customer: string;
  customerPhone: string;
  customerEmail: string;
  location: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  delayReason: string;
  totalAmount: string;
  orderedAt: string;
  businessName: string;
  businessAddress: string;
  items: { name: string; quantity: number; unitPrice: string; subtotal: string; notes: string | null }[];
};

function formatMoney(value: unknown): string {
  return `Rs. ${Number(value).toFixed(2)}`;
}

function relativeTime(date: Date): string {
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export async function getAdminOrders(params: {
  search: string;
  status: string;
  page: number;
  pageSize: number;
}): Promise<{ orders: AdminOrder[]; total: number }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { orders: [], total: 0 };

  const { search, status, page, pageSize } = params;

  const where = {
    businessId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { customer: { phone: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: true },
      orderBy: { orderedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: rows.map((o) => ({
      id: o.id.toString(),
      customer: o.customer.name,
      customerPhone: o.customer.phone,
      orderType: o.orderType,
      amount: formatMoney(o.totalAmount),
      status: o.status,
      time: relativeTime(o.orderedAt),
    })),
    total,
  };
}

export async function getAdminOrderStats(): Promise<{
  totalOrders: number;
  grossRevenue: number;
  activeOrders: number;
  delayedOrders: number;
}> {
  const businessId = await requireBusinessId();
  if (!businessId) return { totalOrders: 0, grossRevenue: 0, activeOrders: 0, delayedOrders: 0 };

  const [totalOrders, revenueAgg, activeOrders, delayedOrders] = await Promise.all([
    prisma.order.count({ where: { businessId } }),
    prisma.order.aggregate({ where: { businessId, status: "completed" }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { businessId, status: { in: ["new", "preparing", "ready"] } } }),
    prisma.order.count({ where: { businessId, status: "delayed" } }),
  ]);

  return {
    totalOrders,
    grossRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    activeOrders,
    delayedOrders,
  };
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  const businessId = await requireBusinessId();
  if (!businessId) return null;

  const order = await prisma.order.findFirst({
    where: { id: BigInt(id), businessId },
    include: { customer: true, location: true, items: true, business: true },
  });

  if (!order) return null;

  return {
    id: order.id.toString(),
    customer: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email ?? "—",
    location: order.location?.label ?? "—",
    orderType: order.orderType,
    status: order.status,
    paymentStatus: order.paymentStatus,
    delayReason: order.delayReason ?? "",
    totalAmount: formatMoney(order.totalAmount),
    orderedAt: order.orderedAt.toLocaleString(),
    businessName: order.business.businessName,
    businessAddress: order.business.businessAddress ?? "",
    items: order.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPrice: formatMoney(it.unitPrice),
      subtotal: formatMoney(Number(it.unitPrice) * it.quantity),
      notes: it.notes,
    })),
  };
}

export async function updateAdminOrderAction(
  id: string,
  data: { status: string; paymentStatus: string; delayReason: string }
): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  const existing = await prisma.order.findFirst({ where: { id: BigInt(id), businessId } });
  if (!existing) return { success: false, message: "Order not found" };

  await prisma.order.update({
    where: { id: BigInt(id) },
    data: {
      status: data.status,
      paymentStatus: data.paymentStatus,
      delayReason: data.status === "delayed" ? data.delayReason : null,
    },
  });

  revalidatePath("/orders");
  return { success: true };
}

export async function deleteAdminOrder(id: string): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  const existing = await prisma.order.findFirst({ where: { id: BigInt(id), businessId } });
  if (!existing) return { success: false, message: "Order not found" };

  await prisma.order.delete({ where: { id: BigInt(id) } });

  revalidatePath("/orders");
  return { success: true };
}