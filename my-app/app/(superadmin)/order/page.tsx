import OrdersHeader from "@/components/Orders/Header";
import StatsCards from "@/components/Orders/StatsCards";
import FilterBar from "@/components/Orders/FilterBar";
import OrdersTable from "@/components/Orders/OrdersTable";
import Pagination from "@/components/Orders/Pagination";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <OrdersHeader />

      <div className="p-6 space-y-6">
        <StatsCards />

        <FilterBar />

        <OrdersTable />

        <Pagination />
      </div>
    </div>
  );
}