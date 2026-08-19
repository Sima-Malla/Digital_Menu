"use client";

import {
  Wallet,
  ShoppingBag,
  FileText,
  Star,
  Calendar,
  ChevronDown,
  Download,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { AnalyticsData } from "@/lib/admin/analytics";

/* ─── Donut chart (unchanged, generic) ───────────────────── */

function DonutChart({
  data,
  size = 176,
  strokeWidth = 22,
  centerLabel,
  centerSubLabel,
}: {
  data: { value?: number; pct?: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}) {
  let cumulative = 0;
  const stops = data
    .map((d) => {
      const value = d.value ?? d.pct ?? 0;
      const start = cumulative;
      cumulative += value;
      return `${d.color} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${stops})` }}
    >
      <div
        className="absolute flex flex-col items-center justify-center rounded-full bg-white"
        style={{ inset: strokeWidth }}
      >
        {centerLabel && <span className="text-2xl font-bold text-gray-900">{centerLabel}</span>}
        {centerSubLabel && (
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {centerSubLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  label,
  value,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
        </div>
        {badge && (
          <span className="flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-1 text-[11px] font-bold text-green-600">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            {badge}
          </span>
        )}
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

const heatCellStyle = ["bg-orange-50", "bg-orange-100", "bg-orange-300", "bg-orange-500", "bg-orange-600"];

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [salesView, setSalesView] = useState<"revenue" | "orders">("revenue");

  const trendValues = data.salesTrend.map((d) => (salesView === "revenue" ? d.revenue : d.orders));
  const maxSales = Math.max(1, ...trendValues);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1320px] px-8 py-8">
        {/* ── Page Header ─────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Reports</h1>
            <p className="mt-1 text-[13px] text-gray-400">
              Real-time performance tracking for {data.businessName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4 text-gray-400" />
              Last 30 Days
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition hover:bg-orange-600"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────── */}
        <div className="grid grid-cols-4 gap-5">
          <StatCard
            icon={Wallet}
            iconBg="bg-orange-100"
            iconColor="text-orange-500"
            label="TOTAL REVENUE"
            value={`Rs. ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          />
          <StatCard
            icon={ShoppingBag}
            iconBg="bg-blue-100"
            iconColor="text-blue-500"
            label="TOTAL ORDERS"
            value={data.totalOrders.toLocaleString()}
          />
          <StatCard
            icon={FileText}
            iconBg="bg-gray-100"
            iconColor="text-gray-500"
            label="AVG. ORDER VALUE"
            value={`Rs. ${data.avgOrderValue.toFixed(2)}`}
          />
          <StatCard
            icon={Star}
            iconBg="bg-gray-100"
            iconColor="text-gray-500"
            label="TOP CATEGORY"
            value={data.topCategory}
          />
        </div>

        {/* ── Sales Trend + Order Channels ────────────── */}
        <div className="mt-5 grid grid-cols-3 gap-5">
          <section className="col-span-2 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-gray-900">Sales Trend</h2>
              <div className="flex rounded-full bg-gray-100 p-1">
                {(["revenue", "orders"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setSalesView(view)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize transition ${
                      salesView === view
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {data.salesTrend.length === 0 ? (
              <p className="mt-8 py-16 text-center text-sm text-gray-400">No order data in this period yet.</p>
            ) : (
              <div className="mt-8 flex h-72 items-end gap-2">
                {data.salesTrend.map((d, i) => {
                  const v = salesView === "revenue" ? d.revenue : d.orders;
                  const heightPct = (v / maxSales) * 100;
                  const shade =
                    heightPct >= 90
                      ? "bg-orange-600"
                      : heightPct >= 70
                      ? "bg-orange-500"
                      : heightPct >= 50
                      ? "bg-orange-400"
                      : heightPct >= 30
                      ? "bg-orange-300"
                      : "bg-orange-200";
                  return (
                    <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                      <div
                        className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${shade}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${d.label}: ${salesView === "revenue" ? `Rs. ${v.toFixed(2)}` : v}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-bold text-gray-900">Order Channels</h2>
            {data.orderChannels.length === 0 ? (
              <p className="mt-6 text-sm text-gray-400">No orders yet.</p>
            ) : (
              <>
                <div className="mt-6 flex justify-center">
                  <DonutChart
                    data={data.orderChannels}
                    centerLabel={data.totalOrders.toLocaleString()}
                    centerSubLabel="Total"
                  />
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {data.orderChannels.map((c) => (
                    <div key={c.label} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 font-medium text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.label}
                      </span>
                      <span className="font-bold text-gray-800">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── Top Selling + Peak Hours ─────────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-bold text-gray-900">Top Selling Menu Items</h2>

            {data.topItems.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No sales data yet.</p>
            ) : (
              <table className="mt-4 w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Item Name
                    </th>
                    <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Qty Sold
                    </th>
                    <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topItems.map((item) => (
                    <tr key={item.name} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5 pr-3">
                        <span className="text-[13px] font-semibold text-gray-800">{item.name}</span>
                      </td>
                      <td className="py-3.5 text-[13px] font-medium text-gray-600">{item.qty}</td>
                      <td className="py-3.5 text-[13px] font-semibold text-gray-800">
                        Rs. {item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-gray-900">Peak Hours Heatmap</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mon – Sun</span>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              {data.heatmapMatrix.map((row, r) => (
                <div key={data.heatmapDays[r]} className="flex gap-1.5">
                  {row.map((intensity, c) => (
                    <div key={c} className={`h-5 flex-1 rounded ${heatCellStyle[intensity]}`} />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between text-[10px] font-semibold text-gray-400">
              {data.heatmapHourLabels.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
          </section>
        </div>

        {/* ── Returning Customers + Satisfaction ──────── */}
        <div className="mb-10 mt-5 grid grid-cols-2 gap-5">
          <section className="flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6">
            <DonutChart
              data={[
                { value: data.returningCustomerPct, color: "#f97316" },
                { value: 100 - data.returningCustomerPct, color: "#e5e7eb" },
              ]}
              size={112}
              strokeWidth={14}
              centerLabel={`${data.returningCustomerPct}%`}
            />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Returning Customers</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                Share of customers who placed more than one order in this period.
              </p>
              <div className="mt-3 flex items-center gap-4 text-[12px] font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  Returning
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                  New
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-bold text-gray-900">Customer Satisfaction</h2>
            <p className="mt-4 text-sm text-gray-400">
              No review or rating data is collected yet — this section will populate once a
              ratings feature is added.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}