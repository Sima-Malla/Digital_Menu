"use client";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const orders = [
  {
    id: "#ORD-1001",
    restaurant: "Bistro Central",
    customer: "John Smith",
    type: "Dine In",
    amount: "$45.00",
    status: "Completed",
    time: "10:15 AM",
  },
  {
    id: "#ORD-1002",
    restaurant: "Pizza House",
    customer: "Emma Wilson",
    type: "Delivery",
    amount: "$28.50",
    status: "Preparing",
    time: "10:22 AM",
  },
  {
    id: "#ORD-1003",
    restaurant: "Burger Point",
    customer: "David Lee",
    type: "Take Away",
    amount: "$19.99",
    status: "Pending",
    time: "10:30 AM",
  },
  {
    id: "#ORD-1004",
    restaurant: "Food Hub",
    customer: "Sophia Brown",
    type: "Delivery",
    amount: "$62.80",
    status: "Cancelled",
    time: "10:40 AM",
  },
  {
    id: "#ORD-1005",
    restaurant: "Bistro Central",
    customer: "Michael Scott",
    type: "Dine In",
    amount: "$88.40",
    status: "Completed",
    time: "11:00 AM",
  },
  {
    id: "#ORD-1006",
    restaurant: "Pizza House",
    customer: "Sarah Parker",
    type: "Delivery",
    amount: "$37.20",
    status: "Preparing",
    time: "11:08 AM",
  },
  {
    id: "#ORD-1007",
    restaurant: "Burger Point",
    customer: "Daniel Kim",
    type: "Take Away",
    amount: "$24.90",
    status: "Pending",
    time: "11:16 AM",
  },
  {
    id: "#ORD-1008",
    restaurant: "Food Hub",
    customer: "Olivia Martin",
    type: "Delivery",
    amount: "$72.10",
    status: "Completed",
    time: "11:35 AM",
  },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Completed":
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Completed
        </span>
      );

    case "Preparing":
      return (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Preparing
        </span>
      );

    case "Pending":
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          Pending
        </span>
      );

    default:
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Cancelled
        </span>
      );
  }
}

export default function OrdersTable() {
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
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-semibold">
                  {order.id}
                </td>

                <td className="px-6 py-4">
                  {order.restaurant}
                </td>

                <td className="px-6 py-4">
                  {order.customer}
                </td>

                <td className="px-6 py-4">
                  {order.type}
                </td>

                <td className="px-6 py-4 font-medium">
                  {order.amount}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-6 py-4">
                  {order.time}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="rounded-lg border p-2 hover:bg-gray-100">
                      <Eye size={16} />
                    </button>

                    <button className="rounded-lg border p-2 hover:bg-blue-100">
                      <Pencil
                        size={16}
                        className="text-blue-600"
                      />
                    </button>

                    <button className="rounded-lg border p-2 hover:bg-red-100">
                      <Trash2
                        size={16}
                        className="text-red-600"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}