"use client";
import { useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { Search, SlidersHorizontal, Share2, Heart, ShoppingBag, MapPin, Clock, Plus, Utensils } from "lucide-react";
import Nav from "@/components/Nav";
import { OrderProvider, useOrder } from "@/components/OrderContext";

import vegmomoImg from "@/public/vegmomo.jpg";
import lemonadeImg from "@/public/lemonade.jpg";

/* ─── Types ─────────────────────────────────────────────── */
type MenuItem = {
  name: string;
  description: string;
  image: string | StaticImageData;
  price: number;
  originalPrice: number;
  tags?: string[];
  rating?: string;
};

/* ─── Data ───────────────────────────────────────────────── */
const categories = [
  "Appetizers",
  "Main Courses",
  "Desserts & Pastries",
  "Wine & Beverages",
];

const menuData: Record<string, MenuItem[]> = {
  Appetizers: [
    {
      name: "Seared Saint-Jacques",
      description: "Fresh Atlantic scallops served with minted pea purée, pancetta crisps, and a lemon-butter drizzle.",
      image: vegmomoImg,
      price: 24,
      originalPrice: 24,
      tags: ["GLUTEN FREE", "BEST SELLER"],
    },
    {
      name: "Truffle Arancini",
      description: "Crispy risotto balls filled with wild mushrooms and truffle oil, served on a parmesan fondue.",
      image: vegmomoImg,
      price: 18,
      originalPrice: 18,
      tags: ["VEGETARIAN"],
    },
    {
      name: "Foie Gras Terrine",
      description: "Silky duck foie gras terrine with brioche toast, fig compote and micro herbs.",
      image: vegmomoImg,
      price: 28,
      originalPrice: 28,
    },
  ],
  "Main Courses": [
    {
      name: "Tenderloin au Poivre",
      description: "A 200g prime beef tenderloin with a Madagascar peppercorn sauce, gratin dauphinois and haricots verts.",
      image: vegmomoImg,
      price: 42,
      originalPrice: 42,
      rating: "4.9",
    },
    {
      name: "Miso Glazed Sea Bass",
      description: "Wild caught Chilean sea bass with a honey-miso reduction and sesame bok choy.",
      image: vegmomoImg,
      price: 38,
      originalPrice: 38,
    },
    {
      name: "Duck Confit",
      description: "Slow-cooked duck leg with cherry jus, roasted root vegetables and pomme purée.",
      image: vegmomoImg,
      price: 36,
      originalPrice: 36,
    },
  ],
  "Desserts & Pastries": [
    {
      name: "Crème Brûlée",
      description: "Classic vanilla custard with a perfectly caramelised sugar crust.",
      image: lemonadeImg,
      price: 12,
      originalPrice: 12,
      tags: ["VEGETARIAN"],
    },
    {
      name: "Chocolate Fondant",
      description: "Warm dark chocolate fondant with a molten centre, served with vanilla ice cream.",
      image: lemonadeImg,
      price: 14,
      originalPrice: 14,
    },
  ],
  "Wine & Beverages": [
    {
      name: "Château Margaux 2018",
      description: "Full-bodied Bordeaux with notes of blackcurrant, cedar and subtle oak.",
      image: lemonadeImg,
      price: 95,
      originalPrice: 95,
    },
    {
      name: "Lemon Verbena Spritz",
      description: "House-made lemon verbena syrup, sparkling water and fresh mint.",
      image: lemonadeImg,
      price: 9,
      originalPrice: 9,
      tags: ["NON-ALCOHOLIC"],
    },
  ],
};

/* ─── Tag colour map ─────────────────────────────────────── */
const tagColor: Record<string, string> = {
  "GLUTEN FREE": "bg-green-100 text-green-700",
  "BEST SELLER": "bg-orange-100 text-orange-600",
  VEGETARIAN: "bg-emerald-100 text-emerald-700",
  "NON-ALCOHOLIC": "bg-blue-100 text-blue-600",
};

/* ─── Row-style menu item card ───────────────────────────── */
function MenuItemRow({ item, category }: { item: MenuItem; category: string }) {
  const { items, addItem, incrementQty, decrementQty } = useOrder();
  const cartItem = items.find((i) => i.name === item.name && i.category === category);

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{item.description}</p>
            {item.tags && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagColor[t] ?? "bg-gray-100 text-gray-600"}`}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="shrink-0 text-sm font-bold text-orange-500">Rs. {item.price}</span>
        </div>
      </div>
      <div className="shrink-0 self-center">
        {!cartItem ? (
          <button
            onClick={() => addItem({ ...item, category })}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2 py-1">
            <button onClick={() => decrementQty(item.name, category)} className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-500 text-xs shadow hover:bg-orange-100">−</button>
            <span className="text-xs font-semibold text-gray-800">{cartItem.quantity}</span>
            <button onClick={() => incrementQty(item.name, category)} className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-500 text-xs shadow hover:bg-orange-100">+</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Order panel ────────────────────────────────────────── */
function OrderPanel() {
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
          {items.map((item) => (
            <div key={`${item.category}-${item.name}`} className="flex items-center gap-2">
              <Image src={item.image} alt={item.name} width={36} height={36} className="h-9 w-9 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">{item.name}</p>
                <p className="text-[11px] text-gray-400">Rs. {item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => decrementQty(item.name, item.category)} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200">−</button>
                <span className="text-xs font-semibold w-3 text-center">{item.quantity}</span>
                <button onClick={() => incrementQty(item.name, item.category)} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200">+</button>
              </div>
              <button onClick={() => removeItem(item.name, item.category)} className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
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

      <button className="mt-4 w-full rounded-full bg-gray-900 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-gray-700">
        Checkout
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
function MenuContent() {
  const [activeCategory, setActiveCategory] = useState("Appetizers");
  const [search, setSearch] = useState("");

  const scrollTo = (cat: string) => setActiveCategory(cat);

  const filtered = (items: MenuItem[]) =>
    search.trim()
      ? items.filter(
          (i) =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.description.toLowerCase().includes(search.toLowerCase())
        )
      : items;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Nav />

      {/* Banner */}
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4">
      <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72">
        <Image src="/menubanner.png" alt="Restaurant banner" fill priority className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/banner.png"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            Top Rated &nbsp;⭐ 4.9 (500+ Reviews)
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">GourmetHub Restaurant</h1>
          <div className="mt-1.5 flex items-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1"><Utensils className="h-3 w-3" /> Nepali Cuisine</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 15–25 min</span>
            <span>Rs. 200 avg</span>
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

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8">
        <div className="flex gap-6 items-start">

          {/* Left sidebar */}
          <aside className="hidden w-44 shrink-0 lg:block">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu Categories</p>
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollTo(cat)}
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

            {/* Restaurant info */}
            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-3 text-xs text-gray-500 shadow-sm">
              <p className="font-semibold text-gray-700 text-[11px]">Restaurant Info</p>
              <p className="mt-1">Open until 10 PM</p>
              <div className="my-2 h-16 w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">map</div>
              <p className="flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> Thamel, Kathmandu</p>
            </div>
          </aside>

          {/* Center — menu */}
          <main className="min-w-0 flex-1">
            {/* Search bar */}
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

            {/* Category section — only active */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">{activeCategory}</h2>
              <div className="flex flex-col gap-3">
                {filtered(menuData[activeCategory] ?? []).map((item) => (
                  <MenuItemRow key={item.name} item={item} category={activeCategory} />
                ))}
              </div>
            </div>
          </main>

          {/* Right — order panel */}
          <div className="hidden w-60 shrink-0 lg:block">
            <OrderPanel />
          </div>
        </div>
      </div>

      {/* Mobile floating cart */}
      <MobileCart />
    </div>
  );
}

function MobileCart() {
  const { totalItems, totalPrice } = useOrder();
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 lg:hidden">
      <button className="flex items-center gap-3 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
        <ShoppingBag className="h-4 w-4" />
        {totalItems} item{totalItems > 1 ? "s" : ""} · Rs. {totalPrice}
        <span className="ml-1 text-orange-400">→ View Order</span>
      </button>
    </div>
  );
}

export default function MenuPage() {
  return (
    <OrderProvider>
      <MenuContent />
    </OrderProvider>
  );
}
