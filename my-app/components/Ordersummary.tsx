"use client";
import Image from "next/image";
import { useOrder } from "@/components/OrderContext";

export default function OrderSummary() {
  const { items, incrementQty, decrementQty, removeItem, clearOrder, totalItems, totalPrice, totalSavings } =
    useOrder();

  return (
    <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
        {items.length > 0 && (
          <button onClick={clearOrder} className="text-xs font-medium text-gray-400 hover:text-red-500">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl">🛒</span>
          <p className="text-sm text-gray-400">Your order is empty. Add something delicious!</p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={`${item.category}-${item.name}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-2"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    Rs. {item.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => decrementQty(item.name, item.category)}
                    aria-label={`Decrease ${item.name} quantity`}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => incrementQty(item.name, item.category)}
                    aria-label={`Increase ${item.name} quantity`}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.name, item.category)}
                  aria-label={`Remove ${item.name}`}
                  className="ml-1 text-gray-300 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>You save</span>
                <span>Rs. {totalSavings}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>Rs. {totalPrice}</span>
            </div>
          </div>

          <button className="mt-4 w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-600">
            Place Order
          </button>
        </>
      )}
    </div>
  );
}