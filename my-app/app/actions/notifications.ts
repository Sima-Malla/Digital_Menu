"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  getBusinessNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

export async function getLiveNotificationsAction() {
  const session = await getSession();
  if (!session?.businessId) {
    return { notifications: [], unreadCount: 0 };
  }

  const role = session.role === "staff" ? "staff" : "admin";
  return await getBusinessNotifications(BigInt(session.businessId), role);
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await getSession();
  if (!session?.businessId) return { success: false };

  const success = await markNotificationRead(BigInt(session.businessId), BigInt(notificationId));
  return { success };
}

export async function clearAllNotificationsAction() {
  const session = await getSession();
  if (!session?.businessId) return { success: false };

  const success = await markAllNotificationsRead(BigInt(session.businessId));
  return { success };
}
