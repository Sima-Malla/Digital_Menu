"use client";

import { useState } from "react";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Timer,
  Flame,
  Snowflake,
} from "lucide-react";

const weeklySales = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 60 },
  { day: "Wed", value: 52 },
  { day: "Thu", value: 78 },
  { day: "Fri", value: 95 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 70 },
];

const peakHours = [
  { hour: "10AM", value: 20 },
  { hour: "12PM", value: 85 },
  { hour: "2PM", value: 55 },
  { hour: "4PM", value: 30 },
  { hour: "6PM", value: 70 },
  { hour: "8PM", value: 100 },
  { hour: "10PM", value: 40 },
];

const bestSellers = [
  { name: "Truffle Risotto", orders: 142 },
  { name: "Signature Platter", orders: 118 },
  { name: "Lobster Thermidor", orders: 97 },
];

const worstSellers = [
  { name: "Mixed Oyster Plate", orders: 6 },
  { name: "Kale Caesar Salad", orders: 9 },
  { name: "Sparkling Lemonade", orders: 11 },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("This Week");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">Performance insights for Grand Plaza Heights.</p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last 90 Days</option>
          </select>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={DollarSign} iconBg="bg-emerald-50 text-emerald-600" label="Avg. Order Value" value="$38.60" />
          <StatCard icon={Timer} iconBg="bg-orange-50 text-orange-600" label="Avg. Fulfillment Time" value="14.5 min" />
          <StatCard icon={TrendingUp} iconBg="bg-blue-50 text-blue-600" label="Total Orders" value="596" trend="+9% vs last week" />
          <StatCard icon={Clock} iconBg="bg-slate-100 text-slate-600" label="Table/Room Turnover" value="3.2x" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales trend */}
          <Card title="Sales Trend">
            <div className="flex h-40 items-end justify-between gap-2">
              {weeklySales.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full max-w-[26px] rounded-t-md bg-orange-500/80"
                    style={{ height: `${d.value}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Peak hours */}
          <Card title="Peak Hours">
            <div className="flex h-40 items-end justify-between gap-2">
              {peakHours.map((h) => (
                <div key={h.hour} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full max-w-[26px] rounded-t-md bg-blue-500/70"
                    style={{ height: `${h.value}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{h.hour}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Best sellers */}
          <Card title="Best-Selling Items" icon={Flame}>
            <div className="space-y-3">
              {bestSellers.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                  <span className="text-xs text-slate-400">{item.orders} orders</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Worst sellers */}
          <Card title="Least-Selling Items" icon={Snowflake}>
            <div className="space-y-3">
              {worstSellers.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                  <span className="text-xs text-slate-400">{item.orders} orders</span>
                </div>
              ))}
            </div>
          </Card>
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
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={18} />
      </span>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-emerald-600">{trend}</p>}
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-orange-500" />}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
