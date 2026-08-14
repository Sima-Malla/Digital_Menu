// app/(orders)/page.tsx
import { redirect } from "next/navigation";
import Sidebar from "@/components/HotelAdmin/Sidebar";
import { getOrdersByStatus } from "@/lib/orders";
import { getSession } from "@/lib/session";
import LiveOrdersBoard from "./LiveOrderBoard";

export default async function LiveOrdersPage() {
  const session = await getSession();
  if (!session?.businessId) {
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <LiveOrdersBoard
        initialNew={newOrders}
        initialPreparing={preparingOrders}
        initialReady={readyOrders}
        initialDelayed={delayedOrders}
      />
    </div>
  );
}