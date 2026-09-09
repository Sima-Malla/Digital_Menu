"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PATH = "/superadmin/system-logs";

// ---------------------------------------------------------------------
// Types (match what the frontend expects)
// ---------------------------------------------------------------------

export type LogRow = {
  id: string;
  displayTime: string;
  event: string;
  module: string;
  user: string;
  userInitials: string;
  business: string;
  status: string;
  level: string;
};

export type LogDetail = LogRow & { details: string };

type GetLogsParams = {
  search: string;
  level: string; // "" means all
  module: string; // "" means all
  dateRange: string;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------

function formatTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateRangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "Today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "Last 7 Days":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "Last 30 Days":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "All Time":
    default:
      return null;
  }
}

function mapRow(log: {
  id: bigint;
  createdAt: Date;
  event: string;
  module: string;
  userName: string | null;
  userInitials: string | null;
  business: string | null;
  status: string;
  level: string;
  details: string | null;
}): LogDetail {
  return {
    id: log.id.toString(),
    displayTime: formatTime(log.createdAt),
    event: log.event,
    module: log.module,
    user: log.userName ?? "System",
    userInitials: log.userInitials ?? "SY",
    business: log.business ?? "—",
    status: log.status,
    level: log.level,
    details: log.details ?? "",
  };
}

// ---------------------------------------------------------------------
// getSystemLogs — search + filter + pagination
// ---------------------------------------------------------------------

export async function getSystemLogs(params: GetLogsParams): Promise<{ logs: LogRow[]; total: number }> {
  const { search, level, module, dateRange, page, pageSize } = params;
  const start = dateRangeStart(dateRange);

  const where = {
    archived: false,
    ...(level ? { level } : {}),
    ...(module ? { module } : {}),
    ...(start ? { createdAt: { gte: start } } : {}),
    ...(search.trim()
      ? {
          OR: [
            { event: { contains: search.trim(), mode: "insensitive" as const } },
            { userName: { contains: search.trim(), mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.systemLog.count({ where }),
  ]);

  return { logs: rows.map(mapRow), total };
}

// ---------------------------------------------------------------------
// getLogDetail
// ---------------------------------------------------------------------

export async function getLogDetail(id: string): Promise<LogDetail | null> {
  const log = await prisma.systemLog.findUnique({ where: { id: BigInt(id) } });
  return log ? mapRow(log) : null;
}

// ---------------------------------------------------------------------
// getLogModules — distinct module names
// ---------------------------------------------------------------------

export async function getLogModules(): Promise<string[]> {
  const rows = await prisma.systemLog.findMany({
    where: { archived: false },
    distinct: ["module"],
    select: { module: true },
    orderBy: { module: "asc" },
  });
  return rows.map((r) => r.module);
}

// ---------------------------------------------------------------------
// getLogStats
// ---------------------------------------------------------------------

export async function getLogStats() {
  const [total, warnings, critical, securityEvents] = await Promise.all([
    prisma.systemLog.count({ where: { archived: false } }),
    prisma.systemLog.count({ where: { archived: false, level: "Warning" } }),
    prisma.systemLog.count({ where: { archived: false, level: "Critical" } }),
    prisma.systemLog.count({ where: { archived: false, isSecurityEvent: true } }),
  ]);

  const info = total - warnings - critical;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return {
    total,
    warnings,
    critical,
    securityEvents,
    levelBreakdown: {
      info: pct(info),
      warning: pct(warnings),
      critical: pct(critical),
    },
  };
}

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// getWeeklyActivity — event counts for Sunday to Saturday
// ---------------------------------------------------------------------

export async function getWeeklyActivity(): Promise<{ day: string; count: number; h: number }[]> {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const now = new Date();
  const currentDayOfWeek = now.getDay();

  const sunday = new Date(now);
  sunday.setDate(now.getDate() - currentDayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const rows = await prisma.systemLog.findMany({
    where: { archived: false, createdAt: { gte: sunday, lte: saturday } },
    select: { createdAt: true },
  });

  const buckets: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const row of rows) {
    const dayIdx = row.createdAt.getDay();
    if (dayIdx in buckets) {
      buckets[dayIdx]++;
    }
  }

  const max = Math.max(1, ...Object.values(buckets));

  return daysOfWeek.map((dayLabel, idx) => {
    const count = buckets[idx];
    return {
      day: dayLabel,
      count,
      h: Math.round((count / max) * 100),
    };
  });
}

// ---------------------------------------------------------------------
// getRecentSecurityEvents
// ---------------------------------------------------------------------

export async function getRecentSecurityEvents(): Promise<
  { id: string; title: string; detail: string; level: string }[]
> {
  const rows = await prisma.systemLog.findMany({
    where: { archived: false, isSecurityEvent: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return rows.map((r) => ({
    id: r.id.toString(),
    title: r.event,
    detail: `${r.userName ?? "Unknown user"} · ${formatTime(r.createdAt)}`,
    level: r.level,
  }));
}

// ---------------------------------------------------------------------
// archiveLogsAction
// ---------------------------------------------------------------------

export async function archiveLogsAction(ids: string[]): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.systemLog.updateMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
      data: { archived: true },
    });
    revalidatePath(PATH);
    return { success: true };
  } catch (err) {
    console.error("archiveLogsAction failed:", err);
    return { success: false, message: "Could not archive logs. Please try again." };
  }
}
// ---------------------------------------------------------------------
// getSystemHealth — real DB ping (add this to app/actions/superadmin/system-logs.ts)
// ---------------------------------------------------------------------

export async function getSystemHealth(): Promise<{
  database: "Optimal" | "Degraded" | "Down";
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return {
      database: latencyMs < 300 ? "Optimal" : "Degraded",
      latencyMs,
    };
  } catch (err) {
    console.error("getSystemHealth: DB ping failed:", err);
    return { database: "Down", latencyMs: Date.now() - start };
  }
}