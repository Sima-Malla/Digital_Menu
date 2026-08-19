"use server";

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
  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) return null;
  return BigInt(session.businessId);
}

export type OrderType = "Dine-in" | "Room Service" | "Pickup" | "Delivery";
export type OrderStatus = "New" | "Preparing" | "Ready" | "Delayed" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Unpaid" | "Billed to Room";

export type OrderRow = {
  id: string;
  type: OrderType;
  guest: string;
  items: string;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
  time: string;
};

function toDisplayOrderType(orderType: string, locationType?: string | null): OrderType {
  if (orderType === "pickup") return "Pickup";
  if (orderType === "delivery") return "Delivery";
  // dine-in: distinguish room-service (location.type === "room") from table dine-in
  if (locationType === "room") return "Room Service";
  return "Dine-in";
}

function toDisplayStatus(status: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    new: "New",
    preparing: "Preparing",
    ready: "Ready",
    delayed: "Delayed",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] ?? "New";
}

function toDisplayPayment(paymentStatus: string, locationType?: string | null): PaymentStatus {
  if (paymentStatus === "paid") return "Paid";
  if (locationType === "room") return "Billed to Room";
  return "Unpaid";
}

function formatTime(date: Date): string {
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type StaffOrdersFilters = {
  search: string;
  type: string; // "All Types" | "Dine-in" | "Room Service" | ...
  status: string; // "All Status" | "New" | ...
  payment: string; // "All Payments" | "Paid" | ...
  page: number;
  pageSize: number;
};

export async function getStaffOrders(
  filters: StaffOrdersFilters
): Promise<{ rows: OrderRow[]; total: number }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { rows: [], total: 0 };

  const { search, type, status, payment, page, pageSize } = filters;

  const where: Record<string, unknown> = { businessId };

  if (status !== "All Status") {
    const reverseStatusMap: Record<string, string> = {
      New: "new",
      Preparing: "preparing",
      Ready: "ready",
      Delayed: "delayed",
      Completed: "completed",
      Cancelled: "cancelled",
    };
    where.status = reverseStatusMap[status] ?? status.toLowerCase();
  }

  if (payment !== "All Payments" && payment !== "Billed to Room") {
    where.paymentStatus = payment.toLowerCase();
  }

  if (type === "Pickup") where.orderType = "pickup";
  if (type === "Delivery") where.orderType = "delivery";
  // "Dine-in" / "Room Service" both map to orderType "dine-in" in the DB —
  // distinguished only by Location.type — so they're filtered client-side below.

  if (search.trim()) {
    where.OR = [
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { phone: { contains: search, mode: "insensitive" } } },
      { location: { label: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Fetch a superset when a room/table distinction or "Billed to Room" filter is
  // active, since that split isn't a raw column — then filter/paginate in memory.
  const needsPostFilter =
    type === "Dine-in" || type === "Room Service" || payment === "Billed to Room";

  const orders = await prisma.order.findMany({
    where,
    include: { customer: true, location: true },
    orderBy: { orderedAt: "desc" },
    ...(needsPostFilter ? {} : { skip: (page - 1) * pageSize, take: pageSize }),
  });

  let mapped: OrderRow[] = orders.map((o) => {
    const locationType = o.location?.type ?? null;
    return {
      id: o.id.toString(),
      type: toDisplayOrderType(o.orderType, locationType),
      guest: o.location?.label ?? o.customer.name,
      items: "", // filled in below via a second query only when needed for display
      total: Number(o.totalAmount),
      payment: toDisplayPayment(o.paymentStatus, locationType),
      status: toDisplayStatus(o.status),
      time: formatTime(o.orderedAt),
    };
  });

  if (needsPostFilter) {
    if (type === "Dine-in") mapped = mapped.filter((o) => o.type === "Dine-in");
    if (type === "Room Service") mapped = mapped.filter((o) => o.type === "Room Service");
    if (payment === "Billed to Room") mapped = mapped.filter((o) => o.payment === "Billed to Room");
  }

  const total = needsPostFilter ? mapped.length : await prisma.order.count({ where });

  const pageRows = needsPostFilter
    ? mapped.slice((page - 1) * pageSize, page * pageSize)
    : mapped;

  // Fill in item summaries only for the rows actually being displayed.
  const orderIds = pageRows.map((r) => BigInt(r.id));
  const items = orderIds.length
    ? await prisma.orderItem.findMany({
        where: { orderId: { in: orderIds } },
        select: { orderId: true, name: true, quantity: true },
      })
    : [];

  const itemsByOrder = new Map<string, string[]>();
  for (const it of items) {
    const key = it.orderId.toString();
    const list = itemsByOrder.get(key) ?? [];
    list.push(`${it.quantity}x ${it.name}`);
    itemsByOrder.set(key, list);
  }

  const rows = pageRows.map((r) => ({
    ...r,
    items: (itemsByOrder.get(r.id) ?? []).join(", ") || "—",
  }));

  return { rows, total };
}