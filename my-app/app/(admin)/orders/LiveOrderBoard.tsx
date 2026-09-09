// app/(orders)/LiveOrdersBoard.tsx
"use client";

import { useState, useTransition } from "react";
import { Search, Bell, MoreVertical, AlertTriangle } from "lucide-react";
import type { Order } from "@/lib/orders"; // was "@/lib/orders" pointing at fake data before
import {
  acceptOrder,
  markAsReady,
  completeOrder,
  escalateOrder,
  notifyGuest,
} from "../../actions/LiveOrders";

const tagStyle: Record<string, string> = {
  PICKUP: "bg-orange-100 text-orange-600",
  DELIVERY: "bg-blue-100 text-blue-600",
  KITCHEN: "bg-gray-100 text-gray-600",
};


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
        
      </div>
    </div>
  );
}

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

function NewOrderCard({
  order,
  onAccept,
  pending,
}: {
  order: Order;
  onAccept: (id: string) => void;
  pending: boolean;
}) {
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
        <button
          disabled={pending}
          onClick={() => onAccept(order.id)}
          className="flex-1 rounded-full bg-orange-500 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {pending ? "Accepting..." : "Accept"}
        </button>
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50">
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PreparingOrderCard({
  order,
  onMarkReady,
  pending,
}: {
  order: Order;
  onMarkReady: (id: string) => void;
  pending: boolean;
}) {
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

      {order.heading && <p className="mt-3 text-sm font-bold text-gray-900">{order.heading}</p>}
      <div className="mt-1.5 flex flex-col gap-1">
        {order.items.map((item) => (
          <p key={item.name} className="text-sm font-semibold ">
            {item.name}
          </p>
        ))}
      </div>

      <button
        disabled={pending}
        onClick={() => onMarkReady(order.id)}
        className="mt-4 w-full rounded-full bg-green-300 py-2 text-xs font-bold text-green-900 hover:bg-green-400 disabled:opacity-50"
      >
        {pending ? "Updating..." : "Mark as Ready"}
      </button>
    </div>
  );
}

function ReadyOrderCard({
  order,
  onComplete,
  pending,
}: {
  order: Order;
  onComplete: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
      <p className="text-sm font-bold text-gray-900">{order.id}</p>
      <p className="text-[11px] text-gray-500">{order.meta}</p>

      <p className="mt-3 text-sm font-bold text-gray-900">{order.customer}</p>
      <p className="text-[11px] text-gray-500">{order.note}</p>

      <button
        disabled={pending}
        onClick={() => onComplete(order.id)}
        className="mt-4 w-full rounded-full bg-green-800 py-2 text-xs font-bold text-white hover:bg-green-900 disabled:opacity-50"
      >
        {pending ? "Completing..." : "Complete Order"}
      </button>
    </div>
  );
}

function DelayedOrderCard({
  order,
  onNotify,
  onEscalate,
  pending,
}: {
  order: Order;
  onNotify: (id: string) => void;
  onEscalate: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-red-600">{order.id}</p>
          <p className="text-[11px] font-semibold text-red-500">{order.meta}</p>
        </div>
        <AlertTriangle className="h-4 w-4 text-red-500" />
      </div>

      <p className="mt-3 text-sm font-bold text-gray-900">{order.items[0]?.name}</p>
      <p className="text-[11px] text-gray-500">{order.issue}</p>

      <div className="mt-4 flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() => onNotify(order.id)}
          className="flex-1 rounded-full border border-red-300 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          Notify Guest
        </button>
        <button
          disabled={pending}
          onClick={() => onEscalate(order.id)}
          className="flex-1 rounded-full bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Escalate
        </button>
      </div>
    </div>
  );
}

export default function LiveOrdersBoard({
  initialNew,
  initialPreparing,
  initialReady,
  initialDelayed,
}: {
  initialNew: Order[];
  initialPreparing: Order[];
  initialReady: Order[];
  initialDelayed: Order[];
}) {
  const [newOrders, setNewOrders] = useState(initialNew);
  const [preparingOrders, setPreparingOrders] = useState(initialPreparing);
  const [readyOrders, setReadyOrders] = useState(initialReady);
  const [delayedOrders, setDelayedOrders] = useState(initialDelayed);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAccept(id: string) {
    const order = newOrders.find((o) => o.id === id);
    if (!order) return;
    setPendingId(id);
    setNewOrders((prev) => prev.filter((o) => o.id !== id));
    setPreparingOrders((prev) => [{ ...order, meta: "In kitchen: 0 mins" }, ...prev]);
    startTransition(async () => {
      const res = await acceptOrder(id);
      if (!res.success) console.error(res.error);
      setPendingId(null);
    });
  }

  function handleMarkReady(id: string) {
    const order = preparingOrders.find((o) => o.id === id);
    if (!order) return;
    setPendingId(id);
    setPreparingOrders((prev) => prev.filter((o) => o.id !== id));
    setReadyOrders((prev) => [{ ...order, meta: "Ready now" }, ...prev]);
    startTransition(async () => {
      const res = await markAsReady(id);
      if (!res.success) console.error(res.error);
      setPendingId(null);
    });
  }

  function handleComplete(id: string) {
    setPendingId(id);
    setReadyOrders((prev) => prev.filter((o) => o.id !== id));
    startTransition(async () => {
      const res = await completeOrder(id);
      if (!res.success) console.error(res.error);
      setPendingId(null);
    });
  }

  function handleEscalate(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await escalateOrder(id);
      if (!res.success) console.error(res.error);
      setPendingId(null);
    });
  }

  function handleNotify(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await notifyGuest(id);
      if (!res.success) console.error(res.error);
      setPendingId(null);
    });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <TopBar />

      <main className="flex-1 overflow-x-auto px-6 py-6 lg:px-8">
        <div className="grid min-w-[900px] grid-cols-4 gap-5">
          <div>
            <ColumnHeader dot="bg-orange-500" label="New" count={newOrders.length} />
            <div className="flex flex-col gap-4">
              {newOrders.map((order) => (
                <NewOrderCard
                  key={order.id}
                  order={order}
                  onAccept={handleAccept}
                  pending={isPending && pendingId === order.id}
                />
              ))}
            </div>
          </div>

          <div>
            <ColumnHeader dot="bg-green-700" label="Preparing" count={preparingOrders.length} />
            <div className="flex flex-col gap-4">
              {preparingOrders.map((order) => (
                <PreparingOrderCard
                  key={order.id}
                  order={order}
                  onMarkReady={handleMarkReady}
                  pending={isPending && pendingId === order.id}
                />
              ))}
            </div>
          </div>

          <div>
            <ColumnHeader dot="bg-green-400" label="Ready" count={readyOrders.length} />
            <div className="flex flex-col gap-4">
              {readyOrders.map((order) => (
                <ReadyOrderCard
                  key={order.id}
                  order={order}
                  onComplete={handleComplete}
                  pending={isPending && pendingId === order.id}
                />
              ))}
            </div>
          </div>

          <div>
            <ColumnHeader dot="bg-red-500" label="Delayed" count={delayedOrders.length} />
            <div className="flex flex-col gap-4">
              {delayedOrders.map((order) => (
                <DelayedOrderCard
                  key={order.id}
                  order={order}
                  onNotify={handleNotify}
                  onEscalate={handleEscalate}
                  pending={isPending && pendingId === order.id}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}