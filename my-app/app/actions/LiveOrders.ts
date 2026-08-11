// app/(orders)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus, removeOrder, findOrder } from "@/lib/orders";

// Change these paths to match your actual route.
const ORDERS_PATH = "/orders";

export async function acceptOrder(orderId: string) {
  const order = findOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };

  updateOrderStatus(orderId, "preparing");
  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function markAsReady(orderId: string) {
  const order = findOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };

  updateOrderStatus(orderId, "ready");
  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function completeOrder(orderId: string) {
  const order = findOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };

  removeOrder(orderId);
  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function escalateOrder(orderId: string) {
  const order = findOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };

  // e.g. flag a manager / send an alert — plug in real logic here
  console.log(`Escalated ${orderId}`);
  revalidatePath(ORDERS_PATH);
  return { success: true };
}

export async function notifyGuest(orderId: string) {
  const order = findOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };

  // e.g. send SMS/push notification — plug in real logic here
  console.log(`Notified guest for ${orderId}`);
  return { success: true };
}