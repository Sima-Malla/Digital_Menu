// lib/settings.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

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

export type GeneralSettings = {
  restaurantName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  language: string;
  currency: string;
  timezone: string;
  taxId: string;
  taxRegistration: string;
  listInMarketplace: boolean;
  showOnMap: boolean;
  allowReviews: boolean;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
};

export async function getGeneralSettings(businessId: bigint): Promise<GeneralSettings | null> {
  const business = await getPrisma().business.findUnique({
    where: { id: businessId },
    select: {
      businessName: true,
      businessPhone: true,
      logoUrl: true,
      bannerUrl: true,
      language: true,
      currency: true,
      timezone: true,
      taxId: true,
      taxRegistration: true,
      listInMarketplace: true,
      showOnMap: true,
      allowReviews: true,
      email: true,
      website: true,
      instagram: true,
      facebook: true,
      twitter: true,
    },
  });

  if (!business) return null;

  return {
    restaurantName: business.businessName,
    logoUrl: business.logoUrl,
    bannerUrl: business.bannerUrl,
    language: business.language || "English (US)",
    currency: business.currency || "USD ($)",
    timezone: business.timezone || "EST (UTC-5)",
    taxId: business.taxId ?? "",
    taxRegistration: business.taxRegistration ?? "",
    listInMarketplace: business.listInMarketplace,
    showOnMap: business.showOnMap,
    allowReviews: business.allowReviews,
    phone: business.businessPhone ?? "",
    email: business.email ?? "",
    website: business.website ?? "",
    instagram: business.instagram ?? "",
    facebook: business.facebook ?? "",
    twitter: business.twitter ?? "",
  };
}

export async function updateGeneralSettings(
  businessId: bigint,
  data: GeneralSettings
): Promise<void> {
  await getPrisma().business.update({
    where: { id: businessId },
    data: {
      businessName: data.restaurantName,
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      language: data.language,
      currency: data.currency,
      timezone: data.timezone,
      taxId: data.taxId || null,
      taxRegistration: data.taxRegistration || null,
      listInMarketplace: data.listInMarketplace,
      showOnMap: data.showOnMap,
      allowReviews: data.allowReviews,
      businessPhone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      twitter: data.twitter || null,
    },
  });
}