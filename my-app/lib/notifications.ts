import { prisma } from "@/lib/prisma";

export type NotificationPreferences = {
  emailChannel: boolean;
  smsChannel: boolean;
  pushChannel: boolean;

  newOrders: boolean;
  orderUpdates: boolean;
  customerReviews: boolean;
  staffActivity: boolean;
  promotions: boolean;
  systemAlerts: boolean;

  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;

  contactEmail: string;
  contactPhone: string;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailChannel: true,
  smsChannel: false,
  pushChannel: true,

  newOrders: true,
  orderUpdates: true,
  customerReviews: true,
  staffActivity: true,
  promotions: false,
  systemAlerts: true,

  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",

  contactEmail: "admin@restaurant.com",
  contactPhone: "+1 (555) 012-3456",
};

/**
 * Gets or creates notification preferences for a business.
 */
export async function getOrCreateNotificationPreference(businessId: bigint): Promise<NotificationPreferences> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { email: true, businessPhone: true },
  }).catch(() => null);

  const existing = await prisma.businessNotificationPreference.findUnique({
    where: { businessId },
  });

  if (existing) {
    return {
      emailChannel: existing.emailChannel,
      smsChannel: existing.smsChannel,
      pushChannel: existing.pushChannel,

      newOrders: existing.newOrders,
      orderUpdates: existing.orderUpdates,
      customerReviews: existing.customerReviews,
      staffActivity: existing.staffActivity,
      promotions: existing.promotions,
      systemAlerts: existing.systemAlerts,

      quietHoursEnabled: existing.quietHoursEnabled,
      quietHoursStart: existing.quietHoursStart,
      quietHoursEnd: existing.quietHoursEnd,

      contactEmail: existing.contactEmail || business?.email || DEFAULT_NOTIFICATION_PREFERENCES.contactEmail,
      contactPhone: existing.contactPhone || business?.businessPhone || DEFAULT_NOTIFICATION_PREFERENCES.contactPhone,
    };
  }

  const created = await prisma.businessNotificationPreference.create({
    data: {
      businessId,
      emailChannel: DEFAULT_NOTIFICATION_PREFERENCES.emailChannel,
      smsChannel: DEFAULT_NOTIFICATION_PREFERENCES.smsChannel,
      pushChannel: DEFAULT_NOTIFICATION_PREFERENCES.pushChannel,

      newOrders: DEFAULT_NOTIFICATION_PREFERENCES.newOrders,
      orderUpdates: DEFAULT_NOTIFICATION_PREFERENCES.orderUpdates,
      customerReviews: DEFAULT_NOTIFICATION_PREFERENCES.customerReviews,
      staffActivity: DEFAULT_NOTIFICATION_PREFERENCES.staffActivity,
      promotions: DEFAULT_NOTIFICATION_PREFERENCES.promotions,
      systemAlerts: DEFAULT_NOTIFICATION_PREFERENCES.systemAlerts,

      quietHoursEnabled: DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnabled,
      quietHoursStart: DEFAULT_NOTIFICATION_PREFERENCES.quietHoursStart,
      quietHoursEnd: DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnd,

      contactEmail: business?.email || DEFAULT_NOTIFICATION_PREFERENCES.contactEmail,
      contactPhone: business?.businessPhone || DEFAULT_NOTIFICATION_PREFERENCES.contactPhone,
    },
  });

  return {
    emailChannel: created.emailChannel,
    smsChannel: created.smsChannel,
    pushChannel: created.pushChannel,

    newOrders: created.newOrders,
    orderUpdates: created.orderUpdates,
    customerReviews: created.customerReviews,
    staffActivity: created.staffActivity,
    promotions: created.promotions,
    systemAlerts: created.systemAlerts,

    quietHoursEnabled: created.quietHoursEnabled,
    quietHoursStart: created.quietHoursStart,
    quietHoursEnd: created.quietHoursEnd,

    contactEmail: created.contactEmail || DEFAULT_NOTIFICATION_PREFERENCES.contactEmail,
    contactPhone: created.contactPhone || DEFAULT_NOTIFICATION_PREFERENCES.contactPhone,
  };
}

/**
 * Updates notification preferences for a business.
 */
