"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import { RESOURCES, type Resource, type Action, type PermissionMap } from "@/lib/roles-constants";
import { createSuperAdminNotification } from "@/lib/superadmin-notifications";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function requireSuperadmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") return null;
  return session;
}

type ActionResult = { success: true } | { success: false; message: string };

export interface RoleData {
  id: string;
  name: string;
  description: string;
  locked: boolean;
  adminCount: number;
  permissions: PermissionMap;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isSuperAdminAccount: boolean; // true = row from the SuperAdmin table, not editable/removable here
}

const SUPER_ADMIN_ROLE_NAME = "Super Admin";

function noAccess(): PermissionMap {
  return RESOURCES.reduce((acc, r) => {
    acc[r] = { View: false, Create: false, Edit: false, Delete: false };
    return acc;
  }, {} as PermissionMap);
}

function fullAccess(): PermissionMap {
  return RESOURCES.reduce((acc, r) => {
    acc[r] = { View: true, Create: true, Edit: true, Delete: true };
    return acc;
  }, {} as PermissionMap);
}

/** Ensures a locked "Super Admin" role with full access always exists. */
async function ensureSuperAdminRole() {
  const existing = await prisma.role.findUnique({ where: { name: SUPER_ADMIN_ROLE_NAME } });
  if (existing) return existing;

  return prisma.role.create({
    data: {
      name: SUPER_ADMIN_ROLE_NAME,
      description: "Full access to every module. Cannot be edited or removed.",
      permissions: fullAccess(),
    },
  });
}

/** Seeds the default Admin / Moderator / Support Staff roles once, if they don't exist yet. */
async function ensureDefaultRoles() {
  const defaults: { name: string; description: string; permissions: PermissionMap }[] = [
    {
      name: "Admin",
      description: "Manages day-to-day operations across the platform.",
      permissions: {
        ...noAccess(),
        Businesses: { View: true, Create: true, Edit: true, Delete: false },
        Orders: { View: true, Create: false, Edit: true, Delete: false },
        "Platform Users": { View: true, Create: true, Edit: true, Delete: false },
        "System Logs": { View: true, Create: false, Edit: false, Delete: false },
        Payments: { View: true, Create: false, Edit: false, Delete: false },
        "Global Settings": { View: true, Create: false, Edit: false, Delete: false },
      },
    },
    {
      name: "Moderator",
      description: "Reviews and moderates business and order activity.",
      permissions: {
        ...noAccess(),
        Businesses: { View: true, Create: false, Edit: true, Delete: false },
        Orders: { View: true, Create: false, Edit: true, Delete: false },
        "System Logs": { View: true, Create: false, Edit: false, Delete: false },
      },
    },
    {
      name: "Support Staff",
      description: "Handles user support tickets and read-only lookups.",
      permissions: {
        ...noAccess(),
        Orders: { View: true, Create: false, Edit: false, Delete: false },
        "Platform Users": { View: true, Create: false, Edit: false, Delete: false },
      },
    },
  ];

  for (const role of defaults) {
    const existing = await prisma.role.findUnique({ where: { name: role.name } });
    if (!existing) {
      await prisma.role.create({ data: role });
    }
  }
}

export async function getRoles(): Promise<RoleData[]> {
  const session = await requireSuperadmin();
  if (!session) return [];

  await ensureSuperAdminRole();

  const roles = await prisma.role.findMany({
    include: { _count: { select: { admins: true } } },
    orderBy: { createdAt: "asc" },
  });

  return roles.map((r) => ({
    id: r.id.toString(),
    name: r.name,
    description: r.description ?? "",
    locked: r.name === SUPER_ADMIN_ROLE_NAME,
    adminCount: r._count.admins,
    permissions: (r.permissions as PermissionMap) ?? noAccess(),
  }));
}

