"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { parseSignupFormData } from "@/lib/validations/signup";
import { validatePasswordAgainstPolicy } from "@/app/actions/validate-password";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type SignupState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = parseSignupFormData(formData);

  if (!parsed.success) {
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

  // Staff self-signup isn't wired up yet — there's no way to resolve which
  // Business a staff member belongs to without an invite/lookup mechanism.
  // Staff.businessId is a required field, so this can't be created safely.
  // Add staff accounts from an internal admin panel for now.
  if (data.role === "staff") {
    return {
      success: false,
      message: "Staff sign-up isn't available yet. Ask your business owner to add you directly.",
    };
  }

  /* ── Admin: creates a Business + a Staff row (role: "owner") ── */
  if (data.role === "admin") {
    const existingStaff = await prisma.staff.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existingStaff) {
      return {
        success: false,
        message: "An account with this email already exists.",
        fieldErrors: { email: "This email is already registered." },
      };
    }

    // Enforce the platform's live password policy (Super Admin → Security Settings)
    const policyCheck = await validatePasswordAgainstPolicy(data.password);
    if (!policyCheck.valid) {
      return {
        success: false,
        message: "Password doesn't meet security requirements.",
        fieldErrors: { password: policyCheck.errors.join(" ") },
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    try {
      await prisma.$transaction(async (tx) => {
        const business = await tx.business.create({
          data: {
            businessName: data.businessName,
            businessType: data.businessType,
            businessAddress: data.businessAddress,
            businessPhone: data.businessPhone,
          },
        });

        await tx.staff.create({
          data: {
            businessId: business.id,
            fullName: data.fullName,
            email: data.email,
            password: hashedPassword,
            role: "owner",
            needsOnboarding: false, // Admins skip onboarding since they just created the business.
          },
        });
      });
    } catch (err) {
      console.error("Admin signup failed:", err);
      return { success: false, message: "Something went wrong. Please try again." };
    }

    redirect("/login");
  }

  /* ── User: creates a Customer row (no password — Customer has none) ── */
  if (data.role === "user") {
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: data.phone },
      select: { id: true },
    });
    if (existingCustomer) {
      return {
        success: false,
        message: "An account with this phone number already exists.",
        fieldErrors: { phone: "This phone number is already registered." },
      };
    }

    try {
      await prisma.customer.create({
        data: {
          name: data.fullName,
          phone: data.phone,
          email: data.email,
        },
      });
    } catch (err) {
      console.error("Customer signup failed:", err);
      return { success: false, message: "Something went wrong. Please try again." };
    }

    redirect("/login");
  }

  return { success: false, message: "Invalid role." };
}