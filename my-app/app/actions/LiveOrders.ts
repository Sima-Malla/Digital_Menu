// app/(orders)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma, findOrder, updateOrderStatus } from "@/lib/orders";

import { createBusinessNotification } from "@/lib/notifications";

function revalidateOrderPaths() {
  revalidatePath("/live-orders");
  revalidatePath("/sorder");
  revalidatePath("/staffdashboard");
  revalidatePath("/orders");
  revalidatePath("/allorders");
  revalidatePath("/dashboard");
}

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

  await createBusinessNotification({
    businessId,
    type: "order_update",
    title: `Order Tracking #${id}`,
    message: `Order #${id} status changed to Preparing. Kitchen is processing the order.`,
    target: "all",
    orderId: id,
  });

  revalidateOrderPaths();
  return { success: true };
}

export async function markAsReady(orderId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const id = BigInt(orderId);
  const order = await findOrder(businessId, id);
  if (!order) return { success: false, error: "Order not found" };

  await updateOrderStatus(id, "ready");

  await createBusinessNotification({
    businessId,
    type: "order_update",
    title: `Order Tracking #${id}`,
    message: `Order #${id} is Ready! Prepared and waiting for pickup/delivery.`,
    target: "all",
    orderId: id,
  });

  revalidateOrderPaths();
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

  // Trigger tracking notification
  await createBusinessNotification({
    businessId,
    type: "order_update",
    title: `Order Completed #${id}`,
    message: `Order #${id} has been completed.`,
    target: "all",
    orderId: id,
  });

  // Trigger payment notification
  await createBusinessNotification({
    businessId,
    type: "payment",
    title: `Payment Received #${id}`,
    message: `Payment of NPR ${Number(order.totalAmount).toLocaleString()} for Order #${id} was marked as Paid.`,
    target: "all",
    orderId: id,
  });

  revalidateOrderPaths();
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

  await createBusinessNotification({
    businessId,
    type: "order_update",
    title: `Order Escalated #${id}`,
    message: `Order #${id} has been escalated and requires immediate attention!`,
    target: "all",
    orderId: id,
  });

  revalidateOrderPaths();
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

  await createBusinessNotification({
    businessId,
    type: "order_update",
    title: `Guest Notified #${id}`,
    message: `Customer notification sent for Order #${id}.`,
    target: "all",
    orderId: id,
  });

  revalidateOrderPaths();
  return { success: true };
}