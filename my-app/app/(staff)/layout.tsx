import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import StaffLayoutClient from "@/components/staff/StaffLayoutClient";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // /slogin renders without a sidebar/topbar and may be hit before a
  // session exists — don't redirect here, just skip the lookup.
  let businessName = "Your Business";
  let profileImage = "/hotel.png";

  if (session?.businessId) {
    const business = await prisma.business.findUnique({
      where: { id: BigInt(session.businessId) },
      select: { businessName: true, logoUrl: true },
    });
    businessName = business?.businessName ?? businessName;
    profileImage = business?.logoUrl || profileImage;
  }

  return (
    <StaffLayoutClient businessName={businessName} profileImage={profileImage}>
      {children}
    </StaffLayoutClient>
  );
}