"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, Share2, Heart, ShoppingBag, MapPin, Clock, Utensils, Plus } from "lucide-react";
import Nav from "@/components/Nav";
import { OrderProvider, useOrder, type CartItem } from "@/components/OrderContext";
import CheckoutModal from "@/components/CheckoutModal";

/* ─── Types ─────────────────────────────────────────────── */
type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string | null;
};

const FALLBACK_IMG = "/vegmomo.jpg";

/* ─── Row-style menu item card ───────────────────────────── */
function MenuItemRow({ item }: { item: MenuItem }) {
  const { items, addItem, incrementQty, decrementQty } = useOrder();
  const cartItem = items.find((i) => i.menuItemId === item.id);

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <Image src={item.imageUrl || FALLBACK_IMG} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{item.description}</p>
          </div>
          <span className="shrink-0 text-sm font-bold text-orange-500">Rs. {item.price}</span>
        </div>
      </div>
      <div className="shrink-0 self-center">
        {!cartItem ? (
          <button
            onClick={() =>
              addItem({
                menuItemId: item.id,
                name: item.name,
                category: item.category,
                image: item.imageUrl || FALLBACK_IMG,
                price: item.price,
              })
            }
            className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2 py-1">
            <button onClick={() => decrementQty(item.id)} className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-500 text-xs shadow hover:bg-orange-100">−</button>
            <span className="text-xs font-semibold text-gray-800">{cartItem.quantity}</span>
            <button onClick={() => incrementQty(item.id)} className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-500 text-xs shadow hover:bg-orange-100">+</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Order panel ────────────────────────────────────────── */
function OrderPanel({ onCheckout }: { onCheckout: () => void }) {
  const { items, incrementQty, decrementQty, removeItem, totalItems, totalPrice } = useOrder();
  return (
    <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Your Order</h2>
        {totalItems > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {totalItems}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Utensils className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 max-w-[140px]">Your cart is feeling light. Add some delicious dishes to get started.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {items.map((item: CartItem) => (
            <div key={item.menuItemId} className="flex items-center gap-2">
              <Image src={item.image} alt={item.name} width={36} height={36} className="h-9 w-9 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">{item.name}</p>
                <p className="text-[11px] text-gray-400">Rs. {item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => decrementQty(item.menuItemId)} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200">−</button>
                <span className="text-xs font-semibold w-3 text-center">{item.quantity}</span>
                <button onClick={() => incrementQty(item.menuItemId)} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200">+</button>
              </div>
              <button onClick={() => removeItem(item.menuItemId)} className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <div className="flex justify-between text-sm font-bold text-orange-500">
          <span>Total</span>
          <span>Rs. {totalPrice}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        className="mt-4 w-full rounded-full bg-gray-900 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Checkout
      </button>
    </div>
  );
}

/* ─── Page content ────────────────────────────────────────── */
function MenuInner({
  businessName,
  businessType,
  businessAddress,
  categories,
  items,
}: {
  businessName: string;
  businessType: string;
  businessAddress: string;
  categories: string[];
  items: MenuItem[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "");
  const [search, setSearch] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const filtered = (list: MenuItem[]) =>
    search.trim()
      ? list.filter(
          (i) =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.description.toLowerCase().includes(search.toLowerCase())
        )
      : list;

  const visibleItems = filtered(items.filter((i) => i.category === activeCategory));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Nav />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72 bg-gray-200">
          <Image
            src="/menubanner.png"
            alt="Restaurant banner"
            fill
            priority
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/banner.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{businessName}</h1>
            <div className="mt-1.5 flex items-center gap-4 text-xs text-white/80">
              {businessType && (
                <span className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" /> {businessType}
                </span>
              )}
              {businessAddress && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {businessAddress}
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white">
              <Heart className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6 items-start">
          <aside className="hidden w-44 shrink-0 lg:block">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu Categories</p>
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeCategory === cat ? "bg-orange-50 font-semibold text-orange-500" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for dishes, ingredients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:border-orange-300">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">{activeCategory}</h2>
              {items.length === 0 ? (
                <p className="text-sm text-gray-400">This restaurant hasn&apos;t added any menu items yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {visibleItems.map((item) => (
                    <MenuItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </main>

          <div className="hidden w-60 shrink-0 lg:block">
            <OrderPanel onCheckout={() => setShowCheckout(true)} />
          </div>
        </div>
      </div>

      <MobileCart onCheckout={() => setShowCheckout(true)} />
      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </div>
  );
}

function MobileCart({ onCheckout }: { onCheckout: () => void }) {
  const { totalItems, totalPrice } = useOrder();
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 lg:hidden">
      <button
        onClick={onCheckout}
        className="flex items-center gap-3 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl"
      >
        <ShoppingBag className="h-4 w-4" />
        {totalItems} item{totalItems > 1 ? "s" : ""} · Rs. {totalPrice}
        <span className="ml-1 text-orange-400">→ Checkout</span>
      </button>
    </div>
  );
}

/* ─── Exported wrapper ───────────────────────────────────── */
export default function MenuContent(props: {
  businessId: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  categories: string[];
  items: MenuItem[];
}) {
  return (
    <OrderProvider businessId={props.businessId}>
      <MenuInner {...props} />
    </OrderProvider>
  );
}