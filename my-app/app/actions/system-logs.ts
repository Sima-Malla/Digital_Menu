"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ------------------------------------------------------------------ */
/* Types consumed by the frontend                                     */
/* ------------------------------------------------------------------ */

export type LogRow = {
  id: string;
  displayTime: string;
  event: string;
  module: string;
  user: string;
  userInitials: string;
  business: string;
  ip: string;
  status: string;
  level: string;
};

export type LogDetail = LogRow & {
  details: string;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDisplayTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function initialsFromName(name: string | null | undefined): string {
  if (!name) return "SY";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SY";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function startDateForRange(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "Today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "Last 7 Days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "Last 30 Days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    case "All Time":
    default:
      return null;
  }
}

function toRow(log: {
  id: bigint;
  createdAt: Date;
  event: string;
  module: string;
  userName: string | null;
  userInitials: string | null;
  business: string | null;
  ipAddress: string | null;
  status: string;
  level: string;
}): LogRow {
  return {
    id: log.id.toString(),
    displayTime: formatDisplayTime(log.createdAt),
    event: log.event,
    module: log.module,
    user: log.userName ?? "System",
    userInitials: log.userInitials ?? initialsFromName(log.userName),
    business: log.business ?? "—",
    ip: log.ipAddress ?? "—",
    status: log.status,
    level: log.level,
  };
}

/* ------------------------------------------------------------------ */
/* getSystemLogs — search + filter + pagination                      */
/* ------------------------------------------------------------------ */

export async function getSystemLogs(params: {
  search: string;
  level: string; // "" = all
  module: string; // "" = all
  dateRange: string;
  page: number;
  pageSize: number;
}): Promise<{ logs: LogRow[]; total: number }> {
  const { search, level, module, dateRange, page, pageSize } = params;

  const since = startDateForRange(dateRange);

  const where: Record<string, unknown> = {
    archived: false,
    ...(level ? { level } : {}),
    ...(module ? { module } : {}),
    ...(since ? { createdAt: { gte: since } } : {}),
    ...(search
      ? {
          OR: [
            { event: { contains: search, mode: "insensitive" } },
            { userName: { contains: search, mode: "insensitive" } },
            { business: { contains: search, mode: "insensitive" } },
            { module: { contains: search, mode: "insensitive" } },
            { ipAddress: { contains: search, mode: "insensitive" } },
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

  return { logs: rows.map(toRow), total };
}

/* ------------------------------------------------------------------ */
/* getLogDetail                                                        */
/* ------------------------------------------------------------------ */

export async function getLogDetail(id: string): Promise<LogDetail | null> {
  const log = await prisma.systemLog.findUnique({
    where: { id: BigInt(id) },
  });
  if (!log) return null;
  return { ...toRow(log), details: log.details ?? "No additional details recorded for this event." };
}

/* ------------------------------------------------------------------ */
/* getLogModules — distinct module list for the filter dropdown       */
/* ------------------------------------------------------------------ */

export async function getLogModules(): Promise<string[]> {
  const rows = await prisma.systemLog.findMany({
    where: { archived: false },
    distinct: ["module"],
    select: { module: true },
    orderBy: { module: "asc" },
  });
  return rows.map((r) => r.module);
}

/* ------------------------------------------------------------------ */
/* getLogStats — counts for the stat cards + level breakdown donut    */
/* ------------------------------------------------------------------ */

export async function getLogStats(): Promise<{
  total: number;
  warnings: number;
  critical: number;
  securityEvents: number;
  levelBreakdown: { info: number; warning: number; critical: number };
}> {
  const base = { archived: false } as const;

  const [total, warnings, critical, info, securityEvents] = await Promise.all([
    prisma.systemLog.count({ where: base }),
    prisma.systemLog.count({ where: { ...base, level: "Warning" } }),
    prisma.systemLog.count({ where: { ...base, level: "Critical" } }),
    prisma.systemLog.count({ where: { ...base, level: "Info" } }),
    prisma.systemLog.count({ where: { ...base, isSecurityEvent: true } }),
  ]);

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

/* ------------------------------------------------------------------ */
/* getWeeklyActivity — event counts for the last 7 days                */
/* ------------------------------------------------------------------ */

export async function getWeeklyActivity(): Promise<
  { day: string; count: number; h: number }[]
> {
  const days: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    days.push({
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(start),
      start,
      end,
    });
  }

  const counts = await Promise.all(
    days.map((d) =>
      prisma.systemLog.count({
        where: { createdAt: { gte: d.start, lt: d.end } },
      })
    )
  );

  const max = Math.max(1, ...counts);

  return days.map((d, i) => ({
    day: d.label,
    count: counts[i],
    h: Math.round((counts[i] / max) * 100),
  }));
}

/* ------------------------------------------------------------------ */
/* getRecentSecurityEvents — for the sidebar                          */
/* ------------------------------------------------------------------ */

export async function getRecentSecurityEvents(): Promise<
  { id: string; title: string; detail: string; level: string }[]
> {
  const rows = await prisma.systemLog.findMany({
    where: { isSecurityEvent: true, archived: false },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return rows.map((r) => ({
    id: r.id.toString(),
    title: r.event,
    detail: `${r.module} • ${formatDisplayTime(r.createdAt)}`,
    level: r.level,
  }));
}

/* ------------------------------------------------------------------ */
/* archiveLogsAction — button click, mutates data                     */
/* ------------------------------------------------------------------ */

export async function archiveLogsAction(
  ids: string[]
): Promise<{ success: boolean; message: string }> {
  if (!ids || ids.length === 0) {
    return { success: false, message: "No logs selected to archive." };
  }

  try {
    const result = await prisma.systemLog.updateMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
      data: { archived: true },
    });

    revalidatePath("/system-logs");

    return {
      success: true,
      message: `Archived ${result.count} log(s).`,
    };
  } catch (err) {
    console.error("archiveLogsAction failed:", err);
    return { success: false, message: "Failed to archive logs. Please try again." };
  }
}