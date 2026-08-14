// lib/orders.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "delayed";

export type UIOrderItem = { name: string; price: string };

export type Order = {
  id: string; // BigInt as a string, so it round-trips cleanly through client components
  meta: string;
  tag: "PICKUP" | "DELIVERY" | "KITCHEN";
  items: UIOrderItem[];
  heading?: string;
  customer?: string;
  note?: string;
  issue?: string;
  escalated: boolean;
};

function tagFromOrderType(orderType: string): Order["tag"] {
  if (orderType === "pickup") return "PICKUP";
  if (orderType === "delivery") return "DELIVERY";
  return "KITCHEN"; // dine-in
}

function minutesAgo(date: Date): number {
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
}

function toUIOrder(order: {
  id: bigint;
  orderType: string;
  orderedAt: Date;
  delayReason: string | null;
  paymentStatus: string;
  escalated?: boolean | null;
  items: { name: string; unitPrice: unknown; quantity: number }[];
  customer: { name: string } | null;
  location: { label: string } | null;
}): Order {
  const mins = minutesAgo(order.orderedAt);
  const locationLabel = order.location?.label;

  return {
    id: order.id.toString(),
    meta: locationLabel
      ? `${locationLabel} • ${mins} min${mins === 1 ? "" : "s"} ago`
      : `${mins} min${mins === 1 ? "" : "s"} ago`,
    tag: tagFromOrderType(order.orderType),
    items: order.items.map((item) => ({
      name: `${item.name} ×${item.quantity}`,
      price: `Rs. ${(Number(item.unitPrice) * item.quantity).toFixed(2)}`,
    })),
    heading: locationLabel,
    customer: order.customer?.name,
    note: order.paymentStatus === "unpaid" ? "Payment pending" : "Paid",
    issue: order.delayReason ?? undefined,
    escalated: order.escalated ?? false,
  };
}

export async function getOrdersByStatus(
  businessId: bigint,
  status: OrderStatus
): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { businessId, status },
    include: { items: true, customer: true, location: true },
    orderBy: { orderedAt: "desc" },
  });

  return orders.map(toUIOrder);
}

export async function findOrder(businessId: bigint, orderId: bigint) {
  return prisma.order.findFirst({
    where: { id: orderId, businessId },
  });
}

export async function updateOrderStatus(
  orderId: bigint,
  status: OrderStatus
) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}