"use client";

import {
  Search, ChevronDown, Filter, Banknote, UtensilsCrossed, Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { DashboardData } from "@/app/actions/admin/dashboard";

const statusStyle: Record<string, string> = {
  Completed: "bg-green-100 text-green-600",
  Preparing: "bg-orange-500 text-white",
  New:       "bg-blue-100 text-blue-600",
  Ready:     "bg-purple-100 text-purple-600",
  Delayed:   "bg-red-100 text-red-600",
};

function WeeklySalesChart({ data }: { data: { day: string; value: number }[] }) {
  const maxIndex = data.reduce((best, cur, i) => (cur.value > data[best].value ? i : best), 0);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Weekly Sales Trend</h2>
          <p className="text-xs text-gray-400">Revenue performance across the last 7 days</p>
        </div>
        <button className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
          Last 7 Days <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="28%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              tickFormatter={(v) => `Rs.${v}`}
              width={56}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              formatter={(value: unknown) => [`Rs. ${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={entry.day} fill={i === maxIndex ? "#C2410C" : "#F3C6AB"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { businessName, stats, weeklySales, popularDishes, recentOrders } = data;

  const statCards = [
    {
      icon: Banknote,
      iconBg: "bg-orange-100 text-orange-500",
      label: "TODAY'S SALES",
      value: `Rs. ${stats.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      badge: `${stats.activeOrders} Active`,
      badgeStyle: "bg-green-100 text-green-600",
    },
    {
      icon: UtensilsCrossed,
      iconBg: "bg-green-100 text-green-600",
      label: "ACTIVE ORDERS",
      value: stats.activeOrders.toString(),
      badge: `${stats.liveOrders} Live`,
      badgeIsDot: true,
    },
    {
      icon: Clock,
      iconBg: "bg-gray-100 text-gray-500",
      label: "MENU ITEMS",
      value: stats.totalMenuItems.toString(),
      badge: "Active",
      badgeStyle: "bg-gray-100 text-gray-500",
    },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <main className="flex-1 px-6 py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome, {businessName}</h1>
            <p className="text-sm text-gray-400">Here&apos;s what&apos;s happening today.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/allorders" className="rounded-full border border-orange-300 px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50">
              View All Orders
            </Link>
            <Link href="/menueditor" className="rounded-full bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600">
              + Add Menu Item
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${s.badgeIsDot ? "text-gray-500" : s.badgeStyle}`}>
                  {s.badgeIsDot ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {s.badge}
                    </span>
                  ) : s.badge}
                </span>
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-gray-400">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart + Popular dishes */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklySalesChart data={weeklySales} />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">Popular Dishes</h2>
            {popularDishes.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No order data yet.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {popularDishes.map((dish) => (
                  <div key={dish.id} className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={dish.imageUrl || "/vegmomo.jpg"}
                        alt={dish.name}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{dish.name}</p>
                      <p className="text-[11px] text-gray-400">{dish.orderCount} orders</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-green-600">
                      Rs. {dish.revenue.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/menueditor" className="mt-5 block w-full rounded-full border border-gray-200 py-2.5 text-center text-xs font-semibold text-gray-600 hover:border-orange-300">
              View Menu Editor
            </Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <div className="flex gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
                <Filter className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 font-bold">Order ID</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Items</th>
                  <th className="pb-3 font-bold">Total</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">No orders yet.</td></tr>
                ) : recentOrders.map((order) => (
                  <tr key={order.id} className="text-gray-700">
                    <td className="py-3 font-semibold">{order.id}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${order.avatarBg}`}>
                          {order.initials}
                        </span>
                        {order.customer}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{order.items}</td>
                    <td className="py-3 font-semibold">{order.total}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href="/allorders" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <Link href="/allorders" className="text-xs font-semibold text-gray-500 hover:text-gray-700">
              View All Orders →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
