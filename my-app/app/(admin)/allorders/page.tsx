import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/orders";
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
    <div className="min-w-0 flex-1">
      <AllOrdersClient />
    </div>
  );
}
