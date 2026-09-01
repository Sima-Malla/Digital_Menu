import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import MarketplaceContent from "./MarketplaceContent";
import { toValidImageSrc } from "@/lib/image-utils";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export default async function MarketplacePage() {
  const businesses = await prisma.business.findMany({
    where: { staff: { some: { needsOnboarding: false } } },
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

  const serialized = businesses.map((b) => {
    const banner = toValidImageSrc(b.bannerUrl);
    const logo = toValidImageSrc(b.logoUrl);
    return {
      id: b.id.toString(),
      name: b.businessName,
      type: b.businessType ?? "Restaurant",
      address: b.businessAddress ?? "",
      phone: b.businessPhone ?? "",
      imageUrl: banner || logo || null,
      bannerUrl: banner,
      logoUrl: logo,
    };
  });

  // Business types shown in the sidebar filter are derived from real data,
  // not hardcoded, so the filter list always matches what's actually in the DB.
  const businessTypes = Array.from(
    new Set(serialized.map((b) => b.type).filter(Boolean))
  );

  return <MarketplaceContent businesses={serialized} businessTypes={businessTypes} />;
}