"use client";

import { Filter, Calendar, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";

const performanceData = [
  {
    chain: "The Steakhouse Group",
    locations: 45,
    revenue: "$420,500",
    rating: 4.8,
    orders: "1,240",
    growth: "+8.2%",
    positive: true,
    status: "STABLE",
  },
  {
    chain: "Sushi Zen Networks",
    locations: 28,
    revenue: "$310,200",
    rating: 4.6,
    orders: "890",
    growth: "+5.1%",
    positive: true,
    status: "STABLE",
  },
  {
    chain: "Rustic Pizzas Inc",
    locations: 52,
    revenue: "$295,000",
    rating: 4.2,
    orders: "2,105",
    growth: "-2.4%",
    positive: false,
    status: "ACTION REQ",
  },
];

export default function PerformanceTable() {
  return (
    <div className="rounded-2xl border border-orange-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-orange-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Chain Performance Index
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cross-reference metrics for top restaurant groups
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-orange-200 px-4 py-2 text-sm hover:bg-orange-50 transition">
            <Filter size={16} />
            Filter
          </button>

          <button className="flex items-center gap-2 rounded-lg border border-orange-200 px-4 py-2 text-sm hover:bg-orange-50 transition">
            <Calendar size={16} />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left">Chain Name</th>
              <th className="py-4 text-left">Total Locations</th>
              <th className="py-4 text-left">Revenue (MTD)</th>
              <th className="py-4 text-left">Avg Rating</th>
              <th className="py-4 text-left">Active Orders</th>
              <th className="py-4 text-left">Growth</th>
              <th className="py-4 text-left">System State</th>
            </tr>
          </thead>

          <tbody>
            {performanceData.map((item, index) => (
              <tr
                key={index}
                className="border-t border-orange-100 hover:bg-orange-50 transition"
              >
                <td className="px-6 py-5 font-medium text-gray-800">
                  {item.chain}
                </td>

                <td>{item.locations}</td>

                <td>{item.revenue}</td>

                <td>
                  <div className="flex items-center gap-1 font-semibold text-orange-600">
                    {item.rating}
                    <Star size={14} fill="currentColor" />
                  </div>
                </td>

                <td>{item.orders}</td>

                <td>
                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      item.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.positive ? (
                      <ArrowUpRight size={15} />
                    ) : (
                      <ArrowDownRight size={15} />
                    )}

                    {item.growth}
                  </div>
                </td>

                <td>
                  {item.status === "STABLE" ? (
                    <span className="rounded-md border border-green-500 px-3 py-1 text-xs font-semibold text-green-600">
                      STABLE
                    </span>
                  ) : (
                    <span className="rounded-md border border-orange-500 px-3 py-1 text-xs font-semibold text-orange-600">
                      ACTION REQ
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}