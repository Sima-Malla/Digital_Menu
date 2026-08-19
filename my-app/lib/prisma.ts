// lib/prisma.ts
// A single, shared Prisma Client instance for the whole app.
// Import this everywhere instead of creating a `new PrismaClient()` in
// every action file — that was the pattern in staff-login.ts, but
// duplicating it per-file risks opening too many DB connections
// during dev hot-reload.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: connectionString ?? "",
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}