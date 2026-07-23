"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  MoreVertical,
  AlertTriangle,
  ShoppingBag,
  BedDouble,
  ChefHat,
  Volume2,
  VolumeX,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";

type OrderType = "Dine-in" | "Room Service" | "Pickup";
type OrderStatus = "new" | "preparing" | "ready" | "delayed";
type PaymentStatus = "paid" | "unpaid" | "billed-to-room";

interface LineItem {
  qty: number;
  name: string;
  price?: number;
  note?: string;
}

interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdMinsAgo: number;
  items: LineItem[];
  guestOrTable?: string;
  roomNumber?: string;
  issue?: string;
}

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; className: string; icon: React.ElementType }> = {
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  unpaid: { label: "Unpaid", className: "bg-red-50 text-red-600", icon: CircleDollarSign },
  "billed-to-room": { label: "Billed to Room", className: "bg-blue-50 text-blue-600", icon: CircleDollarSign },
};

const TYPE_BADGE: Record<OrderType, { icon: React.ElementType; className: string }> = {
  "Dine-in": { icon: ChefHat, className: "bg-slate-100 text-slate-600" },
  "Room Service": { icon: BedDouble, className: "bg-blue-50 text-blue-600" },
  Pickup: { icon: ShoppingBag, className: "bg-orange-50 text-orange-600" },
};

const initialOrders: Order[] = [
  {
    id: "ORD-2849",
    type: "Pickup",
    status: "new",
    paymentStatus: "paid",
    createdMinsAgo: 2,
    items: [
      { qty: 2, name: "Truffle Risotto", price: 48 },
      { qty: 1, name: "Wagyu Slider Box", price: 32 },
    ],
  },
  {
    id: "ORD-2850",
    type: "Room Service",
    status: "new",
    paymentStatus: "billed-to-room",
    createdMinsAgo: 0,
    roomNumber: "Room 412",
    items: [{ qty: 1, name: "Signature Platter", price: 65 }],
  },
  {
    id: "ORD-2845",
    type: "Dine-in",
    status: "preparing",
    paymentStatus: "unpaid",
    createdMinsAgo: 12,
    guestOrTable: "Mesa 4 · VIP",
    items: [{ qty: 3, name: "Lobster Thermidor", note: "No Parsley" }],
  },
  {
    id: "ORD-2842",
    type: "Pickup",
    status: "preparing",
    paymentStatus: "unpaid",
    createdMinsAgo: 18,
    items: [{ qty: 1, name: "Vegan Power Bowl" }],
  },
  {
    id: "ORD-2839",
    type: "Room Service",
    status: "ready",
    paymentStatus: "billed-to-room",
    createdMinsAgo: 5,
    guestOrTable: "Johnathan Doe",
    roomNumber: "Room 208",
    items: [],
  },
  {
    id: "ORD-2830",
    type: "Dine-in",
    status: "delayed",
    paymentStatus: "unpaid",
    createdMinsAgo: 12,
    issue: "Seafood prep backlog",
    items: [{ qty: 12, name: "Mixed Oyster Plate" }],
  },
];

const COLUMNS: { key: OrderStatus; label: string; dotClass: string }[] = [
  { key: "new", label: "New", dotClass: "bg-orange-500" },
  { key: "preparing", label: "Preparing", dotClass: "bg-emerald-600" },
  { key: "ready", label: "Ready", dotClass: "bg-emerald-400" },
  { key: "delayed", label: "Delayed", dotClass: "bg-red-500" },
];

