import { redirect } from "next/navigation";
import { getOrdersByStatus, prisma } from "@/lib/orders";
import { getSession } from "@/lib/session";
import LiveOrdersBoard from "./LiveOrderBoard";

export default async function LiveOrdersPage() {
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

  const [newOrders, preparingOrders, readyOrders, delayedOrders] = await Promise.all([
    getOrdersByStatus(businessId, "new"),
    getOrdersByStatus(businessId, "preparing"),
    getOrdersByStatus(businessId, "ready"),
    getOrdersByStatus(businessId, "delayed"),
  ]);

  return (
    <LiveOrdersBoard
      initialNew={newOrders}
      initialPreparing={preparingOrders}
      initialReady={readyOrders}
      initialDelayed={delayedOrders}
    />
  );
}