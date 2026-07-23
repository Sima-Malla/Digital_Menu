"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  Search,
  MapPin,
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Apple,
  PlayCircle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
type Restaurant = {
  id: number;
  name: string;
  rating: number;
  sub: string;
  price: 1 | 2 | 3;
  chips: string[];
  tag?: string;
  tagColor?: string;
  img: string;
};

type SortKey =
  | "recommended"
  | "rating-desc"
  | "rating-asc"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

/* ─── Data ───────────────────────────────────────────────── */
const collections = [
  {
    title: "Best of Kathmandu",
    subtitle: "Curated local favorites",
    img: "hotel.png",
  },
  {
    title: "Top In-Room Dining",
    subtitle: "Luxury at your doorstep",
    img: "hotel.png",
  },
  {
    title: "Himalayan Specialties",
    subtitle: "Authentic mountain flavors",
    img: "hotel.png",
  },
];

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Royal Heritage Dine",
    rating: 4.9,
    sub: "Newari Fusion · Durbar Square",
    price: 3,
    chips: ["Authentic", "Fine Dining"],
    tag: "TOP SELLER",
    tagColor: "bg-red-800",
    img: "hotel.png",
  },
  {
    id: 2,
    name: "The Summit Palace",
    rating: 4.7,
    sub: "In-Room Dining · Lazimpat",
    price: 3,
    chips: ["International", "24/7 Service"],
    tag: "HOTEL PARTNER",
    tagColor: "bg-slate-700",
    img: "hotel.png",
  },
  {
    id: 3,
    name: "Mountain Hearth",
    rating: 4.6,
    sub: "Thakali Specialties · Jamsikhel",
    price: 2,
    chips: ["Traditional", "Family Style"],
    tag: "NEW",
    tagColor: "bg-emerald-700",
    img: "hotel.png",
  },
  {
    id: 4,
    name: "Bazaar Coffee House",
    rating: 4.8,
    sub: "Cafe & Bakery · Thamel",
    price: 1,
    chips: ["Breakfast", "Artisanal"],
    img: "hotel.png",
  },
  {
    id: 5,
    name: "Sakura In-Room",
    rating: 4.9,
    sub: "Japanese · Annapurna Hotel",
    price: 3,
    chips: ["Sushi", "Fine Dining"],
    img: "hotel.png",
  },
  {
    id: 6,
    name: "The Iron Grille",
    rating: 4.5,
    sub: "Contemporary Grill · Baluwatar",
    price: 2,
    chips: ["BBQ", "Steakhouse"],
    img: "hotel.png",
  },
];

const businessTypes = ["Hotel In-Room Dining", "Independent Restaurant", "Cafes & Bakeries"];
const cuisines = ["Newari", "Thakali", "Himalayan", "International Fusion"];
const pricePills = ["NPR", "NPR NPR", "NPR NPR NPR"];

