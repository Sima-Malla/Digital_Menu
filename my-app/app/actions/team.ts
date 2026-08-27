// app/actions/team.ts
"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import { inviteStaffSchema } from "@/lib/validations/team";

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

const SETTING_TEAM_PATH = "/setting/team";

/** Confirms the caller is an owner/manager of a real business, and returns
 * that businessId — every action below scopes its query to this, so one
 * business can never see or modify another's staff. */
async function requireBusinessAdmin() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    throw new Error("Not authorized. You must be an owner or manager.");
  }

  const caller = await getPrisma().staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  if (!caller) throw new Error("Staff account not found.");

  return { businessId: caller.businessId, callerId: BigInt(session.userId) };
}

function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

export type InviteStaffState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  tempPassword?: string; // shown once on success
};

export async function inviteStaffAction(
  _prevState: InviteStaffState,
  formData: FormData
): Promise<InviteStaffState> {
  const adminRes = await requireBusinessAdmin().catch((err) => {
    return { error: err instanceof Error ? err.message : "Not authorized." };
  });

  if ("error" in adminRes) {
    return { success: false, message: adminRes.error };
  }
  const { businessId } = adminRes;

  const parsed = inviteStaffSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    position: formData.get("position"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const existing = await getPrisma().staff.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      return {
        success: false,
        message: "An account with this email already exists.",
        fieldErrors: { email: "This email is already registered." },
      };
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const assignedRole = data.position === "Manager" ? "manager" : "staff";

    await getPrisma().staff.create({
      data: {
        businessId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        position: data.position,
        password: hashedPassword,
        role: assignedRole,
        isActive: true,
      },
    });

    revalidatePath(SETTING_TEAM_PATH);
    return { success: true, message: "Staff member added.", tempPassword };
  } catch (err) {
    console.error("Failed to invite staff member:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to add staff member.",
    };
  }
}

export async function updateStaffPositionAction(staffId: string, position: string) {
  const { businessId } = await requireBusinessAdmin();

  const member = await getPrisma().staff.findUnique({ where: { id: BigInt(staffId) } });
  if (!member || member.businessId !== businessId) throw new Error("Staff member not found.");

  const newRole = member.role === "owner" ? "owner" : position === "Manager" ? "manager" : "staff";

  await getPrisma().staff.update({
    where: { id: BigInt(staffId) },
    data: { position, role: newRole },
  });
  revalidatePath(SETTING_TEAM_PATH);
}

export async function toggleStaffActiveAction(staffId: string) {
  const { businessId, callerId } = await requireBusinessAdmin();

  const member = await getPrisma().staff.findUnique({ where: { id: BigInt(staffId) } });
  if (!member || member.businessId !== businessId) throw new Error("Staff member not found.");
  if (member.id === callerId) throw new Error("You can't deactivate your own account.");
  if (member.role === "owner") throw new Error("The business owner can't be deactivated.");

  await getPrisma().staff.update({
    where: { id: BigInt(staffId) },
    data: { isActive: !member.isActive },
  });
  revalidatePath(SETTING_TEAM_PATH);
}

export async function removeStaffAction(staffId: string) {
  const { businessId, callerId } = await requireBusinessAdmin();

  const member = await getPrisma().staff.findUnique({ where: { id: BigInt(staffId) } });
  if (!member || member.businessId !== businessId) throw new Error("Staff member not found.");
  if (member.id === callerId) throw new Error("You can't remove your own account.");
  if (member.role === "owner") throw new Error("The business owner can't be removed.");

  await getPrisma().staff.delete({ where: { id: BigInt(staffId) } });
  revalidatePath(SETTING_TEAM_PATH);
}