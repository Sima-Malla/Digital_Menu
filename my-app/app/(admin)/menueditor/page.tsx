import { redirect } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/HotelAdmin/Sidebar";
import MenuEditorClient from "./MenuEditorClient";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

// Server Components can pass Prisma results to Client Components only if
// they're plain serializable data — BigInt, Decimal, and Date all need
// converting to string/number first.
export default async function MenuEditorPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }

  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  if (!staff) redirect("/login");

  const businessId = staff.businessId;

  const [items, specials] = await Promise.all([
    prisma.menuItem.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    prisma.special.findMany({
      where: { businessId },
      include: { menuItem: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedItems = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price.toString(),
    calories: item.calories,
    imageUrl: item.imageUrl,
    isActive: item.isActive,
  }));

  const serializedSpecials = specials.map((s) => ({
    id: s.id.toString(),
    menuItemId: s.menuItemId.toString(),
    dishName: s.menuItem.name,
    dishImageUrl: s.menuItem.imageUrl,
    badgeLabel: s.badgeLabel,
    scheduleType: s.scheduleType as "recurring" | "one-time",
    weekday: s.weekday,
    date: s.date ? s.date.toISOString().slice(0, 10) : null,
    imageUrl: s.imageUrl,
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10">
        <MenuEditorClient initialItems={serializedItems} initialSpecials={serializedSpecials} />
      </main>
    </div>
  );
}