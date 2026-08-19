import { redirect } from "next/navigation";
import { getOrdersByStatus } from "@/lib/orders";
import { getSession } from "@/lib/session";
import LiveOrdersBoard from "./LiveOrderBoard";

const ALLOWED_ROLES = ["owner", "manager", "staff"];

export default async function LiveOrdersPage() {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) {
    redirect("/login");
  }

  const businessId = BigInt(session.businessId);

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