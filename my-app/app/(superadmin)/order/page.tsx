"use client";

import { useMemo, useState } from "react";
import { Bell, CircleHelp, Download, Search, Filter, Eye, Pencil, Trash2, ShoppingBag, DollarSign, Store, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const allOrders = [
  { id: "#ORD-1001", restaurant: "Bistro Central", customer: "John Smith", type: "Dine In", amount: "$45.00", status: "Completed", time: "10:15 AM" },
  { id: "#ORD-1002", restaurant: "Pizza House", customer: "Emma Wilson", type: "Delivery", amount: "$28.50", status: "Preparing", time: "10:22 AM" },
  { id: "#ORD-1003", restaurant: "Burger Point", customer: "David Lee", type: "Take Away", amount: "$19.99", status: "Pending", time: "10:30 AM" },
  { id: "#ORD-1004", restaurant: "Food Hub", customer: "Sophia Brown", type: "Delivery", amount: "$62.80", status: "Cancelled", time: "10:40 AM" },
  { id: "#ORD-1005", restaurant: "Bistro Central", customer: "Michael Scott", type: "Dine In", amount: "$88.40", status: "Completed", time: "11:00 AM" },
  { id: "#ORD-1006", restaurant: "Pizza House", customer: "Sarah Parker", type: "Delivery", amount: "$37.20", status: "Preparing", time: "11:08 AM" },
  { id: "#ORD-1007", restaurant: "Burger Point", customer: "Daniel Kim", type: "Take Away", amount: "$24.90", status: "Pending", time: "11:16 AM" },
  { id: "#ORD-1008", restaurant: "Food Hub", customer: "Olivia Martin", type: "Delivery", amount: "$72.10", status: "Completed", time: "11:35 AM" },
];

const stats = [
  { title: "Total Orders", value: "12,845", change: "+12.5%", icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
  { title: "Gross Revenue", value: "$184,520", change: "+8.2%", icon: DollarSign, color: "bg-green-100 text-green-600" },
  { title: "Active Businesses", value: "248", change: "+15", icon: Store, color: "bg-orange-100 text-orange-600" },
  { title: "Pending Issues", value: "18", change: "-4", icon: AlertTriangle, color: "bg-red-100 text-red-600" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Preparing: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  // Draft values reflect what's typed/selected in the filter bar,
  // but don't affect the table until "Apply Filters" is clicked.
  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftBusiness, setDraftBusiness] = useState("");

  // Applied values are what actually drive the filtered table.
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedBusiness, setAppliedBusiness] = useState("");

  const handleApplyFilters = () => {
    console.log("Apply Filters clicked:", { draftSearch, draftStatus, draftBusiness });
    setAppliedSearch(draftSearch);
    setAppliedStatus(draftStatus);
    setAppliedBusiness(draftBusiness);
  };

  // Header search box filters live (independent of Apply Filters),
  // since it's meant as a quick lookup rather than part of the filter bar.
  const [headerSearch, setHeaderSearch] = useState("");

  const filtered = useMemo(() => {
    const s = (headerSearch || appliedSearch).toLowerCase();
    return allOrders.filter((o) => {
      const matchesSearch =
        !s || o.id.toLowerCase().includes(s) || o.customer.toLowerCase().includes(s);
      const matchesStatus = !appliedStatus || o.status === appliedStatus;
      const matchesBusiness = !appliedBusiness || o.restaurant === appliedBusiness;
      return matchesSearch && matchesStatus && matchesBusiness;
    });
  }, [headerSearch, appliedSearch, appliedStatus, appliedBusiness]);

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor and manage all customer orders.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search orders..."
                className="h-11 w-full sm:w-72 rounded-lg border border-gray-200 pl-10 pr-4 outline-none focus:border-[#0A5C8D]"
              />
            </div>
            <button className="flex h-11 items-center gap-2 rounded-lg bg-[#B54A00] px-5 text-white hover:bg-[#9d3f00]">
              <Download size={18} /> Export
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-lg border hover:bg-gray-100"><Bell size={18} /></button>
            <button className="flex h-11 w-11 items-center justify-center rounded-lg border hover:bg-gray-100"><CircleHelp size={18} /></button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">{item.value}</h2>
                    <p className="mt-3 text-sm font-medium text-green-600">{item.change} this month</p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon size={28} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                placeholder="Search Order ID or Customer..."
                className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 outline-none focus:border-[#0A5C8D]"
              />
            </div>
            <select className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D] min-w-[140px]">
              <option>Last 30 Days</option>
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
            <select
              value={draftBusiness}
              onChange={(e) => setDraftBusiness(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D] min-w-[150px]"
            >
              <option value="">All Businesses</option>
              <option value="Bistro Central">Bistro Central</option>
              <option value="Pizza House">Pizza House</option>
              <option value="Food Hub">Food Hub</option>
              <option value="Burger Point">Burger Point</option>
            </select>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D] min-w-[130px]"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={handleApplyFilters}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0A5C8D] px-5 text-white hover:bg-[#084d74] whitespace-nowrap"
            >
              <Filter size={18} /> Apply Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Order Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{order.id}</td>
                    <td className="px-6 py-4">{order.restaurant}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4">{order.type}</td>
                    <td className="px-6 py-4 font-medium">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{order.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="rounded-lg border p-2 hover:bg-gray-100"><Eye size={16} /></button>
                        <button className="rounded-lg border p-2 hover:bg-blue-100"><Pencil size={16} className="text-blue-600" /></button>
                        <button className="rounded-lg border p-2 hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">1–{filtered.length}</span> of <span className="font-semibold">{filtered.length}</span> orders
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border p-2 hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <button className="h-10 w-10 rounded-lg bg-[#0A5C8D] text-white">1</button>
            <button className="rounded-lg border p-2 hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Rows per page</span>
            <select className="rounded-lg border px-3 py-2 outline-none">
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
