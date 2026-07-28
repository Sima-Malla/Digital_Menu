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

/* Keep in sync with whatever role strings your Users table actually stores. */
const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  staff: "/staff",
  user: "/dashboard",
  superadmin: "/superadmin",
};

// Same message for every failure case — wrong email, wrong password, or no
// such account — so a client can't tell which part was wrong and enumerate
// registered emails.
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

// Used when no user is found, so bcrypt still does a comparison of roughly
// the same cost either way. Without this, "no such user" responds faster
// than "wrong password," and that timing gap alone leaks which emails exist.
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

  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, role: true },
  });

  const storedPassword = user?.password ?? DUMMY_HASH;
  let passwordMatches = false;

  if (typeof storedPassword === "string" && storedPassword.startsWith("$2")) {
    passwordMatches = await bcrypt.compare(password, storedPassword);
  } else {
    passwordMatches = password === storedPassword;
  }

  if (!user || !passwordMatches) {
    return { success: false, message: INVALID_CREDENTIALS_MESSAGE };
  }

  await createSession({ userId: user.id.toString(), role: user.role, email: user.email }, remember);

  // redirect() throws internally to hand control back to Next.js — this must
  // NOT be wrapped in a try/catch, or that throw gets swallowed as an error.
  redirect(ROLE_REDIRECTS[user.role] ?? "/");
}