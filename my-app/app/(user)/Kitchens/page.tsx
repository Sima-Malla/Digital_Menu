import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import MarketplaceContent from "./MarketplaceContent";

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
    },
    orderBy: { businessName: "asc" },
  });

  const serialized = businesses.map((b) => ({
    id: b.id.toString(),
    name: b.businessName,
    type: b.businessType ?? "Restaurant",
    address: b.businessAddress ?? "",
    phone: b.businessPhone ?? "",
  }));

  // Business types shown in the sidebar filter are derived from real data,
  // not hardcoded, so the filter list always matches what's actually in the DB.
  const businessTypes = Array.from(
    new Set(serialized.map((b) => b.type).filter(Boolean))
  );

  return <MarketplaceContent businesses={serialized} businessTypes={businessTypes} />;
}