function elapsedClass(mins: number) {
  if (mins >= 15) return "text-red-600";
  if (mins >= 8) return "text-amber-600";
  return "text-slate-400";
}

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | OrderType>("All");
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = search.trim() === "" || o.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || o.type === typeFilter;
      const matchesPayment = !unpaidOnly || o.paymentStatus === "unpaid";
      return matchesSearch && matchesType && matchesPayment;
    });
  }, [orders, search, typeFilter, unpaidOnly]);

  function advance(id: string, next: OrderStatus) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: next } : o)));
  }

  function requestComplete(id: string) {
    const order = orders.find((o) => o.id === id);
    if (order && order.paymentStatus === "unpaid") {
      setPendingCompleteId(id); // ask for confirmation first
    } else {
      complete(id);
    }
  }

  function complete(id: string) {
    // In a real app this would move the order to an order-history table.
    setOrders((os) => os.filter((o) => o.id !== id));
    setPendingCompleteId(null);
  }

  function markAsPaid(id: string) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, paymentStatus: "paid" } : o)));
  }

  const pendingOrder = orders.find((o) => o.id === pendingCompleteId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-orange-600 sm:text-2xl">Live Orders</h1>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:w-56"
              />
            </div>
            <button
              type="button"
              onClick={() => setSoundOn((v) => !v)}
              aria-label="Toggle new order sound"
              className={`rounded-full p-2 ${
                soundOn ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-400"
              }`}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* Type filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(["All", "Dine-in", "Room Service", "Pickup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-orange-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-slate-200" />

          <button
            type="button"
            onClick={() => setUnpaidOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              unpaidOnly
                ? "bg-red-600 text-white"
                : "bg-white text-red-500 ring-1 ring-inset ring-red-200 hover:bg-red-50"
            }`}
          >
            <CircleDollarSign size={13} />
            Unpaid only
          </button>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnOrders = filteredOrders.filter((o) => o.status === col.key);
            return (
              <div key={col.key} className="flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotClass}`} />
                  <h2 className="text-sm font-semibold text-slate-800">{col.label}</h2>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  {columnOrders.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                      No orders here
                    </div>
                  )}

                  {columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAccept={() => advance(order.id, "preparing")}
                      onMarkReady={() => advance(order.id, "ready")}
                      onComplete={() => requestComplete(order.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unpaid order — confirm before completing */}
      {pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <CircleDollarSign size={18} className="text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              Payment not received for #{pendingOrder.id}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500">
              This order is still marked <span className="font-medium text-red-600">Unpaid</span>. Complete
              it anyway, or mark it as paid first.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setPendingCompleteId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  markAsPaid(pendingOrder.id);
                  complete(pendingOrder.id);
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Mark Paid &amp; Complete
              </button>
              <button
                onClick={() => complete(pendingOrder.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Complete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order card
// ---------------------------------------------------------------------------
function OrderCard({
  order,
  onAccept,
  onMarkReady,
  onComplete,
}: {
  order: Order;
  onAccept: () => void;
  onMarkReady: () => void;
  onComplete: () => void;
}) {
  const borderColor =
    order.status === "new"
      ? "border-l-orange-500"
      : order.status === "preparing"
      ? "border-l-emerald-600"
      : order.status === "ready"
      ? "border-l-emerald-400"
      : "border-l-red-500";

  const bg = order.status === "ready" ? "bg-emerald-50/40" : order.status === "delayed" ? "bg-red-50/40" : "bg-white";

  const Badge = TYPE_BADGE[order.type];
  const BadgeIcon = Badge.icon;

  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${borderColor} ${bg} p-4 shadow-sm`}>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">#{order.id}</p>
          {order.status === "delayed" ? (
            <p className="flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertTriangle size={12} />
              Delayed {order.createdMinsAgo}m
            </p>
          ) : (
            <p className={`text-xs ${elapsedClass(order.createdMinsAgo)}`}>
              {order.status === "ready"
                ? `Ready for ${order.createdMinsAgo} mins`
                : order.createdMinsAgo === 0
                ? "Just now"
                : `${order.status === "preparing" ? "In kitchen: " : ""}${order.createdMinsAgo} mins ago`}
            </p>
          )}
        </div>

        <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${Badge.className}`}>
          <BadgeIcon size={11} />
          {order.type}
        </span>
      </div>

      {order.guestOrTable && (
        <p className="mb-1.5 text-sm font-medium italic text-slate-700">{order.guestOrTable}</p>
      )}

      {order.roomNumber && (
        <p className="mb-1.5 text-xs font-medium text-blue-600">{order.roomNumber}</p>
      )}

      <div className="mb-2">
        {(() => {
          const p = PAYMENT_BADGE[order.paymentStatus];
          const PIcon = p.icon;
          return (
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${p.className}`}>
              <PIcon size={11} />
              {p.label}
            </span>
          );
        })()}
      </div>

      {order.items.length > 0 && (
        <ul className="mb-3 space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm text-slate-600">
              <span>
                <span className="font-medium text-slate-800">{item.qty}x</span> {item.name}
                {item.note && <span className="ml-1 text-xs text-orange-500">({item.note})</span>}
              </span>
              {item.price !== undefined && <span className="text-slate-500">${item.price.toFixed(2)}</span>}
            </li>
          ))}
        </ul>
      )}

      {order.status === "ready" && order.type === "Room Service" && (
        <p className="mb-3 text-xs text-emerald-700">Staff dispatched to room</p>
      )}

      {order.status === "delayed" && order.issue && (
        <p className="mb-3 text-xs text-red-600">Issue: {order.issue}</p>
      )}

      {/* Actions */}
      {order.status === "new" && (
        <div className="flex items-center gap-2">
          <button
            onClick={onAccept}
            className="flex-1 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Accept
          </button>
          <button
            aria-label="More options"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      )}

      {order.status === "preparing" && (
        <button
          onClick={onMarkReady}
          className="w-full rounded-lg bg-emerald-100 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
        >
          Mark as Ready
        </button>
      )}

      {order.status === "ready" && (
        <button
          onClick={onComplete}
          className="w-full rounded-lg bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Complete Order
        </button>
      )}

      {order.status === "delayed" && (
        <div className="flex items-center gap-2">
          <button className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Notify Guest
          </button>
          <button className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700">
            Escalate
          </button>
        </div>
      )}
    </div>
  );
}
