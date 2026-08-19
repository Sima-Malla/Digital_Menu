import { prisma } from "@/lib/prisma";

type LogLevel = "Info" | "Warning" | "Critical";

type LogEventInput = {
  event: string; // e.g. "Staff Login", "Business Approved", "Order Cancelled"
  module: string; // e.g. "Auth", "Businesses", "Orders", "Settings"
  level?: LogLevel; // default "Info"
  status: string; // e.g. "Success", "Failed", "Completed", "Blocked"
  userName?: string;
  business?: string;
  details?: string;
  isSecurityEvent?: boolean;
};

function initialsFrom(name?: string) {
  if (!name) return "SY";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "SY";
}

/**
 * Writes one row to SystemLog. Call this from any action right after the
 * event it describes actually happens (e.g. after a successful login, after
 * a business status change, after an order is cancelled).
 *
 * Fire-and-forget by design: logging must never break the calling action,
 * so failures are swallowed and only logged to the server console.
 */
export async function logEvent(input: LogEventInput) {
  try {
    await prisma.systemLog.create({
      data: {
        event: input.event,
        module: input.module,
        level: input.level ?? "Info",
        status: input.status,
        userName: input.userName,
        userInitials: initialsFrom(input.userName),
        business: input.business,
        details: input.details,
        isSecurityEvent: input.isSecurityEvent ?? false,
      },
    });
  } catch (err) {
    console.error("logEvent failed (non-fatal):", err);
  }
}