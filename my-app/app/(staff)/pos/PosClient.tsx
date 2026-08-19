"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  Search, Plus, Minus, X, ShoppingCart, Loader2, CheckCircle2,
} from "lucide-react";

import { createPosOrderAction, type CartLine } from "../../actions/pos";

type PosMenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
};

type PosLocation = {
  id: string;
  label: string;
  type: string;
};

const FALLBACK_IMG = "/vegmomo.jpg";

const ORDER_TYPES = [
  { value: "dine-in", label: "Dine-in" },
  { value: "pickup", label: "Pickup" },
  { value: "delivery", label: "Delivery" },
] as const;

export default function PosClient({
  businessId,
  menuItems,
  locations,
  categories,
}: {
  businessId: string;
  menuItems: PosMenuItem[];
  locations: PosLocation[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<"dine-in" | "pickup" | "delivery">("dine-in");
  const [locationId, setLocationId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fireToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const visibleItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch =
        !search.trim() || item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

  const addToCart = (item: PosMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.menuItemId === item.id);
      if (existing) {
        return prev.map((line) =>
          line.menuItemId === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1, notes: "" },
      ];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.menuItemId === menuItemId ? { ...line, quantity: line.quantity + delta } : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((line) => (line.menuItemId === menuItemId ? { ...line, notes } : line))
    );
  };

  const removeLine = (menuItemId: string) => {
    setCart((prev) => prev.filter((line) => line.menuItemId !== menuItemId));
  };

  const totalItems = cart.reduce((n, l) => n + l.quantity, 0);
  const totalPrice = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const handleSubmit = () => {
    setError(null);

    if (cart.length === 0) {
      setError("Add at least one item to the order.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Customer phone number is required.");
      return;
    }
    if (orderType === "dine-in" && !locationId) {
      setError("Select a table for dine-in orders.");
      return;
    }

    startTransition(async () => {
      const res = await createPosOrderAction({
        cart,
        orderType,
        locationId: orderType === "dine-in" ? locationId : null,
        customerName,
        customerPhone,
      });

      if (res.success) {
        fireToast(`Order #${res.orderId} created.`);
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setLocationId("");
      } else {
        setError(res.message ?? "Couldn't create the order — please try again.");
      }
    });
  };

  return (
    <div className="flex min-w-0 flex-1">
      {/* ── Menu column ─────────────────────────────────── */}
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8">
        {toast && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-[13px] font-medium text-green-700">{toast}</span>
          </div>
        )}

        <h1 className="mb-1 text-xl font-bold text-gray-900">Point of Sale</h1>
        <p className="mb-6 text-sm text-gray-400">Take walk-in, phone, or room orders directly.</p>

        <div className="flex gap-6 items-start">
          <aside className="hidden w-44 shrink-0 lg:block">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Menu Categories
            </p>
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeCategory === cat
                      ? "bg-orange-50 font-semibold text-orange-500"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for dishes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <h2 className="mb-4 text-lg font-bold text-gray-900">{activeCategory}</h2>

            {menuItems.length === 0 ? (
              <p className="text-sm text-gray-400">No menu items available yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="relative h-24 w-full bg-gray-100">
                      <Image
                        src={item.imageUrl || FALLBACK_IMG}
                        alt={item.name}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="mt-0.5 text-xs font-bold text-orange-500">Rs. {item.price}</p>
                    </div>
                  </button>
                ))}

                {visibleItems.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-gray-400">
                    No dishes match your search.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Order / cart panel ──────────────────────────── */}
      <aside className="hidden w-80 shrink-0 border-l border-gray-100 bg-white lg:flex lg:flex-col">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <ShoppingCart className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-bold text-gray-900">Current Order</h2>
          {totalItems > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-xs text-gray-400">
              Cart is empty — tap a dish to add it.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((line) => (
                <div key={line.menuItemId} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-900">{line.name}</p>
                    <button
                      onClick={() => removeLine(line.menuItemId)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(line.menuItemId, -1)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-xs font-semibold">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.menuItemId, 1)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-orange-500">
                      Rs. {(line.unitPrice * line.quantity).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={line.notes}
                    onChange={(e) => updateNotes(line.menuItemId, e.target.value)}
                    placeholder="Notes (e.g. no onions)"
                    className="mt-2 w-full rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-orange-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <div className="mb-3 flex gap-1.5">
            {ORDER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setOrderType(t.value)}
                className={`flex-1 rounded-lg py-2 text-[11px] font-semibold transition ${
                  orderType === t.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {orderType === "dine-in" && (
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
            >
              <option value="">Select a table…</option>
              {locations
                .filter((l) => l.type === "dine-in")
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
            </select>
          )}

          <div className="mb-3 grid grid-cols-1 gap-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
          </div>

          {error && <p className="mb-3 text-[11px] font-medium text-red-600">{error}</p>}

          <div className="mb-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs font-semibold text-gray-600">Total</span>
            <span className="text-base font-bold text-gray-900">Rs. {totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? "Placing…" : "Place Order"}
          </button>
        </div>
      </aside>

      {/* ── Mobile cart bar ──────────────────────────────── */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 lg:hidden">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-3 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalItems} item{totalItems > 1 ? "s" : ""} · Rs. {totalPrice.toFixed(2)}
            <span className="ml-1 text-orange-400">{isPending ? "Placing…" : "→ Place Order"}</span>
          </button>
        </div>
      )}
    </div>
  );
}