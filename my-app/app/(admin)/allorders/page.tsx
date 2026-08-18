import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/orders";
import Sidebar from "@/components/HotelAdmin/Sidebar";
import AllOrdersClient from "./AllOrdersClient";

export default async function AllOrdersPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager" && session.role !== "staff")) {
    redirect("/login");
  }

  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  if (!staff) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <AllOrdersClient />
      </div>
    </div>
  );
}