export async function getAdmins(): Promise<AdminUser[]> {
  const session = await requireSuperadmin();
  if (!session) return [];

  const superAdminRole = await ensureSuperAdminRole();

  const [platformUsers, superAdmins] = await Promise.all([
    prisma.platformUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.superAdmin.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const fromPlatformUsers: AdminUser[] = platformUsers.map((a) => ({
    id: `pu-${a.id.toString()}`,
    name: a.fullName,
    email: a.email,
    roleId: a.roleId?.toString() ?? "",
    isSuperAdminAccount: false,
  }));

  const fromSuperAdmins: AdminUser[] = superAdmins.map((a) => ({
    id: `sa-${a.id.toString()}`,
    name: a.fullName,
    email: a.email,
    roleId: superAdminRole.id.toString(),
    isSuperAdminAccount: true,
  }));

  return [...fromSuperAdmins, ...fromPlatformUsers];
}

export async function createRoleAction(): Promise<ActionResult & { data?: { id: string } }> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  try {
    const role = await prisma.role.create({
      data: {
        name: "New Role",
        description: "Describe what this role can do.",
        permissions: noAccess(),
      },
    });

    await createSuperAdminNotification({
      title: "New Role Created",
      message: "A new permission role 'New Role' was created.",
      type: "system_alert",
    });

    revalidatePath("/settings/roles");
    return { success: true, data: { id: role.id.toString() } };
  } catch (error) {
    console.error("Failed to create role:", error);
    return { success: false, message: "Failed to create role." };
  }
}

export async function updateRoleFieldAction(
  id: string,
  data: { name?: string; description?: string }
): Promise<ActionResult> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  const role = await prisma.role.findUnique({ where: { id: BigInt(id) } });
  if (!role) return { success: false, message: "Role not found." };
  if (role.name === SUPER_ADMIN_ROLE_NAME) {
    return { success: false, message: "Super Admin role cannot be edited." };
  }

  try {
    await prisma.role.update({ where: { id: BigInt(id) }, data });

    await createSuperAdminNotification({
      title: "Role Details Updated",
      message: `Role details updated for ${data.name || role.name}.`,
      type: "system_alert",
    });

    revalidatePath("/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, message: "Failed to update role." };
  }
}

export async function updateRolePermissionsAction(
  id: string,
  permissions: PermissionMap
): Promise<ActionResult> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  const role = await prisma.role.findUnique({ where: { id: BigInt(id) } });
  if (!role) return { success: false, message: "Role not found." };
  if (role.name === SUPER_ADMIN_ROLE_NAME) {
    return { success: false, message: "Super Admin role cannot be edited." };
  }

  try {
    await prisma.role.update({ where: { id: BigInt(id) }, data: { permissions } });

    await createSuperAdminNotification({
      title: "Role Permissions Updated",
      message: `Permissions policy modified for role '${role.name}'.`,
      type: "system_alert",
    });

    revalidatePath("/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update permissions:", error);
    return { success: false, message: "Failed to update permissions." };
  }
}

export async function deleteRoleAction(id: string): Promise<ActionResult> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  const role = await prisma.role.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { admins: true } } },
  });
  if (!role) return { success: false, message: "Role not found." };
  if (role.name === SUPER_ADMIN_ROLE_NAME) {
    return { success: false, message: "Super Admin role cannot be deleted." };
  }
  if (role._count.admins > 0) {
    return { success: false, message: "Reassign admins before deleting this role." };
  }

  try {
    await prisma.role.delete({ where: { id: BigInt(id) } });

    await createSuperAdminNotification({
      title: "Role Deleted",
      message: `Role '${role.name}' was permanently deleted.`,
      type: "system_alert",
    });

    revalidatePath("/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete role:", error);
    return { success: false, message: "Failed to delete role." };
  }
}

export async function updateAdminRoleAction(adminId: string, roleId: string): Promise<ActionResult> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  if (adminId.startsWith("sa-")) {
    return { success: false, message: "Super Admin accounts always keep the Super Admin role." };
  }

  try {
    const rawId = adminId.replace(/^pu-/, "");
    await prisma.platformUser.update({
      where: { id: BigInt(rawId) },
      data: { roleId: BigInt(roleId) },
    });
    revalidatePath("/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update admin role:", error);
    return { success: false, message: "Failed to update admin's role." };
  }
}

export async function removeAdminAction(adminId: string): Promise<ActionResult> {
  const session = await requireSuperadmin();
  if (!session) return { success: false, message: "Unauthorized access." };

  if (adminId.startsWith("sa-")) {
    return { success: false, message: "Super Admin accounts can't be removed from here." };
  }

  try {
    const rawId = adminId.replace(/^pu-/, "");
    await prisma.platformUser.delete({ where: { id: BigInt(rawId) } });
    revalidatePath("/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove admin:", error);
    return { success: false, message: "Failed to remove admin." };
  }
}