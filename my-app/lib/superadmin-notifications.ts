import { prisma } from "@/lib/prisma";

export type SuperAdminNotificationType =
  | "business_added"
  | "business_suspended"
  | "business_deleted"
  | "support_report"
  | "system_alert";

export async function createSuperAdminNotification({
  title,
  message,
  type,
}: {
  title: string;
  message: string;
  type: SuperAdminNotificationType;
}) {
  try {
    const notification = await prisma.superAdminNotification.create({
      data: {
        title,
        message,
        type,
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to create SuperAdmin notification:", error);
    return null;
  }
}

export async function getSuperAdminNotifications() {
  try {
    let notifications = await prisma.superAdminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (notifications.length === 0) {
      // Auto-create initial platform notifications if empty
      await prisma.superAdminNotification.createMany({
        data: [
          {
            title: "SuperAdmin Notification System Active",
            message: "Real-time alerts for business additions, status updates, deletions, and reports are now active.",
            type: "system_alert",
            isRead: false,
          },
          {
            title: "Platform Security & Verification",
            message: "Automated business rule verification engine is active for new business signups.",
            type: "system_alert",
            isRead: false,
          },
        ],
      });

      notifications = await prisma.superAdminNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    const unreadCount = await prisma.superAdminNotification.count({
      where: { isRead: false },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch (error) {
    console.error("Failed to fetch SuperAdmin notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markSuperAdminNotificationRead(id: bigint) {
  try {
    await prisma.superAdminNotification.update({
      where: { id },
      data: { isRead: true },
    });
    return true;
  } catch (error) {
    console.error("Failed to mark SuperAdmin notification as read:", error);
    return false;
  }
}

export async function markAllSuperAdminNotificationsRead() {
  try {
    await prisma.superAdminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return true;
  } catch (error) {
    console.error("Failed to mark all SuperAdmin notifications as read:", error);
    return false;
  }
}
