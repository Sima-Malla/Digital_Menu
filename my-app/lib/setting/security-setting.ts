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

export type SecurityLogItem = {
  id: string;
  event: string;
  status: string;
  details: string;
  createdAt: string;
};

export type SecurityData = {
  userEmail: string;
  recoveryEmail: string;
  timeoutMinutes: number;
  authenticator: boolean;
  smsRecovery: boolean;
  reauthForSensitive: boolean;
  rememberDevice: boolean;
  notifyOnAutoLogout: boolean;
  securityLogs: SecurityLogItem[];
};

export async function getSecurityData(userId: string): Promise<SecurityData | null> {
  const prisma = getPrisma();
  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(userId) },
    select: { email: true, fullName: true },
  });

  if (!staff) return null;

  let settings = await prisma.securitySettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    settings = await prisma.securitySettings.create({
      data: {
        id: 1,
        sessionTimeoutMinutes: 30,
        enforce2FA: false,
        twoFAMethod: "Authenticator App",
      },
    });
  }

  const logs = await prisma.systemLog.findMany({
    where: {
      OR: [
        { isSecurityEvent: true },
        { module: "Auth" },
        { userName: staff.email },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    userEmail: staff.email,
    recoveryEmail: staff.email,
    timeoutMinutes: settings.sessionTimeoutMinutes,
    authenticator: settings.enforce2FA && settings.twoFAMethod === "Authenticator App",
    smsRecovery: settings.enforce2FA && settings.twoFAMethod === "SMS",
    reauthForSensitive: true,
    rememberDevice: false,
    notifyOnAutoLogout: true,
    securityLogs: logs.map((log) => ({
      id: log.id.toString(),
      event: log.event,
      status: log.status,
      details: `${log.business ?? "System"} • ${log.ipAddress ?? "Recorded"}`,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
