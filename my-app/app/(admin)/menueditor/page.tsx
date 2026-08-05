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

  const businessId = BigInt(session.userId);

  const [items, specials] = await Promise.all([
    prisma.menuItem.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    prisma.special.findMany({
      where: { businessId },
      include: { menuItem: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initialItems = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price.toString(),
    calories: item.calories,
    imageUrl: item.imageUrl,
    isActive: item.isActive,
  }));

  const initialSpecials = specials.map((s) => ({
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
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 lg:px-8">
          <MenuEditorClient initialItems={initialItems} initialSpecials={initialSpecials} />
        </main>
      </div>
    </div>
  );
}