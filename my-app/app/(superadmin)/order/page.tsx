"use client";

import { useEffect, useState } from "react";
import {
  Download, Search, Eye,
  ShoppingBag, Store, AlertTriangle, ChevronLeft, ChevronRight,
  X, Loader2,
} from "lucide-react";
import {
  getOrders, getBusinesses, getStats, getOrderDetail, exportOrdersAction, SuperadminOrder,
} from "@/app/actions/superadmin/order";
import SuperAdminNotificationBell from "@/components/SuperAdmin/SuperAdminNotificationBell";

const statusColor: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Preparing: "bg-yellow-100 text-yellow-700",
  Ready: "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Delayed: "bg-red-100 text-red-700",
};

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "new", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "delayed", label: "Delayed" },
];

function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[label] ?? "bg-gray-100 text-gray-700"}`}>
      {label}
    </span>
  );
}

type Business = { id: string; name: string };
type Stats = { totalOrders: number; grossRevenue: number; activeBusinesses: number; pendingIssues: number };
type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetail>>>;

export default function OrdersPage() {
  const [orders, setOrders] = useState<SuperadminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, grossRevenue: 0, activeBusinesses: 0, pendingIssues: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewItem, setViewItem] = useState<OrderDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function loadOrders() {
    setLoading(true);
    const data = await getOrders({ search, status, businessId, page, pageSize });
    setOrders(data.orders);
    setTotal(data.total);
    setLoading(false);
  }

  async function loadStats() {
    const data = await getStats();
    setStats(data);
  }

  // Initial load — businesses + stats once
  useEffect(() => {
    getBusinesses().then(setBusinesses);
    loadStats();
  }, []);

  // Status / business / page / pageSize change — refetch immediately
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, businessId, page, pageSize]);

  // Search text — debounce, reset to page 1
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadOrders();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleView(id: string) {
    setViewLoading(true);
    const detail = await getOrderDetail(id);
    setViewLoading(false);
    if (detail) setViewItem(detail);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportOrdersAction({ search, status, businessId });
      if (!data || data.length === 0) {
        alert("No orders found to export.");
        return;
      }

      const headers = [
        "Order ID",
        "Business",
        "Customer Name",
        "Customer Phone",
        "Location",
        "Order Type",
        "Amount (NPR)",
        "Status",
        "Payment Status",
        "Date & Time",
      ];

      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          [
            `"#${row.id}"`,
            `"${row.business.replace(/"/g, '""')}"`,
            `"${row.customer.replace(/"/g, '""')}"`,
            `"${row.customerPhone.replace(/"/g, '""')}"`,
            `"${row.location.replace(/"/g, '""')}"`,
            `"${row.orderType.replace(/"/g, '""')}"`,
            row.amount,
            `"${row.status.replace(/"/g, '""')}"`,
            `"${row.paymentStatus.replace(/"/g, '""')}"`,
            `"${new Date(row.orderedAt).toLocaleString("en-US")}"`,
          ].join(",")
        ),
      ];

      const csvBlob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export orders.");
    } finally {
      setExporting(false);
    }
  }

  const statCards = [
    { title: "Total Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
    { title: "Active Businesses", value: stats.activeBusinesses.toLocaleString(), icon: Store, color: "bg-orange-100 text-orange-600" },
    { title: "Pending Issues", value: stats.pendingIssues.toLocaleString(), icon: AlertTriangle, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Orders Management</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor and manage all customer orders.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex h-11 items-center gap-2 rounded-lg bg-[#F97316] px-5 text-white hover:bg-[#e06610] transition disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download size={18} /> Export
                </>
              )}
            </button>
            <SuperAdminNotificationBell />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow-md sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 sm:text-sm">{item.title}</p>
                    <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-3xl">{item.value}</h2>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${item.color}`}>
                    <Icon size={22} className="sm:hidden" />
                    <Icon size={28} className="hidden sm:block" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar — no submit button, everything auto-applies */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Order ID, Customer or Phone..."
                className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 outline-none focus:border-[#F97316]"
              />
            </div>
            <select
              value={businessId}
              onChange={(e) => { setBusinessId(e.target.value); setPage(1); }}
              className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D] sm:min-w-[150px]"
            >
              <option value="">All Businesses</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D] sm:min-w-[130px]"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
              <span className="mt-2 text-sm font-medium text-gray-500">Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
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
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">#{order.id}</td>
                      <td className="px-6 py-4">{order.business}</td>
                      <td className="px-6 py-4">
                        <div>{order.customer}</div>
                        <div className="text-xs text-gray-400">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">{order.orderType}</td>
                      <td className="px-6 py-4 font-medium">{order.amount}</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4">{order.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button onClick={() => handleView(order.id)} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition">
                            <Eye size={16} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-semibold">{total}</span> orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border p-2 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F97316] text-white">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border p-2 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Rows per page</span>
            <div className="flex gap-1">
              {[10, 25, 50].map((size) => (
                <button
                  key={size}
                  onClick={() => { setPageSize(size); setPage(1); }}
                  className={`rounded-lg border px-3 py-2 ${pageSize === size ? "border-[#F97316] text-[#F97316]" : "text-gray-600"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {(viewItem || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setViewItem(null)}><X size={22} /></button>
            </div>
            {viewLoading || !viewItem ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#F97316]" />
              </div>
            ) : (
              <>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p><span className="font-medium">Order:</span> #{viewItem.id}</p>
                    <p><span className="font-medium">Business:</span> {viewItem.business}</p>
                    <p><span className="font-medium">Customer:</span> {viewItem.customer}</p>
                    <p><span className="font-medium">Phone:</span> {viewItem.customerPhone}</p>
                    <p><span className="font-medium">Email:</span> {viewItem.customerEmail}</p>
                    <p><span className="font-medium">Location:</span> {viewItem.location}</p>
                    <p><span className="font-medium">Type:</span> {viewItem.orderType}</p>
                    <p><span className="font-medium">Payment:</span> {viewItem.paymentStatus}</p>
                  </div>
                  <div>
                    <StatusBadge status={viewItem.status} />
                    {viewItem.delayReason && (
                      <p className="mt-2 text-sm text-red-600">Reason: {viewItem.delayReason}</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700">Items</p>
                    <div className="space-y-2 rounded-xl border p-3">
                      {viewItem.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{it.quantity}× {it.name}{it.notes ? ` (${it.notes})` : ""}</span>
                          <span className="font-medium">{it.unitPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F97316]/10 p-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <h2 className="text-3xl font-bold text-[#F97316]">{viewItem.totalAmount}</h2>
                  </div>
                </div>
                <div className="flex justify-end border-t p-5 sm:p-6">
                  <button onClick={() => setViewItem(null)} className="rounded-xl bg-[#F97316] px-5 py-2 text-white hover:bg-[#e06610] transition">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}