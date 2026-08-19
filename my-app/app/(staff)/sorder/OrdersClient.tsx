"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { getStaffOrders, type OrderRow, type OrderStatus, type PaymentStatus } from "@/app/actions/staff/staff-orders";

const STATUS_STYLE: Record<OrderStatus, string> = {
  New: "bg-orange-50 text-orange-600",
  Preparing: "bg-blue-50 text-blue-600",
  Ready: "bg-emerald-50 text-emerald-700",
  Delayed: "bg-red-50 text-red-600",
  Completed: "bg-slate-100 text-slate-600",
  Cancelled: "bg-slate-100 text-slate-400",
};

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Unpaid: "bg-red-50 text-red-600",
  "Billed to Room": "bg-blue-50 text-blue-600",
};

const PAGE_SIZE = 6;

export default function OrdersClient({ businessName }: { businessName: string }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  function loadOrders() {
    setLoading(true);
    startTransition(async () => {
      const res = await getStaffOrders({
        search,
        type: typeFilter,
        status: statusFilter,
        payment: paymentFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(res.rows);
      setTotal(res.total);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, paymentFilter, page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadOrders();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function exportCSV() {
    const headers = ["Order ID", "Type", "Guest", "Items", "Total", "Payment", "Status", "Time"];
    const csvRows = rows.map((o) =>
      [o.id, o.type, o.guest, o.items, o.total, o.payment, o.status, o.time]
        .map((f) => `"${String(f).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Full order history for {businessName}.</p>
          </div>
          <button
            onClick={exportCSV}
            disabled={rows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Guest name, phone, table/room..."
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <SelectField
              label="Order Type"
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
              options={["All Types", "Dine-in", "Room Service", "Pickup", "Delivery"]}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={["All Status", "New", "Preparing", "Ready", "Delayed", "Completed", "Cancelled"]}
            />
            <SelectField
              label="Payment"
              value={paymentFilter}
              onChange={(v) => {
                setPaymentFilter(v);
                setPage(1);
              }}
              options={["All Payments", "Paid", "Unpaid", "Billed to Room"]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="mt-2 text-sm font-medium text-slate-500">Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <th className="whitespace-nowrap px-4 py-3">Order ID</th>
                    <th className="whitespace-nowrap px-4 py-3">Type</th>
                    <th className="whitespace-nowrap px-4 py-3">Guest / Room / Table</th>
                    <th className="whitespace-nowrap px-4 py-3">Items</th>
                    <th className="whitespace-nowrap px-4 py-3">Total</th>
                    <th className="whitespace-nowrap px-4 py-3">Payment</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-orange-600">#{o.id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{o.type}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{o.guest}</td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-slate-500">{o.items}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">Rs. {o.total.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${PAYMENT_STYLE[o.payment]}`}>
                          {o.payment}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">{o.time}</td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                        No orders match your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, total)} of {total} orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium ${
                    page === i + 1 ? "bg-orange-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}