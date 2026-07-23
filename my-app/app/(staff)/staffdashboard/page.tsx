"use client";

import {
  ClipboardList,
  CheckCircle2,
  Activity,
  AlertTriangle,
  ChefHat,
  BedDouble,
  ShoppingBag,
  Timer,
  BedSingle,
  ArrowUpRight,
} from "lucide-react";

const newOrdersPreview = [
  { id: "ORD-2849", type: "Pickup", detail: "2x Truffle Risotto, 1x Wagyu Slider Box", mins: 2 },
  { id: "ORD-2850", type: "Room Service", detail: "Room 412 · 1x Signature Platter", mins: 0 },
  { id: "ORD-2851", type: "Dine-in", detail: "Table 6 · 2x Grilled Salmon", mins: 4 },
];

const topItems = [
  { name: "Truffle Risotto", orders: 34 },
  { name: "Signature Platter", orders: 28 },
  { name: "Lobster Thermidor", orders: 21 },
  { name: "Vegan Power Bowl", orders: 17 },
];

const typeBreakdown = [
  { label: "Dine-in", value: 48, color: "bg-slate-700" },
  { label: "Room Service", value: 32, color: "bg-blue-500" },
  { label: "Pickup", value: 20, color: "bg-orange-500" },
];

export default function StaffDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Today's overview for Grand Plaza Heights.</p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ClipboardList}
            iconBg="bg-orange-50 text-orange-600"
            label="Total Orders Today"
            value="128"
            trend="+12% vs yesterday"
            trendUp
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
            label="Orders Completed Today"
            value="112"
            trend="+8% vs yesterday"
            trendUp
          />
          <StatCard
            icon={Activity}
            iconBg="bg-blue-50 text-blue-600"
            label="Active Orders"
            value="11"
            trend="New + Preparing + Ready"
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="bg-red-50 text-red-600"
            label="Delayed Orders"
            value="1"
            trend="Needs attention"
            valueClass="text-red-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 xl:col-span-2">
            {/* Live snapshot */}
            <Card title="New Orders" description="Latest orders waiting to be accepted.">
              <div className="space-y-3">
                {newOrdersPreview.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-orange-600">
                        #{o.id} <span className="ml-1 text-xs text-slate-500">· {o.type}</span>
                      </p>
                      <p className="text-xs text-slate-500">{o.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {o.mins === 0 ? "Just now" : `${o.mins}m ago`}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                View All Live Orders
                <ArrowUpRight size={13} />
              </button>
            </Card>

            {/* Top selling items */}
            <Card title="Top Selling Items Today" icon={ChefHat}>
              <div className="space-y-3">
                {topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-600">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                    <span className="text-xs text-slate-400">{item.orders} orders</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Delayed alert */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={16} />
                <p className="text-sm font-semibold">1 order needs attention</p>
              </div>
              <p className="mt-1 text-xs text-red-600">
                #ORD-2830 delayed 12m · Seafood prep backlog
              </p>
              <button className="mt-3 w-full rounded-lg bg-red-600 py-2 text-xs font-medium text-white hover:bg-red-700">
                Go to Live Orders
              </button>
            </div>

            {/* Order type breakdown */}
            <Card title="Order Type Breakdown">
              <div className="space-y-3">
                {typeBreakdown.map((t) => (
                  <div key={t.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-600">{t.label}</span>
                      <span className="font-medium text-slate-700">{t.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${t.color}`}
                        style={{ width: `${t.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Average prep time */}
            <Card title="Average Prep Time" icon={Timer}>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold text-slate-800">
                  14.5<span className="text-base text-slate-400"> min</span>
                </p>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Within SLA
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Order accepted → marked ready</p>
            </Card>

            {/* Room/Table occupancy */}
            <Card title="Room & Table Activity" icon={BedDouble}>
              <div className="grid grid-cols-2 gap-3">
                <OccupancyBox icon={BedSingle} label="Rooms Ordering" value="9 / 40" />
                <OccupancyBox icon={ShoppingBag} label="Tables Active" value="6 / 18" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  trend,
  trendUp,
  valueClass = "text-slate-900",
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={18} />
      </span>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
      {trend && (
        <p className={`mt-1 text-xs ${trendUp ? "text-emerald-600" : "text-slate-400"}`}>{trend}</p>
      )}
    </div>
  );
}

function Card({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-orange-500" />}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {description && <p className="-mt-3 mb-4 text-xs text-slate-500">{description}</p>}
      {children}
    </div>
  );
}

function OccupancyBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <Icon size={16} className="mb-2 text-slate-400" />
      <p className="text-sm font-semibold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
