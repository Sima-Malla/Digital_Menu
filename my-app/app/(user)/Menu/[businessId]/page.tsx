import { notFound } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import MenuContent from "./MenuContent";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export default async function MenuPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;

  let businessIdBig: bigint;
  try {
    businessIdBig = BigInt(businessId);
  } catch {
    notFound();
  }

  const business = await prisma.business.findUnique({
    where: { id: businessIdBig! },
    select: { id: true, businessName: true, businessType: true, businessAddress: true },
  });

  if (!business) notFound();

  const items = await prisma.menuItem.findMany({
    where: { businessId: businessIdBig!, isActive: true },
    orderBy: { name: "asc" },
  });

  const serializedItems = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description ?? "",
    category: item.category,
    price: Number(item.price),
    imageUrl: item.imageUrl,
  }));

  const categories = Array.from(new Set(serializedItems.map((i) => i.category)));

  return (
    <MenuContent
      businessId={business.id.toString()}
      businessName={business.businessName ?? "Restaurant"}
      businessType={business.businessType ?? ""}
      businessAddress={business.businessAddress ?? ""}
      categories={categories}
      items={serializedItems}
    />
  );
}