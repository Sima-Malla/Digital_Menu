"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Database Connection
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type OrderType = "Dine-in" | "Room Service";
export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "delayed";
export type PaymentStatus = "paid" | "unpaid" | "billed-to-room";

export interface LineItem {
  qty: number;
  name: string;
  price?: number;
  note?: string;
}

export interface Order {
  id: string;
  dbId: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdMinsAgo: number;
  items: LineItem[];
  guestOrTable?: string;
  roomNumber?: string;
  issue?: string;
}

export interface OrderRowData {
  id: string;
  type: "Dine-in" | "Room Service";
  guest: string;
  items: string;
  total: number;
  payment: "Paid" | "Unpaid" | "Billed to Room";
  status: "New" | "Preparing" | "Ready" | "Delayed" | "Completed" | "Cancelled";
  time: string;
}

/**
 * 1. Live Kitchen Orders (live-orders page को लागि)
 */
export async function getStaffOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["new", "preparing", "ready", "delayed"] },
      },
      include: {
        customer: true,
        location: true,
        items: true,
      },
      orderBy: { orderedAt: "desc" },
    });

    const now = new Date().getTime();

    return orders.map((order) => {
      const orderTime = new Date(order.orderedAt).getTime();
      const createdMinsAgo = Math.max(0, Math.floor((now - orderTime) / (1000 * 60)));

      let type: OrderType = "Dine-in";
      if (order.orderType === "room-service" || (order.location && order.location.type === "room-service")) {
        type = "Room Service";
      }

      const guestOrTable = order.location?.label || order.customer?.name || `Table #${order.id}`;
      const roomNumber = order.location?.label.toLowerCase().includes("room") ? order.location.label : undefined;

      return {
        id: `ORD-${order.id}`,
        dbId: order.id.toString(),
        type,
        status: (order.status as OrderStatus) || "new",
        paymentStatus: (order.paymentStatus as PaymentStatus) || "unpaid",
        createdMinsAgo,
        guestOrTable,
        roomNumber,
        issue: order.delayReason || undefined,
        items: order.items.map((item) => ({
          qty: item.quantity,
          name: item.name,
          price: Number(item.unitPrice),
          note: item.notes || undefined,
        })),
      };
    });
  } catch (error) {
    console.error("Failed to fetch staff orders:", error);
    return [];
  }
}

/**
 * 2. All Orders History (sorder page को लागि)
 */
export async function getAllStaffOrders(): Promise<OrderRowData[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        location: true,
        items: true,
      },
      orderBy: { orderedAt: "desc" },
    });

    return orders.map((order) => {
      let type: "Dine-in" | "Room Service" = "Dine-in";
      if (order.orderType === "room-service" || order.location?.type === "room-service") {
        type = "Room Service";
      }

      const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
      const guest = order.location?.label || order.customer?.name || `Table #${order.id}`;

      const statusMap: Record<string, OrderRowData["status"]> = {
        new: "New",
        preparing: "Preparing",
        ready: "Ready",
        delayed: "Delayed",
        completed: "Completed",
        cancelled: "Cancelled",
      };

      const paymentMap: Record<string, OrderRowData["payment"]> = {
        paid: "Paid",
        unpaid: "Unpaid",
        "billed-to-room": "Billed to Room",
      };

      const dateObj = new Date(order.orderedAt);
      const timeStr = dateObj.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: `ORD-${order.id}`,
        type,
        guest,
        items: itemsSummary || "No items",
        total: Number(order.totalAmount),
        payment: paymentMap[order.paymentStatus] || "Unpaid",
        status: statusMap[order.status] || "New",
        time: timeStr,
      };
    });
  } catch (error) {
    console.error("Failed to fetch all staff orders:", error);
    return [];
  }
}

/**
 * 3. Order Status Update गर्ने (New -> Preparing -> Ready -> Completed)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus, delayReason?: string) {
  try {
    const numericId = orderId.replace("ORD-", "");
    await prisma.order.update({
      where: { id: BigInt(numericId) },
      data: {
        status,
        ...(delayReason ? { delayReason } : {}),
      },
    });

    revalidatePath("/(staff)/live-orders");
    revalidatePath("/(staff)/sorder");
    revalidatePath("/(staff)/staffdashboard");
    return { success: true };
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    return { success: false };
  }
}

/**
 * 4. Payment Status Mark गर्ने (Unpaid -> Paid)
 */
export async function markOrderAsPaid(orderId: string) {
  try {
    const numericId = orderId.replace("ORD-", "");
    await prisma.order.update({
      where: { id: BigInt(numericId) },
      data: { paymentStatus: "paid" },
    });

    revalidatePath("/(staff)/live-orders");
    revalidatePath("/(staff)/sorder");
    return { success: true };
  } catch (error) {
    console.error(`Failed to mark payment for order ${orderId}:`, error);
    return { success: false };
  }
}