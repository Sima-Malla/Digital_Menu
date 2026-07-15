import Header from "@/components/SuperAdmin/Header";
import StatsCard from "@/components/SuperAdmin/StatsCard";
import RegistrationQueue from "@/components/SuperAdmin/RegistrationQueue";
import ActiveTerritories from "@/components/SuperAdmin/ActiveTerritories";
import PerformanceTable from "@/components/SuperAdmin/PerformanceTable";

import {
  DollarSign,
  Building2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      <Header />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="TOTAL PLATFORM REV"
          value="$1,284,500"
          footer="+12.5% vs last month"
          icon={DollarSign}
        />

        <StatsCard
          title="ACTIVE BUSINESSES"
          value="482"
          subtitle="Across 24 chains"
          icon={Building2}
        />

        <StatsCard
          title="PENDING APPROVALS"
          value="18"
          footer="Review Queue"
          icon={Clock3}
          highlight
        />

        <StatsCard
          title="SYSTEM HEALTH"
          value="99.9%"
          subtitle="Uptime (Last 30d)"
          icon={ShieldCheck}
        />
      </div>

      {/* Queue + Territories */}
      <div className="grid grid-cols-12 gap-6">
  {/* Left */}
  <div className="col-span-9">
    <RegistrationQueue />
  </div>

  {/* Right */}
  <div className="col-span-3">
    <ActiveTerritories />
  </div>
</div>

      {/* Performance Table */}
      <PerformanceTable />
    </div>
  );
}