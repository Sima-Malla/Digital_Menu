"use client";
import {
  Search,
  Bell,
  ChevronDown,
  Filter,
  DollarSign,
  UtensilsCrossed,
  Clock,
} from "lucide-react";
import Image from "next/image";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  Cell,
} from "recharts";
import Sidebar from "@/components/HotelAdmin/Sidebar";

/* ─── Data ───────────────────────────────────────────────── */
const stats = [
  {
    icon: DollarSign,
    iconBg: "bg-orange-100 text-orange-500",
    label: "TODAY'S SALES",
    value: "$4,280.50",
    badge: "↗ 12%",
    badgeStyle: "bg-green-100 text-green-600",
  },
  {
    icon: UtensilsCrossed,
    iconBg: "bg-green-100 text-green-600",
    label: "ACTIVE ORDERS",
    value: "24",
    badge: "● 8 Live",
    badgeStyle: "text-gray-500",
    badgeIsDot: true,
  },
  {
    icon: Clock,
    iconBg: "bg-gray-100 text-gray-500",
    label: "AVG PREP TIME",
    value: "18.5m",
    badge: "↘ 4m",
    badgeStyle: "bg-rose-100 text-rose-500",
  },
];

const weeklySales = [
  { day: "MON", value: 38 },
  { day: "TUE", value: 52 },
  { day: "WED", value: 44 },
  { day: "THU", value: 60 },
  { day: "FRI", value: 68 },
  { day: "SAT", value: 92 },
  { day: "SUN", value: 58 },
];

const popularDishes = [
  { name: "Truffle Wagyu Burger", meta: "84 orders today", revenue: "+$1.2k", img: "/vegmomo.jpg" },
  { name: "Pacific Salmon Bowl", meta: "62 orders today", revenue: "+$940", img: "/vegmomo.jpg" },
  { name: "Artisan Margherita", meta: "45 orders today", revenue: "+$620", img: "/vegmomo.jpg" },
];

const recentOrders = [
  { id: "#GH-9402", customer: "Julian Smith", initials: "JS", avatarBg: "bg-gray-200 text-gray-600", items: "2x Wagyu Burger, 1x Coke", total: "$42.00", status: "Delivered" },
  { id: "#GH-9403", customer: "Anna Maria", initials: "AM", avatarBg: "bg-orange-100 text-orange-600", items: "1x Salmon Bowl, 1x Green Tea", total: "$28.50", status: "Preparing" },
  { id: "#GH-9404", customer: "Robert King", initials: "RK", avatarBg: "bg-green-100 text-green-600", items: "3x Artisan Pizza", total: "$54.00", status: "Pending" },
  { id: "#GH-9405", customer: "Laura G.", initials: "LG", avatarBg: "bg-pink-100 text-pink-500", items: "1x Pasta Alfredo, 1x Wine", total: "$35.00", status: "Delivered" },
];

const statusStyle: Record<string, string> = {
  Delivered: "bg-green-100 text-green-600",
  Preparing: "bg-orange-500 text-white",
  Pending: "bg-gray-100 text-gray-500",
};

/* ─── Header ─────────────────────────────────────────────── */
function Header() {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 lg:px-8">
      <h1 className="text-xl font-extrabold text-orange-600">GourmetHub</h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, menus..."
            className="w-64 rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 outline-none focus:border-orange-300"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
          <Image src="/hotel.png" alt="Profile" width={36} height={36} className="h-full w-full object-cover" />
        </div>
      </div>
    </header>
  );
}

/* ─── Stat card ──────────────────────────────────────────── */
function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
          <stat.icon className="h-4.5 w-4.5" />
        </span>
        <span
          className={`rounded-full px-2 py-1 text-[11px] font-bold ${
            stat.badgeIsDot ? "text-gray-500" : stat.badgeStyle
          }`}
        >
          {stat.badgeIsDot ? (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {stat.badge.replace("● ", "")}
            </span>
          ) : (
            stat.badge
          )}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-gray-400">{stat.label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
    </div>
  );
}

/* ─── Weekly sales chart ─────────────────────────────────── */
function WeeklySalesChart() {
  const maxIndex = weeklySales.reduce(
    (best, cur, i) => (cur.value > weeklySales[best].value ? i : best),
    0
  );

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
          <BarChart data={weeklySales} barCategoryGap="28%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {weeklySales.map((entry, i) => (
                <Cell key={entry.day} fill={i === maxIndex ? "#C2410C" : "#F3C6AB"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Popular dishes ─────────────────────────────────────── */
function PopularDishes() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Popular Dishes</h2>
      <div className="mt-4 flex flex-col gap-4">
        {popularDishes.map((dish) => (
          <div key={dish.name} className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image src={dish.img} alt={dish.name} width={44} height={44} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">{dish.name}</p>
              <p className="text-[11px] text-gray-400">{dish.meta}</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-green-600">{dish.revenue}</span>
          </div>
        ))}
      </div>
      <button className="mt-5 w-full rounded-full border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:border-orange-300">
        View Detailed Inventory
      </button>
    </div>
  );
}

/* ─── Recent orders table ────────────────────────────────── */
function RecentOrders() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
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
            {recentOrders.map((order) => (
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
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3">
                  <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                    Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center">
        <a href="#" className="text-xs font-semibold text-gray-500 hover:text-gray-700">
          View All Orders
        </a>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Morning, Grand Plaza Manager</h1>
              <p className="text-sm text-gray-400">Your kitchen is running efficiently. Here's what's happening today.</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full border border-orange-300 px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50">
                Download Report
              </button>
              <button className="rounded-full bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-800">
                + New Promotion
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WeeklySalesChart />
            </div>
            <PopularDishes />
          </div>

          <div className="mt-6">
            <RecentOrders />
          </div>
        </main>
      </div>
    </div>
  );
}