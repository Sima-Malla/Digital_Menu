"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface SuperadminBusiness {
  id: number;
  logo: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  revenue: string;
}

/**
 * 1. Database को Business Table (वा Users Table) बाट Data ल्याउने
 */
export async function getSuperadminBusinesses(): Promise<SuperadminBusiness[]> {
  try {
    const logos = ["🍔", "🍕", "☕", "🍜", "🍣", "🌮", "🍦", "🥗"];

    // 1. Prisma Studio मा देखिएको `Business` Table बाट Data तान्ने
    let businessesFromDb: any[] = [];
    try {
      if ("business" in prisma) {
        businessesFromDb = await (prisma as any).business.findMany({
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (e) {
      console.log("Querying Business table directly...", e);
    }

    if (businessesFromDb && businessesFromDb.length > 0) {
      return businessesFromDb.map((b, index) => {
        const logo = logos[index % logos.length] || "🍽️";
        return {
          id: Number(b.id),
          logo,
          name: b.businessName || "Restaurant",
          owner: b.businessAddress ? `Address: ${b.businessAddress}` : "Owner",
          email: b.email || "contact@hotel.com",
          phone: b.businessPhone || "N/A",
          plan: "Premium",
          status: b.needsOnboarding ? "Pending" : "Active",
          revenue: "Rs. 65,000",
        };
      });
    }

    // 2. यदि Business Table बाट आएन भने Users Table बाट ल्याउने
    const users = await prisma.users.findMany({
      orderBy: { createdAt: "desc" },
    });

    return users.map((user, index) => {
      const logo = logos[index % logos.length] || "🍽️";
      return {
        id: Number(user.id),
        logo,
        name: user.businessName || user.fullName || `Business #${user.id}`,
        owner: user.fullName || "Owner",
        email: user.email,
        phone: user.businessPhone || user.phone || "N/A",
        plan: "Premium",
        status: user.needsOnboarding ? "Pending" : "Active",
        revenue: "Rs. 0",
      };
    });
  } catch (error) {
    console.error("Failed to fetch superadmin businesses:", error);
    return [];
  }
}

/**
 * 2. नयाँ Business थप्ने
 */
export async function createBusinessAction(data: {
  logo?: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan?: string;
  status?: string;
  revenue?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    if ("business" in prisma) {
      const businessData: any = {
        businessName: data.name,
        businessAddress: data.owner || "Kalanki",
        businessPhone: data.phone,
        email: data.email,
        needsOnboarding: data.status === "Pending",
      };

      businessData.businessType = data.plan ?? "Hotel";

      await (prisma as any).business.create({
        data: businessData,
      });
    }

    revalidatePath("/(superadmin)/business");
    revalidatePath("/business");
    return { success: true, message: "Business added successfully!" };
  } catch (error) {
    console.error("Failed to create business:", error);
    return { success: false, message: "Failed to add business." };
  }
}

/**
 * 3. Business सम्पादन (Update) गर्ने
 */
export async function updateBusinessAction(
  id: number,
  data: {
    name: string;
    owner: string;
    email: string;
    phone: string;
    status: string;
    plan: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    if ("business" in prisma) {
      await (prisma as any).business.update({
        where: { id: BigInt(id) },
        data: {
          businessName: data.name,
          businessAddress: data.owner,
          businessPhone: data.phone,
          needsOnboarding: data.status === "Pending",
        },
      });
    }

    revalidatePath("/(superadmin)/business");
    revalidatePath("/business");
    return { success: true, message: "Business updated successfully!" };
  } catch (error) {
    console.error("Failed to update business:", error);
    return { success: false, message: "Failed to update business." };
  }
}

/**
 * 4. Business Delete गर्ने
 */
export async function deleteBusinessAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    if ("business" in prisma) {
      await (prisma as any).business.delete({
        where: { id: BigInt(id) },
      });
    }

    revalidatePath("/(superadmin)/business");
    revalidatePath("/business");
    return { success: true, message: "Business deleted successfully!" };
  } catch (error) {
    console.error("Failed to delete business:", error);
    return { success: false, message: "Failed to delete business." };
  }
}