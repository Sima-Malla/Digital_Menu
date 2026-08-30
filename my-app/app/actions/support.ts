"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export async function sendSupportMessageAction(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) return { success: false, message: "Please enter your name." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { success: false, message: "Please enter a valid email." };
  if (!message) return { success: false, message: "Please enter a message." };

  await prisma.supportMessage.create({ data: { name, email, message } });
  return { success: true };
}
