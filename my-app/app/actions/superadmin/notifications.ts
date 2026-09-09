"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/log-event";

const PATH = "/settings/notifications";

const DEFAULT_TEMPLATES = [
  { templateKey: "welcome", name: "Welcome Email", description: "Sent when a new business or staff account is created." },
  { templateKey: "order", name: "Order Confirmation", description: "Sent to customers when their order is placed." },
  { templateKey: "reset", name: "Password Reset", description: "Sent when a user requests a password reset link." },
  { templateKey: "suspend", name: "Account Suspended", description: "Sent when a business account is suspended." },
];

// ---------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------

export type EmailTemplate = {
  id: string;
  templateKey: string;
  name: string;
  description: string;
  enabled: boolean;
};

async function ensureTemplates() {
  const existing = await prisma.notificationTemplate.findMany();
  if (existing.length > 0) return existing;
  await prisma.notificationTemplate.createMany({ data: DEFAULT_TEMPLATES });
  return prisma.notificationTemplate.findMany();
}

export async function getNotificationTemplates(): Promise<EmailTemplate[]> {
  const rows = await ensureTemplates();
  const order = DEFAULT_TEMPLATES.map((t) => t.templateKey);

  return rows
    .sort((a, b) => order.indexOf(a.templateKey) - order.indexOf(b.templateKey))
    .map((t) => ({
      id: t.id.toString(),
      templateKey: t.templateKey,
      name: t.name,
      description: t.description,
      enabled: t.enabled,
    }));
}

export async function toggleTemplateAction(templateKey: string, enabled: boolean) {
  try {
    await prisma.notificationTemplate.update({
      where: { templateKey },
      data: { enabled },
    });

    await logEvent({
      event: `Email Template ${enabled ? "Enabled" : "Disabled"}: ${templateKey}`,
      module: "Notifications",
      status: "Success",
    });

    revalidatePath(PATH);
    return { success: true };
  } catch (err) {
    console.error("toggleTemplateAction error:", err);
    return { success: false, message: "Could not update template. Please try again." };
  }
}

// ---------------------------------------------------------------------
// Admin Alerts (trimmed: thresholds + notify-via-email only)
// ---------------------------------------------------------------------

export type NotificationSettingsData = {
  errorSpikeThreshold: number; // "System Errors"
  refundRateThreshold: number; // "High Refund Rate"
  failedPaymentThreshold: number; // "Failed Payments"
  alertViaEmail: boolean; // "Notify via Email"
};

export async function getNotificationSettings(): Promise<NotificationSettingsData> {
  const row = await prisma.notificationSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return {
    errorSpikeThreshold: row.errorSpikeThreshold,
    refundRateThreshold: row.refundRateThreshold,
    failedPaymentThreshold: row.failedPaymentThreshold,
    alertViaEmail: row.alertViaEmail,
  };
}

export async function updateNotificationSettingsAction(data: NotificationSettingsData) {
  try {
    await prisma.notificationSettings.upsert({
      where: { id: 1 },
      update: {
        errorSpikeThreshold: data.errorSpikeThreshold,
        refundRateThreshold: data.refundRateThreshold,
        failedPaymentThreshold: data.failedPaymentThreshold,
        alertViaEmail: data.alertViaEmail,
      },
      create: { id: 1, ...data },
    });

    await logEvent({
      event: "Admin Alert Settings Updated",
      module: "Notifications",
      status: "Success",
    });

    revalidatePath(PATH);
    return { success: true };
  } catch (err) {
    console.error("updateNotificationSettingsAction error:", err);
    return { success: false, message: "Could not save settings. Please try again." };
  }
}

// ---------------------------------------------------------------------
// SuperAdmin In-App Notifications
// ---------------------------------------------------------------------

import {
  getSuperAdminNotifications,
  markSuperAdminNotificationRead,
  markAllSuperAdminNotificationsRead,
} from "@/lib/superadmin-notifications";

export async function getSuperAdminLiveNotificationsAction() {
  return await getSuperAdminNotifications();
}

export async function markSuperAdminNotificationReadAction(notificationId: string) {
  const success = await markSuperAdminNotificationRead(BigInt(notificationId));
  return { success };
}

export async function clearAllSuperAdminNotificationsAction() {
  const success = await markAllSuperAdminNotificationsRead();
  return { success };
}

