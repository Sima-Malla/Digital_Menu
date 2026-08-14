// app/(orders)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma, findOrder, updateOrderStatus } from "@/lib/orders";

const ORDERS_PATH = "/orders"; // update to match your actual route

async function requireBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session?.businessId) return null;
  return BigInt(session.businessId);
}

export async function acceptOrder(orderId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const id = BigInt(orderId);
  const order = await findOrder(businessId, id);
  if (!order) return { success: false, error: "Order not found" };

  await updateOrderStatus(id, "preparing");
  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function markAsReady(orderId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const id = BigInt(orderId);
  const order = await findOrder(businessId, id);
  if (!order) return { success: false, error: "Order not found" };

  await updateOrderStatus(id, "ready");
  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function completeOrder(orderId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const id = BigInt(orderId);
  const order = await findOrder(businessId, id);
  if (!order) return { success: false, error: "Order not found" };

  // Orders are kept as history, never deleted — "completed" is a real
  // terminal status, not a removal from the table.
  await prisma.order.update({
    where: { id },
    data: { status: "completed", paymentStatus: "paid" },
  });

  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function escalateOrder(orderId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const id = BigInt(orderId);
  const order = await findOrder(businessId, id);
  if (!order) return { success: false, error: "Order not found" };

  await prisma.order.update({
    where: { id },
    data: { escalated: true },
  });

  await prisma.systemLog.create({
    data: {
      event: `Order #${id} escalated`,
      module: "Orders",
      level: "Warning",
      status: "Completed",
    },
  });

  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function notifyGuest(orderId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const id = BigInt(orderId);
  const order = await findOrder(businessId, id);
  if (!order) return { success: false, error: "Order not found" };

  await prisma.order.update({
    where: { id },
    data: { notifiedAt: new Date() },
  });

  // Plug in a real SMS/push notification provider here.
  return { success: true };
}