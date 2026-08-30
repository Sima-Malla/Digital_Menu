"use client";

import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2, CreditCard, Wallet, Banknote, Landmark } from "lucide-react";
import { useOrder } from "@/components/OrderContext";
import { getAvailablePaymentMethods, initiatePaymentAction, type PaymentMethodOption } from "@/app/actions/payment";

const orderTypes = [
  { id: "dine-in", label: "Dine-In" },
  { id: "pickup", label: "Pickup" },
  { id: "delivery", label: "Delivery" },
] as const;

// Icon per known method key — falls back to a generic wallet icon for
// anything not explicitly listed (new gateways added later still render).
const METHOD_ICONS: Record<string, React.ElementType> = {
  cod: Banknote,
  bank: Landmark,
  card: CreditCard,
  wallet: Wallet,
  esewa: Wallet,
  fonepay: Wallet,
};
export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { checkout, totalPrice, totalItems, businessId } = useOrder();

  const [orderType, setOrderType] = useState<"dine-in" | "pickup" | "delivery">("dine-in");
  const [locationLabel, setLocationLabel] = useState("");
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState<number>(0);

  // ── Payment step state ──────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isCodConfirmed, setIsCodConfirmed] = useState(false);

  // Fetch this business's enabled payment methods once an order exists.
  useEffect(() => {
    if (!placedOrderId) return;
    let cancelled = false;

    setMethodsLoading(true);
    getAvailablePaymentMethods(businessId)
      .then((methods) => {
        if (!cancelled) setPaymentMethods(methods);
      })
      .finally(() => {
        if (!cancelled) setMethodsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placedOrderId, businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await checkout({
      orderType,
      locationLabel: orderType === "dine-in" ? locationLabel : undefined,
      isWalkIn,
      customerName: isWalkIn ? "Walk-in Customer" : customerName,
      customerPhone: isWalkIn ? "" : customerPhone,
      customerEmail: isWalkIn ? "" : customerEmail,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    setPlacedOrderId(result.orderId ?? null);
    setPlacedTotal(totalPrice);
  };

  const handlePay = async (methodKey: string) => {
    if (!placedOrderId) return;
    setSelectedMethod(methodKey);
    setPaymentError(null);
    setIsPaying(true);

    const result = await initiatePaymentAction(placedOrderId, methodKey);

    if (!result.success) {
      setIsPaying(false);
      setPaymentError(result.message);
      return;
    }

    if (result.type === "cod") {
      setIsPaying(false);
      setIsCodConfirmed(true);
      return;
    }

    if (result.type === "redirect_form") {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.gatewayUrl;
      for (const [key, value] of Object.entries(result.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      return;
    }

    if (result.type === "redirect_url") {
      window.location.href = result.url;
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        {placedOrderId ? (
          isCodConfirmed ? (
            /* ── COD confirmation ───────────────────────── */
            <div className="py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Order confirmed!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Order #{placedOrderId} — pay Rs. {placedTotal} at the counter.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          ) : isPaid ? (
            /* ── Final confirmation ─────────────────────── */
            <div className="py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Payment confirmed!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Order #{placedOrderId} is paid — the kitchen has been notified.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Payment step ───────────────────────────── */
            <div className="py-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Order placed!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Order #{placedOrderId} — the kitchen has been notified.
              </p>

              <div className="mt-6 border-t border-gray-100 pt-5 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Choose how you'll pay
                </p>
                <p className="mt-1 text-2xl font-extrabold text-orange-500">
                  Rs. {placedTotal}
                </p>

                {paymentError && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {paymentError}
                  </div>
                )}

                {methodsLoading ? (
                  <div className="mt-4 flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading payment options…
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <p className="mt-4 py-4 text-center text-sm text-gray-400">
                    No payment methods are set up yet — you can settle up directly with staff.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {paymentMethods.map((m) => {
                      const Icon = METHOD_ICONS[m.key] ?? Wallet;
                      const isSelected = selectedMethod === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => handlePay(m.key)}
                          disabled={isPaying}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border py-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isSelected
                              ? "border-orange-400 bg-orange-50 text-orange-600"
                              : "border-gray-200 text-gray-600 hover:border-orange-200"
                          }`}
                        >
                          {isPaying && isSelected ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="mt-5 w-full rounded-full border border-gray-200 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Pay later / at counter
                </button>
              </div>
            </div>
          )
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

              {orderType === "dine-in" && (
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={isWalkIn}
                    onChange={(e) => setIsWalkIn(e.target.checked)}
                    className="h-3.5 w-3.5 accent-orange-500"
                  />
                  <span className="font-semibold text-gray-700">Ordering for the table</span>
                  <span className="ml-auto text-gray-400">(skip name/phone)</span>
                </label>
              )}

              {!isWalkIn && (
                <>
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
                </>
              )}

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