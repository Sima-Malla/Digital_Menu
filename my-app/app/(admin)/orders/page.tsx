"use client";
import {
  Search,
  Bell,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "@/components/HotelAdmin/Sidebar";

/* ─── Data ───────────────────────────────────────────────── */
const newOrders = [
  {
    id: "#ORD-2849",
    meta: "2 mins ago",
    tag: "PICKUP",
    items: [
      { name: "2x Truffle Risotto", price: "$48.00" },
      { name: "1x Wagyu Slider Box", price: "$32.00" },
    ],
  },
  {
    id: "#ORD-2850",
    meta: "Just now",
    tag: "DELIVERY",
    items: [{ name: "1x Signature Platter", price: "$65.00" }],
  },
];

const preparingOrders = [
  {
    id: "#ORD-2845",
    meta: "In kitchen: 12 mins",
    tag: "KITCHEN",
    heading: "Mesa 4 - VIP",
    items: ["3x Lobster Thermidor (No Parsley)"],
  },
  {
    id: "#ORD-2842",
    meta: "In kitchen: 18 mins",
    tag: "PICKUP",
    items: ["1x Vegan Power Bowl"],
  },
];

const readyOrders = [
  {
    id: "#ORD-2839",
    meta: "Ready for 5 mins",
    customer: "Johnathan Doe",
    note: "Courier arriving in 2m",
  },
];

const delayedOrders = [
  {
    id: "#ORD-2830",
    meta: "Delayed 12m",
    item: "12x Mixed Oyster Plate",
    issue: "Issue: Seafood prep backlog",
  },
];

/* ─── Top bar ────────────────────────────────────────────── */
function TopBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4 lg:px-8">
      <h1 className="text-lg font-extrabold text-orange-600">Live Orders</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search order ID..."
            className="w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 outline-none focus:border-orange-300"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Column header ──────────────────────────────────────── */
function ColumnHeader({ dot, label, count }: { dot: string; label: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <h2 className="text-sm font-bold text-gray-900">{label}</h2>
      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[10px] font-bold text-gray-600">
        {count}
      </span>
    </div>
  );
}

const tagStyle: Record<string, string> = {
  PICKUP: "bg-orange-100 text-orange-600",
  DELIVERY: "bg-blue-100 text-blue-600",
  KITCHEN: "bg-gray-100 text-gray-600",
};

/* ─── New order card ─────────────────────────────────────── */
function NewOrderCard({ order }: { order: (typeof newOrders)[number] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-orange-600">{order.id}</p>
          <p className="text-[11px] text-gray-400">{order.meta}</p>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${tagStyle[order.tag]}`}>
          {order.tag}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {order.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-800">{item.name}</span>
            <span className="text-gray-500">{item.price}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button className="flex-1 rounded-full bg-orange-500 py-2 text-xs font-bold text-white hover:bg-orange-600">
          Accept
        </button>
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50">
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Preparing order card ───────────────────────────────── */
function PreparingOrderCard({ order }: { order: (typeof preparingOrders)[number] }) {
  return (
    <div className="rounded-xl border-l-4 border-green-700 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold ">{order.id}</p>
          <p className="text-[11px] text-gray-400">{order.meta}</p>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${tagStyle[order.tag]}`}>
          {order.tag}
        </span>
      </div>

      {order.heading && (
        <p className="mt-3 text-sm font-bold text-gray-900">{order.heading}</p>
      )}
      <div className="mt-1.5 flex flex-col gap-1">
        {order.items.map((item) => (
          <p key={item} className="text-sm font-semibold ">
            {item}
          </p>
        ))}
      </div>

      <button className="mt-4 w-full rounded-full bg-green-300 py-2 text-xs font-bold text-green-900 hover:bg-green-400">
        Mark as Ready
      </button>
    </div>
  );
}

/* ─── Ready order card ───────────────────────────────────── */
function ReadyOrderCard({ order }: { order: (typeof readyOrders)[number] }) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
      <p className="text-sm font-bold text-gray-900">{order.id}</p>
      <p className="text-[11px] text-gray-500">{order.meta}</p>

      <p className="mt-3 text-sm font-bold text-gray-900">{order.customer}</p>
      <p className="text-[11px] text-gray-500">{order.note}</p>

      <button className="mt-4 w-full rounded-full bg-green-800 py-2 text-xs font-bold text-white hover:bg-green-900">
        Complete Order
      </button>
    </div>
  );
}

/* ─── Delayed order card ─────────────────────────────────── */
function DelayedOrderCard({ order }: { order: (typeof delayedOrders)[number] }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-red-600">{order.id}</p>
          <p className="text-[11px] font-semibold text-red-500">{order.meta}</p>
        </div>
        <AlertTriangle className="h-4 w-4 text-red-500" />
      </div>

      <p className="mt-3 text-sm font-bold text-gray-900">{order.item}</p>
      <p className="text-[11px] text-gray-500">{order.issue}</p>

      <div className="mt-4 flex items-center gap-2">
        <button className="flex-1 rounded-full border border-red-300 py-2 text-xs font-bold text-red-600 hover:bg-red-100">
          Notify Guest
        </button>
        <button className="flex-1 rounded-full bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700">
          Escalate
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function LiveOrdersPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="flex-1 overflow-x-auto px-6 py-6 lg:px-8">
          <div className="grid min-w-[900px] grid-cols-4 gap-5">
            <div>
              <ColumnHeader dot="bg-orange-500" label="New" count={newOrders.length} />
              <div className="flex flex-col gap-4">
                {newOrders.map((order) => (
                  <NewOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            <div>
              <ColumnHeader dot="bg-green-700" label="Preparing" count={preparingOrders.length} />
              <div className="flex flex-col gap-4">
                {preparingOrders.map((order) => (
                  <PreparingOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            <div>
              <ColumnHeader dot="bg-green-400" label="Ready" count={readyOrders.length} />
              <div className="flex flex-col gap-4">
                {readyOrders.map((order) => (
                  <ReadyOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            <div>
              <ColumnHeader dot="bg-red-500" label="Delayed" count={delayedOrders.length} />
              <div className="flex flex-col gap-4">
                {delayedOrders.map((order) => (
                  <DelayedOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}