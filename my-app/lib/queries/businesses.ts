import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

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

function toImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/") ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return null;
}

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
      imageUrl: toImageSrc(b.bannerUrl) ?? toImageSrc(b.logoUrl),
    }));
  } catch (error) {
    console.error("Failed to fetch public businesses:", error);
    return [];
  }
}
