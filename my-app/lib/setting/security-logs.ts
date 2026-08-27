import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export type LogEntry = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string;
  priority: "high" | "medium" | "low";
};

export type SecurityLogsStats = {
  totalEvents: number;
  todayEvents: number;
  authFailures: number;
  highPriorityAlerts: number;
  retentionPeriod: string;
};

export type SecurityLogsData = {
  logs: LogEntry[];
  stats: SecurityLogsStats;
};

function formatTimestamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const mins = pad(date.getMinutes());
  const secs = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

function mapStatus(statusStr: string): "SUCCESS" | "WARNING" | "FAILED" {
  const s = statusStr.toUpperCase();
  if (s.includes("FAIL") || s.includes("ERR")) return "FAILED";
  if (s.includes("WARN")) return "WARNING";
  return "SUCCESS";
}

function mapPriority(levelStr: string): "high" | "medium" | "low" {
  const l = levelStr.toLowerCase();
  if (l.includes("error") || l.includes("critical") || l.includes("high")) return "high";
  if (l.includes("warn") || l.includes("medium")) return "medium";
  return "low";
}

export async function getSecurityLogsData(): Promise<SecurityLogsData> {
  const prisma = getPrisma();

  const logs = await prisma.systemLog.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalEvents = await prisma.systemLog.count({ where: { archived: false } });
  const todayEvents = await prisma.systemLog.count({
    where: {
      archived: false,
      createdAt: { gte: todayStart },
    },
  });

  const authFailures = logs.filter(
    (l) => l.module === "Auth" && mapStatus(l.status) === "FAILED"
  ).length;

  const highPriorityAlerts = logs.filter(
    (l) => mapPriority(l.level) === "high" || l.isSecurityEvent
  ).length;

  const formattedLogs: LogEntry[] = logs.map((log) => ({
    id: log.id.toString(),
    timestamp: formatTimestamp(log.createdAt),
    user: log.userName || "System",
    role: log.userInitials || (log.userName ? "Staff" : "Automated"),
    action: log.event,
    category: log.module || "System",
    ipAddress: log.ipAddress || "127.0.0.1",
    status: mapStatus(log.status),
    details: log.details || log.event,
    priority: mapPriority(log.level),
  }));

  return {
    logs: formattedLogs,
    stats: {
      totalEvents,
      todayEvents,
      authFailures,
      highPriorityAlerts,
      retentionPeriod: "90 Days",
    },
  };
}
