import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export type LogLevel = "Info" | "Warning" | "Critical";
export type LogStatus = "Success" | "Completed" | "Failed" | "Blocked";

export type CreateLogInput = {
  event: string; // e.g. "User Login", "Order Created", "Payment Failed"
  module: string; // "Authentication" | "Businesses" | "Orders" | "Payments" | "Global Config" | "System"
  level: LogLevel;
  status: LogStatus;
  userName?: string | null;
  business?: string | null;
  ipAddress?: string | null;
  details?: string | null;
  isSecurityEvent?: boolean;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function initialsFromName(name?: string | null): string {
  if (!name) return "SY";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SY";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* createSystemLog — the single write path for every log in the app   */
/* ------------------------------------------------------------------ */

/**
 * Writes one row to SystemLog. Never throws — logging must never break
 * the calling business logic (a login/order/payment should still
 * succeed even if the log insert fails). Failures are only console.error'd.
 */
export async function createSystemLog(input: CreateLogInput): Promise<void> {
  try {
    await prisma.systemLog.create({
      data: {
        event: input.event,
        module: input.module,
        level: input.level,
        status: input.status,
        userName: input.userName ?? null,
        userInitials: initialsFromName(input.userName),
        business: input.business ?? null,
        ipAddress: input.ipAddress ?? null,
        details: input.details ?? null,
        isSecurityEvent: input.isSecurityEvent ?? false,
      },
    });
  } catch (err) {
    console.error("[createSystemLog] failed to write log:", err, input);
  }
}

/* ------------------------------------------------------------------ */
/* Convenience wrappers for the most common events                    */
/* Use these in your actions/routes instead of calling                */
/* createSystemLog directly, so the "event" / "module" strings stay   */
/* consistent everywhere they're logged from.                         */
/* ------------------------------------------------------------------ */

export const logAuth = {
  loginSuccess: (userName: string, ipAddress?: string | null, business?: string | null) =>
    createSystemLog({
      event: "User Login",
      module: "Authentication",
      level: "Info",
      status: "Success",
      userName,
      ipAddress,
      business,
    }),

  loginFailed: (attemptedEmail: string, ipAddress?: string | null) =>
    createSystemLog({
      event: "Failed Login Attempt",
      module: "Authentication",
      level: "Warning",
      status: "Failed",
      userName: attemptedEmail,
      ipAddress,
      isSecurityEvent: true,
      details: `Failed login attempt for ${attemptedEmail}`,
    }),

  logout: (userName: string, ipAddress?: string | null) =>
    createSystemLog({
      event: "User Logout",
      module: "Authentication",
      level: "Info",
      status: "Success",
      userName,
      ipAddress,
    }),

  unauthorizedAccess: (path: string, ipAddress?: string | null) =>
    createSystemLog({
      event: "Unauthorized Access Attempt",
      module: "Authentication",
      level: "Critical",
      status: "Blocked",
      ipAddress,
      isSecurityEvent: true,
      details: `Blocked attempt to access ${path}`,
    }),
};

export const logOrders = {
  created: (orderId: string | bigint, business: string) =>
    createSystemLog({
      event: "Order Created",
      module: "Orders",
      level: "Info",
      status: "Success",
      business,
      details: `Order #${orderId} created`,
    }),

  statusChanged: (orderId: string | bigint, business: string, from: string, to: string) =>
    createSystemLog({
      event: "Order Status Updated",
      module: "Orders",
      level: "Info",
      status: "Success",
      business,
      details: `Order #${orderId}: ${from} → ${to}`,
    }),

  cancelled: (orderId: string | bigint, business: string, reason?: string) =>
    createSystemLog({
      event: "Order Cancelled",
      module: "Orders",
      level: "Warning",
      status: "Completed",
      business,
      details: reason ? `Order #${orderId} cancelled: ${reason}` : `Order #${orderId} cancelled`,
    }),
};

export const logPayments = {
  success: (orderId: string | bigint, business: string, amount: string) =>
    createSystemLog({
      event: "Payment Successful",
      module: "Payments",
      level: "Info",
      status: "Success",
      business,
      details: `Payment of ${amount} for order #${orderId}`,
    }),

  failed: (orderId: string | bigint, business: string, reason?: string) =>
    createSystemLog({
      event: "Payment Failed",
      module: "Payments",
      level: "Critical",
      status: "Failed",
      business,
      details: reason ? `Order #${orderId}: ${reason}` : `Order #${orderId} payment failed`,
    }),
};

export const logBusiness = {
  created: (businessName: string, ownerName?: string | null) =>
    createSystemLog({
      event: "Business Onboarded",
      module: "Businesses",
      level: "Info",
      status: "Success",
      business: businessName,
      userName: ownerName,
    }),

  suspended: (businessName: string, adminName?: string | null, reason?: string) =>
    createSystemLog({
      event: "Business Suspended",
      module: "Businesses",
      level: "Warning",
      status: "Completed",
      business: businessName,
      userName: adminName,
      details: reason,
    }),

  statusChanged: (businessName: string, from: string, to: string, adminName?: string | null) =>
    createSystemLog({
      event: "Business Status Changed",
      module: "Businesses",
      level: "Info",
      status: "Success",
      business: businessName,
      userName: adminName,
      details: `${from} → ${to}`,
    }),
};

export const logSettings = {
  changed: (settingName: string, adminName?: string | null, details?: string) =>
    createSystemLog({
      event: "Global Setting Changed",
      module: "Global Config",
      level: "Warning",
      status: "Success",
      userName: adminName,
      details: details ?? `${settingName} was updated`,
    }),
};

export const logSystem = {
  info: (event: string, details?: string) =>
    createSystemLog({ event, module: "System", level: "Info", status: "Completed", details }),

  error: (event: string, details?: string) =>
    createSystemLog({ event, module: "System", level: "Critical", status: "Failed", details }),
};