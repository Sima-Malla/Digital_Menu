import { redirect } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/HotelAdmin/Sidebar";
import TeamClient from "./TeamClient";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

function timeAgo(date: Date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return { label: "Online now", minutes: 0 };
  if (minutes < 60) return { label: `${minutes} mins ago`, minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: `${hours} hour${hours > 1 ? "s" : ""} ago`, minutes };
  const days = Math.floor(hours / 24);
  return { label: `${days} day${days > 1 ? "s" : ""} ago`, minutes };
}

export default async function TeamPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }

  const caller = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  if (!caller) redirect("/login");

  const staff = await prisma.staff.findMany({
    where: { businessId: caller.businessId },
    orderBy: { fullName: "asc" },
  });

  const serialized = staff.map((s) => {
    // updatedAt is the closest real signal we have to "last active" without
    // a separate activity-log table — it moves whenever their row changes,
    // including role/status edits, so treat this as approximate, not exact.
    const activity = timeAgo(s.updatedAt);
    return {
      id: s.id.toString(),
      name: s.fullName,
      email: s.email,
      position: s.position,
      role: s.role,
      isActive: s.isActive,
      isSelf: s.id === BigInt(session.userId),
      lastActiveLabel: activity.label,
      lastActiveMinutes: activity.minutes,
    };
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10">
        <TeamClient initialStaff={serialized} />
      </main>
    </div>
  );
}