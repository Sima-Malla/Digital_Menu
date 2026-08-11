"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function timeAgo(date: Date | null) {
  if (!date) return "Never";
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export type PlatformUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  lastActive: string;
  createdDate: string;
  permissionSummary: string;
  permissions: string[];
};

export type PlatformUserDetail = PlatformUserRow & {
  activity: { label: string; time: string }[];
};

type GetUsersParams = {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  lastLogin?: string; // "Today" | "This week" | "This month"
  sortBy?: string;
  page?: number;
  pageSize?: number;
};

export async function getPlatformUsers({
  search = "",
  role = "",
  department = "",
  status = "",
  lastLogin = "",
  sortBy = "",
  page = 1,
  pageSize = 10,
}: GetUsersParams): Promise<{ users: PlatformUserRow[]; total: number }> {
  const where: any = {};

  if (role) where.role = role;
  if (department) where.department = department;
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (lastLogin) {
    const now = new Date();
    let from: Date;
    if (lastLogin === "Today") from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (lastLogin === "This week") from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // This month
    where.lastActiveAt = { gte: from };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "Name A-Z") orderBy = { fullName: "asc" };
  if (sortBy === "Name Z-A") orderBy = { fullName: "desc" };
  if (sortBy === "Role") orderBy = { role: "asc" };

  const [rows, total] = await Promise.all([
    prisma.platformUser.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.platformUser.count({ where }),
  ]);

  const users = rows.map((u) => ({
    id: u.id.toString(),
    name: u.fullName,
    email: u.email,
    phone: u.phone ?? "-",
    role: u.role,
    department: u.department ?? "-",
    status: u.status,
    lastActive: timeAgo(u.lastActiveAt),
    createdDate: u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    permissionSummary: u.permissions[0] ?? "No Access",
    permissions: u.permissions,
  }));

  return { users, total };
}

export async function getPlatformUserDetail(id: string): Promise<PlatformUserDetail | null> {
  const u = await prisma.platformUser.findUnique({
    where: { id: BigInt(id) },
    include: { activities: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!u) return null;

  return {
    id: u.id.toString(),
    name: u.fullName,
    email: u.email,
    phone: u.phone ?? "-",
    role: u.role,
    department: u.department ?? "-",
    status: u.status,
    lastActive: timeAgo(u.lastActiveAt),
    createdDate: u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    permissionSummary: u.permissions[0] ?? "No Access",
    permissions: u.permissions,
    activity: u.activities.map((a) => ({ label: a.label, time: timeAgo(a.createdAt) })),
  };
}

export async function getPlatformStats() {
  const [total, active, suspended] = await Promise.all([
    prisma.platformUser.count(),
    prisma.platformUser.count({ where: { status: "Active" } }),
    prisma.platformUser.count({ where: { status: "Suspended" } }),
  ]);
  return { total, active, suspended };
}

type CreateUserInput = {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  permissions: string[];
};

export async function createPlatformUserAction(data: CreateUserInput) {
  try {
    const existing = await prisma.platformUser.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, message: "A user with this email already exists." };

    const user = await prisma.platformUser.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        department: data.department,
        permissions: data.permissions,
      },
    });

    await prisma.platformUserActivity.create({
      data: { userId: user.id, label: "Account created" },
    });

    revalidatePath("/users");
    return { success: true, message: "User created." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to create user." };
  }
}

export async function toggleSuspendAction(id: string) {
  try {
    const user = await prisma.platformUser.findUnique({ where: { id: BigInt(id) } });
    if (!user) return { success: false, message: "User not found." };

    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    await prisma.platformUser.update({
      where: { id: BigInt(id) },
      data: { status: newStatus },
    });
    await prisma.platformUserActivity.create({
      data: { userId: BigInt(id), label: `Account ${newStatus.toLowerCase()}` },
    });

    revalidatePath("/users");
    return { success: true, status: newStatus };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to update status." };
  }
}

export async function deletePlatformUserAction(id: string) {
  try {
    await prisma.platformUser.delete({ where: { id: BigInt(id) } });
    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to delete user." };
  }
}