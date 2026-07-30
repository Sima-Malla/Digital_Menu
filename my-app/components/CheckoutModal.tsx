"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { useOrder } from "@/components/OrderContext";

const orderTypes = [
  { id: "dine-in", label: "Dine-In" },
  { id: "pickup", label: "Pickup" },
  { id: "delivery", label: "Delivery" },
] as const;

export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { checkout, totalPrice, totalItems } = useOrder();

  const [orderType, setOrderType] = useState<"dine-in" | "pickup" | "delivery">("dine-in");
  const [locationLabel, setLocationLabel] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await checkout({
      orderType,
      locationLabel: orderType === "dine-in" ? locationLabel : undefined,
      customerName,
      customerPhone,
      customerEmail,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    setPlacedOrderId(result.orderId ?? null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        {placedOrderId ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Order placed!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Order #{placedOrderId} — the kitchen has been notified.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Checkout</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {totalItems} item{totalItems > 1 ? "s" : ""} · Rs. {totalPrice}
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Order Type
                </label>
                <div className="flex gap-2">
                  {orderTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOrderType(t.id)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-bold ${
                        orderType === t.id
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {orderType === "dine-in" && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Table Number
                  </label>
                  <input
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="e.g. Table 4"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Your Name
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
                />
                {fieldErrors.customerName && <p className="mt-1 text-xs text-red-600">{fieldErrors.customerName}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Phone Number
                </label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
                />
                {fieldErrors.customerPhone && <p className="mt-1 text-xs text-red-600">{fieldErrors.customerPhone}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Email (optional)
                </label>
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Placing order..." : `Place Order — Rs. ${totalPrice}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}