export async function updateNotificationPreference(
  businessId: bigint,
  data: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const updated = await prisma.businessNotificationPreference.upsert({
    where: { businessId },
    update: {
      emailChannel: data.emailChannel,
      smsChannel: data.smsChannel,
      pushChannel: data.pushChannel,

      newOrders: data.newOrders,
      orderUpdates: data.orderUpdates,
      customerReviews: data.customerReviews,
      staffActivity: data.staffActivity,
      promotions: data.promotions,
      systemAlerts: data.systemAlerts,

      quietHoursEnabled: data.quietHoursEnabled,
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,

      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    },
    create: {
      businessId,
      emailChannel: data.emailChannel ?? DEFAULT_NOTIFICATION_PREFERENCES.emailChannel,
      smsChannel: data.smsChannel ?? DEFAULT_NOTIFICATION_PREFERENCES.smsChannel,
      pushChannel: data.pushChannel ?? DEFAULT_NOTIFICATION_PREFERENCES.pushChannel,

      newOrders: data.newOrders ?? DEFAULT_NOTIFICATION_PREFERENCES.newOrders,
      orderUpdates: data.orderUpdates ?? DEFAULT_NOTIFICATION_PREFERENCES.orderUpdates,
      customerReviews: data.customerReviews ?? DEFAULT_NOTIFICATION_PREFERENCES.customerReviews,
      staffActivity: data.staffActivity ?? DEFAULT_NOTIFICATION_PREFERENCES.staffActivity,
      promotions: data.promotions ?? DEFAULT_NOTIFICATION_PREFERENCES.promotions,
      systemAlerts: data.systemAlerts ?? DEFAULT_NOTIFICATION_PREFERENCES.systemAlerts,

      quietHoursEnabled: data.quietHoursEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnabled,
      quietHoursStart: data.quietHoursStart ?? DEFAULT_NOTIFICATION_PREFERENCES.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd ?? DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnd,

      contactEmail: data.contactEmail || DEFAULT_NOTIFICATION_PREFERENCES.contactEmail,
      contactPhone: data.contactPhone || DEFAULT_NOTIFICATION_PREFERENCES.contactPhone,
    },
  });

  return {
    emailChannel: updated.emailChannel,
    smsChannel: updated.smsChannel,
    pushChannel: updated.pushChannel,

    newOrders: updated.newOrders,
    orderUpdates: updated.orderUpdates,
    customerReviews: updated.customerReviews,
    staffActivity: updated.staffActivity,
    promotions: updated.promotions,
    systemAlerts: updated.systemAlerts,

    quietHoursEnabled: updated.quietHoursEnabled,
    quietHoursStart: updated.quietHoursStart,
    quietHoursEnd: updated.quietHoursEnd,

    contactEmail: updated.contactEmail || DEFAULT_NOTIFICATION_PREFERENCES.contactEmail,
    contactPhone: updated.contactPhone || DEFAULT_NOTIFICATION_PREFERENCES.contactPhone,
  };
}

export type NotificationType =
  | "new_order"
  | "order_update"
  | "payment"
  | "review"
  | "staff"
  | "system";

export type NotificationTarget = "admin" | "staff" | "all";

export async function createBusinessNotification({
  businessId,
  type,
  title,
  message,
  target = "all",
  orderId,
}: {
  businessId: bigint;
  type: NotificationType;
  title: string;
  message: string;
  target?: NotificationTarget;
  orderId?: bigint;
}) {
  try {
    const prefs = await getOrCreateNotificationPreference(businessId);

    // Check if the specific notification type is enabled
    if (type === "new_order" && !prefs.newOrders) return null;
    if (type === "order_update" && !prefs.orderUpdates) return null;
    if (type === "payment" && !prefs.orderUpdates) return null; // Payment is part of order updates/status
    if (type === "review" && !prefs.customerReviews) return null;
    if (type === "staff" && !prefs.staffActivity) return null;
    if (type === "system" && !prefs.systemAlerts) return null;

    // Create the notification record in DB
    const notification = await prisma.businessNotification.create({
      data: {
        businessId,
        type,
        title,
        message,
        target,
        orderId: orderId ?? null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create business notification:", error);
    return null;
  }
}

export async function getBusinessNotifications(
  businessId: bigint,
  targetRole: "admin" | "staff" | "all" = "all"
) {
  try {
    const notifications = await prisma.businessNotification.findMany({
      where: {
        businessId,
        OR: [
          { target: "all" },
          { target: targetRole },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.businessNotification.count({
      where: {
        businessId,
        isRead: false,
        OR: [
          { target: "all" },
          { target: targetRole },
        ],
      },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        target: n.target,
        orderId: n.orderId ? n.orderId.toString() : null,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch (error) {
    console.error("Failed to fetch business notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationRead(businessId: bigint, notificationId: bigint) {
  try {
    await prisma.businessNotification.updateMany({
      where: { id: notificationId, businessId },
      data: { isRead: true },
    });
    return true;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

export async function markAllNotificationsRead(businessId: bigint) {
  try {
    await prisma.businessNotification.updateMany({
      where: { businessId, isRead: false },
      data: { isRead: true },
    });
    return true;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return false;
  }
}
