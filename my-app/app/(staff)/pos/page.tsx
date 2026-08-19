import { redirect } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import PosClient from "./PosClient";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

const ALLOWED_ROLES = ["owner", "manager", "staff"];

export default async function PosPage() {
  const session = await getSession();

  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) {
    redirect("/login");
  }

  const businessId = BigInt(session.businessId);

  const [menuItems, locations] = await Promise.all([
    prisma.menuItem.findMany({
      where: { businessId, isActive: true },
      orderBy: { category: "asc" },
    }),
    prisma.location.findMany({
      where: { businessId, status: "active" },
      orderBy: { label: "asc" },
    }),
  ]);

  const serializedItems = menuItems.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category,
    price: Number(item.price),
    imageUrl: item.imageUrl,
  }));

  const serializedLocations = locations.map((loc) => ({
    id: loc.id.toString(),
    label: loc.label,
    type: loc.type,
  }));

  const categories = Array.from(new Set(serializedItems.map((i) => i.category)));

  return (
    <PosClient
      businessId={businessId.toString()}
      menuItems={serializedItems}
      locations={serializedLocations}
      categories={categories}
      
    />
  );
}