import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { toValidImageSrc } from "@/lib/image-utils";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type PublicBusinessListing = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  imageUrl?: string | null;
};

export async function getPublicBusinesses(): Promise<PublicBusinessListing[]> {
  try {
    const businesses = await prisma.business.findMany({
      where: { listInMarketplace: true },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        businessAddress: true,
        businessPhone: true,
        bannerUrl: true,
        logoUrl: true,
      },
      orderBy: { businessName: "asc" },
    });

    return businesses.map((b) => ({
      id: b.id.toString(),
      name: b.businessName,
      type: b.businessType ?? "Restaurant",
      address: b.businessAddress ?? "",
      phone: b.businessPhone ?? "",
      imageUrl: toValidImageSrc(b.bannerUrl) ?? toValidImageSrc(b.logoUrl),
    }));
  } catch (error) {
    console.error("Failed to fetch public businesses:", error);
    return [];
  }
}
