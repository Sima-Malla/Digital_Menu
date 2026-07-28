"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { parseSignupFormData } from "@/lib/validations/signup";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

export type SignupState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = parseSignupFormData(formData);

  if (!parsed.success) {
    // Collapse Zod's issues into { fieldName: firstMessage } so the form can
    // show an error under each specific input, not just one banner at top.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const normalizedEmail = data.email.toLowerCase();

  // Look up by email only — never select the password column back out.
  const existingUser = await prisma.users.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
      fieldErrors: { email: "This email is already registered." },
    };
  }

  // Hash the password before it ever touches the database.
  const hashedPassword = await bcrypt.hash(data.password, 12);

  await prisma.users.create({
    data: {
      fullName: data.fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
      phone: data.role === "staff" || data.role === "user" ? data.phone : null,
      inviteCode: data.role === "staff" ? data.inviteCode : null,
      staffRole: data.role === "staff" ? data.staffRole : null,
      businessName: data.role === "admin" ? data.businessName : null,
      businessType: data.role === "admin" ? data.businessType : null,
      businessAddress: data.role === "admin" ? data.businessAddress : null,
      businessPhone: data.role === "admin" ? data.businessPhone : null,
    },
  });

  redirect("/login");
}