/* ─── Sort helper ────────────────────────────────────────── */
function sortRestaurants(list: Restaurant[], key: SortKey): Restaurant[] {
  const sorted = [...list];
  switch (key) {
    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "rating-asc":
      return sorted.sort((a, b) => a.rating - b.rating);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MarketplacePage() {
  const [businessType, setBusinessType] = useState<string[]>(["Independent Restaurant"]);
  const [cuisine, setCuisine] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [page, setPage] = useState(1);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setBusinessType([]);
    setCuisine([]);
    setPriceRange(1);
  };

  const sorted = useMemo(() => sortRestaurants(restaurants, sortKey), [sortKey]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#231C16]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 bg-white px-6 py-4 md:px-10">
        <span className="text-xl font-extrabold text-orange-700 whitespace-nowrap">GourmetFlow</span>

        <div className="flex h-10 flex-1 min-w-[200px] max-w-xl items-center gap-2 rounded-lg border border-black/10 bg-[#F7F5F0] px-3">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search Marketplace"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1 whitespace-nowrap border-l border-black/10 pl-3 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            Kathmandu
          </div>
        </div>

        <Nav />

        <div className="flex items-center gap-5">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-900 text-[10px] text-white">
              3
            </span>
          </div>
          <button className="rounded-full bg-red-900 px-5 py-2 text-xs font-bold text-white hover:bg-red-800">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 pb-5 pt-9 md:px-10">
        <h1 className="text-3xl font-extrabold md:text-4xl">Discover Culinary Excellence</h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse the finest restaurants and luxury hotel dining in the heart of Kathmandu.
        </p>
      </div>

      {/* Layout */}
      <div className="flex flex-col gap-8 px-6 pb-16 md:flex-row md:px-10">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <FilterGroup title="Business Type">
            {businessTypes.map((b) => (
              <Checkbox
                key={b}
                label={b}
                checked={businessType.includes(b)}
                onChange={() => toggle(businessType, setBusinessType, b)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Nepali Cuisine">
            {cuisines.map((c) => (
              <Checkbox
                key={c}
                label={c}
                checked={cuisine.includes(c)}
                onChange={() => toggle(cuisine, setCuisine, c)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Price Range">
            <div className="flex gap-2">
              {pricePills.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setPriceRange(i)}
                  className={`flex-1 rounded-lg border px-1 py-2 text-[10px] font-semibold ${
                    priceRange === i
                      ? "border-orange-600 bg-orange-50 text-orange-700"
                      : "border-black/10 bg-white text-gray-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </FilterGroup>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Clear All Filters
          </button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <h2 className="mb-4 text-xl font-extrabold">Featured Collections</h2>
          <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <div
                key={c.title}
                className="relative h-36 overflow-hidden rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url('${c.img}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-base font-bold">{c.title}</p>
                  <p className="text-xs opacity-90">{c.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Results bar + sort */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">{sorted.length} restaurants found</p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs text-gray-500">
                Sort by
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="appearance-none rounded-lg border border-black/10 bg-white py-2 pl-3 pr-8 text-xs font-semibold outline-none focus:border-orange-400"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating-desc">Rating: high to low</option>
                  <option value="rating-asc">Rating: low to high</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex justify-center gap-2">
            <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </PageBtn>
            {[1, 2, 3].map((p) => (
              <PageBtn key={p} active={page === p} onClick={() => setPage(p)}>
                {p}
              </PageBtn>
            ))}
            <PageBtn onClick={() => setPage((p) => Math.min(3, p + 1))}>
              <ChevronRight className="h-3.5 w-3.5" />
            </PageBtn>
          </div>
        </main>
      </div>



    <Footer/>
    </div>
  );
}

/* ─── Subcomponents ──────────────────────────────────────── */
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">{title}</h4>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#231C16]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer accent-orange-700"
      />
      {label}
    </label>
  );
}

function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white">
      <div
        className="relative h-40 bg-cover bg-center"
        style={{ backgroundImage: `url('${r.img}')` }}
      >
        {r.tag && (
          <span
            className={`absolute left-2.5 top-2.5 rounded px-2 py-1 text-[10px] font-bold tracking-wide text-white ${r.tagColor}`}
          >
            {r.tag}
          </span>
        )}
        <div className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
          <Heart className="h-3.5 w-3.5 text-orange-700" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold">{r.name}</p>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-orange-700">
            <Star className="h-3.5 w-3.5 fill-orange-700" /> {r.rating}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">{r.sub}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.chips.map((c) => (
            <span
              key={c}
              className="rounded-md border border-black/10 bg-[#F7F5F0] px-2 py-1 text-[10px] text-gray-500"
            >
              {c}
            </span>
          ))}
        </div>
        <Link href="/Menu" className="mt-auto pt-4">
          <span className="block rounded-lg bg-[#F7F5F0] py-2.5 text-center text-xs font-bold text-red-900 hover:bg-orange-50">
            View Menu
          </span>
        </Link>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold ${
        active
          ? "border-red-900 bg-red-900 text-white"
          : "border-black/10 bg-white text-[#231C16] hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="mb-3.5 text-sm font-bold text-white">{title}</p>
      <div className="flex flex-col gap-2.5">
        {links.map((l) => (
          <a key={l} href="#" className="text-xs hover:text-white">
            {l}
          </a>
        ))}
      </div>
    </div>
  );
}