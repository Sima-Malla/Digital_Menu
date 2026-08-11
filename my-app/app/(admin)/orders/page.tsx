// app/(orders)/page.tsx
import Sidebar from "@/components/HotelAdmin/Sidebar";
import { getOrdersByStatus } from "@/lib/orders";
import LiveOrdersBoard from "./LiveOrderBoard";

export default async function LiveOrdersPage() {
  // In a real DB this would be `await getOrdersByStatus(...)`.
  const newOrders = getOrdersByStatus("new");
  const preparingOrders = getOrdersByStatus("preparing");
  const readyOrders = getOrdersByStatus("ready");
  const delayedOrders = getOrdersByStatus("delayed");

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