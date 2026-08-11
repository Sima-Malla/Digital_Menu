// app/actions/superadmin-businesses.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SuperadminBusiness = {
  id: number;
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  revenue: string;
};

type GetBusinessesParams = {
  search?: string;
  status?: string;
  plan?: string;
};

export async function getSuperadminBusinesses({
  search,
  status,
  plan,
}: GetBusinessesParams): Promise<SuperadminBusiness[]> {
  const where: any = {};

  if (status) where.status = status;
  if (plan) where.plan = plan;

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { ownerName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const businesses = await prisma.business.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: { paymentStatus: "paid" },
        select: { totalAmount: true },
      },
    },
  });

  return businesses.map((b) => {
    const revenue = b.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    return {
      id: Number(b.id),
      logo: b.logoEmoji,
      name: b.businessName,
      owner: b.ownerName ?? "-",
      email: b.email ?? "-",
      phone: b.businessPhone ?? "-",
      plan: b.plan,
      status: b.status,
      revenue: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    };
  });
}

type BusinessFormInput = {
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
};

export async function createBusinessAction(data: BusinessFormInput) {
  try {
    if (data.email) {
      const existing = await prisma.business.findUnique({ where: { email: data.email } });
      if (existing) {
        return { success: false, message: "A business with this email already exists." };
      }
    }

    await prisma.business.create({
      data: {
        businessName: data.name,
        ownerName: data.owner,
        email: data.email,
        businessPhone: data.phone,
        logoEmoji: data.logo || "🍽️",
        plan: data.plan,
        status: data.status,
      },
    });

    revalidatePath("/superdashboard"); // adjust to your actual businesses page route
    return { success: true, message: "Business created." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to create business." };
  }
}

export async function updateBusinessAction(id: number, data: BusinessFormInput) {
  try {
    await prisma.business.update({
      where: { id: BigInt(id) },
      data: {
        businessName: data.name,
        ownerName: data.owner,
        email: data.email,
        businessPhone: data.phone,
        logoEmoji: data.logo,
        plan: data.plan,
        status: data.status,
      },
    });

    revalidatePath("/superdashboard");
    return { success: true, message: "Business updated." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to update business." };
  }
}

export async function deleteBusinessAction(id: number) {
  try {
    await prisma.business.delete({ where: { id: BigInt(id) } });
    revalidatePath("/superdashboard");
    return { success: true, message: "Business deleted." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to delete business." };
  }
}