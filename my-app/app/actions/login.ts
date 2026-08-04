"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { loginSchema } from "@/lib/validations/login";
import { createSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

export type LoginState = {
  success: boolean;
  message: string;
};

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/dashboard",
  staff: "/staffdashboard",
  user: "/Home",
  superadmin: "/superdashboard",
};

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8gO7XxeH8XxeH8XxeH8XxeH8XxeH8u";

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString(),
    password: formData.get("password")?.toString(),
    remember: formData.get("remember") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: INVALID_CREDENTIALS_MESSAGE };
  }

  const { password, remember } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  // 1. Pahila Users table (admin, user, superadmin) ma khojne
  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, role: true },
  });

  if (user) {
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return { success: false, message: INVALID_CREDENTIALS_MESSAGE };
    }

    await createSession({ userId: user.id.toString(), role: user.role, email: user.email }, remember);
    redirect(ROLE_REDIRECTS[user.role] ?? "/");
  }

  // 2. Users ma napaaye, Staff table ma khojne
  const staff = await prisma.staff.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, role: true },
  });

  const storedPassword = staff?.password ?? DUMMY_HASH;
  let passwordMatches = false;

  if (typeof storedPassword === "string" && storedPassword.startsWith("$2")) {
    passwordMatches = await bcrypt.compare(password, storedPassword);
  }

  if (!staff || !passwordMatches) {
    // dubai table ma napaaye - timing consistent rakhna dummy compare bhaisakyo
    return { success: false, message: INVALID_CREDENTIALS_MESSAGE };
  }

  await createSession({ userId: staff.id.toString(), role: "staff", email: staff.email }, remember);
  redirect(ROLE_REDIRECTS["staff"]);
}