"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  getOrCreateNotificationPreference,
  updateNotificationPreference,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/notifications";

const NOTIFICATIONS_PATH = "/setting/notifications";

export async function getAdminNotificationPreferencesAction(): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.businessId) {
    return { success: false, error: "Not authenticated. Please log in." };
  }

  try {
    const preferences = await getOrCreateNotificationPreference(BigInt(session.businessId));
    return { success: true, data: preferences };
  } catch (err) {
    console.error("Failed to load notification preferences:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load preferences.",
    };
  }
}

export async function saveAdminNotificationPreferencesAction(
  data: NotificationPreferences
): Promise<{ success: boolean; data?: NotificationPreferences; error?: string }> {
  const session = await getSession();
  if (!session?.businessId) {
    return { success: false, error: "Not authenticated. Please log in." };
  }

  try {
    const updated = await updateNotificationPreference(BigInt(session.businessId), data);
    revalidatePath(NOTIFICATIONS_PATH);
    return { success: true, data: updated };
  } catch (err) {
    console.error("Failed to save notification preferences:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save preferences.",
    };
  }
}

export async function resetAdminNotificationPreferencesAction(): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.businessId) {
    return { success: false, error: "Not authenticated. Please log in." };
  }

  try {
    const updated = await updateNotificationPreference(
      BigInt(session.businessId),
      DEFAULT_NOTIFICATION_PREFERENCES
    );
    revalidatePath(NOTIFICATIONS_PATH);
    return { success: true, data: updated };
  } catch (err) {
    console.error("Failed to reset notification preferences:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reset preferences.",
    };
  }
}
