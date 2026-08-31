import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Activity,
  AlertTriangle,
  ChefHat,
  Timer,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getStaffDashboardData } from "@/lib/staff/dashboard";
import NotificationBell from "@/components/NotificationBell";

function minutesAgoLabel(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins === 0 ? "Just now" : `${mins}m ago`;
}

export default async function StaffDashboardPage() {
  const session = await getSession();
  if (!session || !session.businessId) redirect("/login");

  const data = await getStaffDashboardData(BigInt(session.businessId));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Today's overview for {data.businessName}.</p>
          </div>
          <NotificationBell />
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ClipboardList}
            iconBg="bg-orange-50 text-orange-600"
            label="Total Orders Today"
            value={data.totalOrdersToday.toString()}
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
            label="Orders Completed Today"
            value={data.completedOrdersToday.toString()}
          />
          <StatCard
            icon={Activity}
            iconBg="bg-blue-50 text-blue-600"
            label="Active Orders"
            value={data.activeOrdersCount.toString()}
            trend="New + Preparing + Ready"
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="bg-red-50 text-red-600"
            label="Delayed Orders"
            value={data.delayedOrdersCount.toString()}
            trend={data.delayedOrdersCount > 0 ? "Needs attention" : "All on track"}
            valueClass={data.delayedOrdersCount > 0 ? "text-red-600" : "text-slate-900"}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 xl:col-span-2">
            <Card title="New Orders" description="Latest orders waiting to be accepted.">
              {data.newOrdersPreview.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No new orders right now.</p>
              ) : (
                <div className="space-y-3">
                  {data.newOrdersPreview.map((o) => (
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
                      <span className="shrink-0 text-xs text-slate-400">{minutesAgoLabel(o.orderedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/live-orders"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                View All Live Orders
                <ArrowUpRight size={13} />
              </Link>
            </Card>

            <Card title="Top Selling Items Today" icon={ChefHat}>
              {data.topItemsToday.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No sales yet today.</p>
              ) : (
                <div className="space-y-3">
                  {data.topItemsToday.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-600">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                      <span className="text-xs text-slate-400">{item.orders} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {data.delayedAlert && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={16} />
                  <p className="text-sm font-semibold">
                    {data.delayedOrdersCount} order{data.delayedOrdersCount > 1 ? "s" : ""} need{data.delayedOrdersCount === 1 ? "s" : ""} attention
                  </p>
                </div>
                <p className="mt-1 text-xs text-red-600">
                  #{data.delayedAlert.orderId} delayed {data.delayedAlert.minutesAgo}m · {data.delayedAlert.reason}
                </p>
                <Link
                  href="/live-orders"
                  className="mt-3 block w-full rounded-lg bg-red-600 py-2 text-center text-xs font-medium text-white hover:bg-red-700"
                >
                  Go to Live Orders
                </Link>
              </div>
            )}

            <Card title="Order Type Breakdown">
              {data.typeBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No orders yet today.</p>
              ) : (
                <div className="space-y-3">
                  {data.typeBreakdown.map((t) => (
                    <div key={t.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-slate-600">{t.label}</span>
                        <span className="font-medium text-slate-700">{t.value}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${t.color}`} style={{ width: `${t.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Average Prep Time" icon={Timer}>
              {data.avgPrepMinutes === null ? (
                <p className="text-sm text-slate-400">No completed orders yet today.</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-semibold text-slate-800">
                    {data.avgPrepMinutes}
                    <span className="text-base text-slate-400"> min</span>
                  </p>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-400">Order placed → marked ready/completed</p>
            </Card>

            <Card title="Table Activity" icon={ShoppingBag}>
              <div className="rounded-lg bg-slate-50 p-3">
                <ShoppingBag size={16} className="mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">
                  {data.tableActivity.active} / {data.tableActivity.total}
                </p>
                <p className="text-xs text-slate-500">Tables with an active order</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  trend,
  valueClass = "text-slate-900",
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  trend?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={18} />
      </span>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
      {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
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