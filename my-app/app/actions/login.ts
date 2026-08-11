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

/* Staff.role is a permission level: "owner" | "manager" | "staff".
   SuperAdmin is a fully separate table (no businessId) — checked as a
   fallback if no Staff row matches the email. Customer has no password
   column (customers aren't login accounts). */
const ROLE_REDIRECTS: Record<string, string> = {
  owner: "/dashboard",
  manager: "/staffdashboard",
  staff: "/staffdashboard",
  superadmin: "/superdashboard",
};

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

// Used when no matching row is found in either table, so bcrypt still does
// a comparison of roughly the same cost either way. Without this, "no such
// account" responds faster than "wrong password," and that timing gap
// alone leaks which emails exist.
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

  // Pull the business relation too, so we can check needsOnboarding in the
  // same query instead of a second round trip.
  const staffMember = await prisma.staff.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      businessId: true,
      business: { select: { needsOnboarding: true } },
    },
  });

  // Only check SuperAdmin if no Staff row matched — an email should never
  // legitimately belong to both, so this ordering doesn't leak anything.
  const superAdmin = staffMember
    ? null
    : await prisma.superAdmin.findUnique({
        where: { email },
        select: { id: true, email: true, password: true },
      });

  const account = staffMember ?? superAdmin;
  const role = staffMember ? staffMember.role : "superadmin";
  const storedPassword = account?.password ?? DUMMY_HASH;

  let passwordMatches = false;
  if (typeof storedPassword === "string" && storedPassword.startsWith("$2")) {
    passwordMatches = await bcrypt.compare(password, storedPassword);
  }

  if (!account || !passwordMatches) {
    return { success: false, message: INVALID_CREDENTIALS_MESSAGE };
  }

  await createSession(
    {
      userId: account.id.toString(),
      role,
      email: account.email,
      // staffMember is null for SuperAdmin logins, and SuperAdmin has no
      // business — SessionPayload.businessId is `string | null`, so we
      // coalesce `undefined` to `null` explicitly rather than leaving it out.
      businessId: staffMember?.businessId?.toString() ?? null,
    },
    remember
  );

  // Staff/owners whose business hasn't completed setup get sent to
  // onboarding first, before ever reaching their normal dashboard.
  if (staffMember?.business?.needsOnboarding) {
    redirect("/onboarding");
  }

  // redirect() throws internally to hand control back to Next.js — this must
  // NOT be wrapped in a try/catch, or that throw gets swallowed as an error.
  redirect(ROLE_REDIRECTS[role] ?? "/dashboard");
}