"use client";

import { useEffect, useState } from "react";
import {
 Search, Eye, Pencil, Trash2,
  ShoppingBag, DollarSign, Activity, AlertTriangle, ChevronLeft, ChevronRight,
  X, Loader2, Printer,
} from "lucide-react";
import {
  getAdminOrders, getAdminOrderStats, getAdminOrderDetail,
  updateAdminOrderAction, deleteAdminOrder, AdminOrder, AdminOrderDetail,
} from "@/app/actions/admin/allorders";

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

type Stats = { totalOrders: number; grossRevenue: number; activeOrders: number; delayedOrders: number };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, grossRevenue: 0, activeOrders: 0, delayedOrders: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewItem, setViewItem] = useState<AdminOrderDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editItem, setEditItem] = useState<AdminOrderDetail | null>(null);
  const [editForm, setEditForm] = useState({ status: "", paymentStatus: "", delayReason: "" });
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function printBill(order: AdminOrderDetail) {
    const win = window.open("", "_blank", "width=420,height=650");
    if (!win) return;
    const itemRows = order.items
      .map(
        (it) =>
          `<tr>
            <td class="item-name">${it.name}${it.notes ? `<br/><em class="note">${it.notes}</em>` : ""}</td>
            <td class="qty">${it.quantity}</td>
            <td class="price">${it.unitPrice}</td>
            <td class="subtotal">${it.subtotal}</td>
          </tr>`
      )
      .join("");
    const payClass = order.paymentStatus === "paid" ? "paid" : "unpaid";
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt #${order.id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',monospace;font-size:13px;color:#111;background:#fff}
    .page{width:320px;margin:0 auto;padding:28px 20px}
    .center{text-align:center}
    .biz-name{font-size:17px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
    .biz-addr{font-size:11px;color:#666;margin-top:3px}
    .receipt-tag{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#999;margin-top:6px}
    hr{border:none;border-top:1px dashed #bbb;margin:12px 0}
    .meta{width:100%;border-collapse:collapse;font-size:12px}
    .meta td{padding:3px 0}
    .meta td:first-child{color:#888;width:42%}
    .meta td:last-child{font-weight:600;text-align:right}
    .items{width:100%;border-collapse:collapse;font-size:12px}
    .items thead th{font-size:10px;text-transform:uppercase;color:#999;padding:4px 3px;border-bottom:1px solid #ddd}
    .items thead th.item-name{text-align:left}
    .items thead th.qty{text-align:center}
    .items thead th.price,.items thead th.subtotal{text-align:right}
    .items tbody td{padding:6px 3px;border-bottom:1px solid #f0f0f0;vertical-align:top}
    .items tbody td.item-name{text-align:left}
    .items tbody td.qty{text-align:center;color:#555}
    .items tbody td.price{text-align:right;color:#555}
    .items tbody td.subtotal{text-align:right;font-weight:600}
    .note{font-size:10px;color:#aaa;font-style:italic}
    .total-row{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
    .total-label{font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
    .total-amount{font-size:22px;font-weight:700;color:#e07010}
    .pay-row{display:flex;justify-content:space-between;font-size:12px;margin-top:5px}
    .pay-label{color:#888}
    .paid{color:#16a34a;font-weight:700;text-transform:uppercase}
    .unpaid{color:#dc2626;font-weight:700;text-transform:uppercase}
    .footer{text-align:center;font-size:11px;color:#aaa;margin-top:6px;line-height:1.6}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body>
<div class="page">
  <div class="center">
    <div class="biz-name">${order.businessName}</div>
    ${order.businessAddress ? `<div class="biz-addr">${order.businessAddress}</div>` : ""}
    <div class="receipt-tag">&#9733; Official Receipt &#9733;</div>
  </div>
  <hr/>
  <table class="meta">
    <tr><td>Order #</td><td>${order.id}</td></tr>
    <tr><td>Date</td><td>${order.orderedAt}</td></tr>
    <tr><td>Customer</td><td>${order.customer}</td></tr>
    <tr><td>Phone</td><td>${order.customerPhone}</td></tr>
    <tr><td>Location</td><td>${order.location}</td></tr>
    <tr><td>Order Type</td><td style="text-transform:capitalize">${order.orderType}</td></tr>
  </table>
  <hr/>
  <table class="items">
    <thead><tr>
      <th class="item-name">Item</th>
      <th class="qty">Qty</th>
      <th class="price">Price</th>
      <th class="subtotal">Total</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <hr/>
  <div class="total-row">
    <span class="total-label">Total</span>
    <span class="total-amount">${order.totalAmount}</span>
  </div>
  <div class="pay-row">
    <span class="pay-label">Payment</span>
    <span class="${payClass}">${order.paymentStatus.toUpperCase()}</span>
  </div>
  <hr/>
  <div class="footer">&#9829; Thank you for dining with us! &#9829;<br/>Please come again</div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
    win.document.write(html);
    win.document.close();
  }

  async function loadOrders() {
    setLoading(true);
    const data = await getAdminOrders({ search, status, page, pageSize });
    setOrders(data.orders);
    setTotal(data.total);
    setLoading(false);
  }

  async function loadStats() {
    const data = await getAdminOrderStats();
    setStats(data);
  }

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, pageSize]);

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
    const detail = await getAdminOrderDetail(id);
    setViewLoading(false);
    if (detail) setViewItem(detail);
  }

  async function handleEditOpen(id: string) {
    const detail = await getAdminOrderDetail(id);
    if (!detail) return;
    setEditItem(detail);
    setEditForm({ status: detail.status, paymentStatus: detail.paymentStatus, delayReason: detail.delayReason });
  }

  async function handleEditSave() {
    if (!editItem) return;
    setSubmitting(true);
    const res = await updateAdminOrderAction(editItem.id, editForm);
    setSubmitting(false);
    if (res.success) {
      setEditItem(null);
      loadOrders();
      loadStats();
    } else {
      alert(res.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    const previous = orders;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    const res = await deleteAdminOrder(id);
    if (!res.success) {
      setOrders(previous);
      alert(res.message);
    } else {
      setTotal((t) => t - 1);
      loadStats();
    }
  }

  const statCards = [
    { title: "Total Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
    { title: "Gross Revenue", value: `Rs. ${stats.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
    { title: "Active Orders", value: stats.activeOrders.toLocaleString(), icon: Activity, color: "bg-orange-100 text-orange-600" },
    { title: "Delayed Orders", value: stats.delayedOrders.toLocaleString(), icon: AlertTriangle, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className=" top-0 z-20 border-b bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">All Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor and manage your orders.</p>
          </div>
        
        </div>
      </header>

      <div className="p-4 space-y-6 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Customer or Phone..."
                className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 outline-none focus:border-[#F97316]"
              />
            </div>
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

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
              <span className="mt-2 text-sm font-medium text-gray-500">Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-6 py-4">Order ID</th>
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
                      <td className="px-6 py-4">
                        <div>{order.customer}</div>
                        <div className="text-xs text-gray-400">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">{order.orderType}</td>
                      <td className="px-6 py-4 font-medium">{order.amount}</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4">{order.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleView(order.id)} className="rounded-lg border p-2 hover:bg-gray-100">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditOpen(order.id)} className="rounded-lg border p-2 hover:bg-blue-100">
                            <Pencil size={16} className="text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(order.id)} className="rounded-lg border p-2 hover:bg-red-100">
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-500">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

      {(viewItem || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {viewLoading || !viewItem ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#F97316]" />
              </div>
            ) : (
              <>
                {/* ── Bill ── */}
                <div className="p-6 font-mono text-sm text-gray-800">
                  {/* Header */}
                  <div className="text-center">
                    <p className="text-lg font-bold tracking-wide">{viewItem.businessName}</p>
                    {viewItem.businessAddress && (
                      <p className="text-xs text-gray-500">{viewItem.businessAddress}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Tel: {viewItem.customerPhone}</p>
                    <div className="my-3 border-t border-dashed border-gray-300" />
                    <p className="text-[11px] uppercase tracking-widest text-gray-400">Receipt</p>
                  </div>

                  {/* Order meta */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order #</span>
                      <span className="font-semibold">{viewItem.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span>{viewItem.orderedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer</span>
                      <span>{viewItem.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Table / Location</span>
                      <span>{viewItem.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="capitalize">{viewItem.orderType}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="my-3 border-t border-dashed border-gray-300" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      <span className="w-5/12">Item</span>
                      <span className="w-2/12 text-center">Qty</span>
                      <span className="w-2/12 text-right">Price</span>
                      <span className="w-3/12 text-right">Total</span>
                    </div>
                    {viewItem.items.map((it, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs">
                          <span className="w-5/12 truncate font-medium">{it.name}</span>
                          <span className="w-2/12 text-center text-gray-500">{it.quantity}</span>
                          <span className="w-2/12 text-right text-gray-500">{it.unitPrice}</span>
                          <span className="w-3/12 text-right font-semibold">{it.subtotal}</span>
                        </div>
                        {it.notes && (
                          <p className="ml-1 text-[10px] italic text-gray-400">↳ {it.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="my-3 border-t border-dashed border-gray-300" />
                  <div className="flex justify-between text-base font-bold">
                    <span>TOTAL</span>
                    <span className="text-[#F97316]">{viewItem.totalAmount}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-gray-500">Payment</span>
                    <span className={`font-semibold capitalize ${
                      viewItem.paymentStatus === "paid" ? "text-green-600" : "text-red-500"
                    }`}>{viewItem.paymentStatus}</span>
                  </div>

                  {/* Footer */}
                  <div className="my-3 border-t border-dashed border-gray-300" />
                  <p className="text-center text-[10px] text-gray-400">Thank you for dining with us!</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t p-4">
                  <button
                    onClick={() => printBill(viewItem)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F97316] py-2.5 text-sm font-bold text-white hover:bg-[#e06610] transition"
                  >
                    <Printer size={16} /> Print Bill
                  </button>
                  <button
                    onClick={() => setViewItem(null)}
                    className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">Edit Order #{editItem.id}</h2>
              <button onClick={() => setEditItem(null)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#F97316]"
                >
                  <option value="new">New</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              {editForm.status === "delayed" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Delay Reason</label>
                  <input
                    value={editForm.delayReason}
                    onChange={(e) => setEditForm({ ...editForm, delayReason: e.target.value })}
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#F97316]"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#F97316]"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
              <button onClick={() => setEditItem(null)} className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100 transition">Cancel</button>
              <button onClick={handleEditSave} disabled={submitting} className="rounded-xl bg-[#F97316] px-5 py-2 text-sm text-white hover:bg-[#e06610] transition disabled:opacity-50">
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}