"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { Order } from "./data";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    Preparing: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] ?? map.Cancelled}`}>
      {status}
    </span>
  );
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  return (
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
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{order.id}</td>
                  <td className="px-6 py-4">{order.restaurant}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">{order.type}</td>
                  <td className="px-6 py-4 font-medium">{order.amount}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4">{order.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="rounded-lg border p-2 hover:bg-gray-100"><Eye size={16} /></button>
                      <button className="rounded-lg border p-2 hover:bg-blue-100"><Pencil size={16} className="text-blue-600" /></button>
                      <button className="rounded-lg border p-2 hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
