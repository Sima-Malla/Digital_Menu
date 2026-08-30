"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight, ChevronDown, X, Heart } from "lucide-react";

const FAVORITES_STORAGE_KEY = "kitchens-favorites-v1";

// Color the business-type badge consistently per type so cards feel
// as colorful as the old mock UI, without inventing per-business data.
const TYPE_BADGE_COLORS: Record<string, string> = {
  "Hotel In-Room Dining": "bg-slate-700",
  "Independent Restaurant": "bg-red-800",
  "Cafes & Bakeries": "bg-emerald-700",
};
const DEFAULT_BADGE_COLOR = "bg-orange-700";

/* ─── Types ──────────────────────────────────────────────── */
// Matches exactly what the Business table provides today.
// rating / chips / tag / price tier / image are NOT in the schema yet —
// add columns to `Business` (e.g. rating, imageUrl, priceTier, cuisine)
// if you want those back in the UI.
type BusinessListing = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
};

type SortKey = "recommended" | "name-asc" | "name-desc";

const PAGE_SIZE = 9;

/* ─── Sort helper ────────────────────────────────────────── */
function sortBusinesses(list: BusinessListing[], key: SortKey): BusinessListing[] {
  const sorted = [...list];
  switch (key) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MarketplaceContent({
  businesses,
  businessTypes,
}: {
  businesses: BusinessListing[];
  businessTypes: string[];
}) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [page, setPage] = useState(1);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setFavoriteIds(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      // Ignore storage errors and continue with an empty favorites list.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Ignore storage write errors; the UI still works without persistence.
    }
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id]
    );
  };

  const toggleType = (val: string) => {
    setSelectedTypes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSearch("");
    setShowSavedOnly(false);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = businesses;
    if (showSavedOnly) {
      list = list.filter((b) => favoriteIds.includes(b.id));
    }
    if (selectedTypes.length > 0) {
      list = list.filter((b) => selectedTypes.includes(b.type));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [businesses, favoriteIds, selectedTypes, search, showSavedOnly]);

  const sorted = useMemo(() => sortBusinesses(filtered, sortKey), [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const savedCount = businesses.filter((b) => favoriteIds.includes(b.id)).length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#231C16]">
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
          <FilterGroup title="Saved Businesses">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#231C16]">
              <input
                type="checkbox"
                checked={showSavedOnly}
                onChange={() => {
                  setShowSavedOnly((prev) => !prev);
                  setPage(1);
                }}
                className="h-4 w-4 cursor-pointer accent-orange-700"
              />
              Show only saved ({savedCount})
            </label>
          </FilterGroup>

          <FilterGroup title="Business Type">
            {businessTypes.length === 0 ? (
              <p className="text-xs text-gray-400">No businesses listed yet</p>
            ) : (
              businessTypes.map((t) => (
                <Checkbox
                  key={t}
                  label={t}
                  checked={selectedTypes.includes(t)}
                  onChange={() => toggleType(t)}
                />
              ))
            )}
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
          {/* Results bar + sort */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <p>{sorted.length} businesses found</p>
              {showSavedOnly && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
                  Saved view
                </span>
              )}
            </div>
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
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Grid */}
          {paged.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">
              {showSavedOnly
                ? "You haven’t saved any businesses yet. Click the heart on a restaurant card to save it."
                : "No businesses match your filters."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((b) => (
                <BusinessCard
                  key={b.id}
                  b={b}
                  isFavorite={favoriteIds.includes(b.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PageBtn key={p} active={page === p} onClick={() => setPage(p)}>
                  {p}
                </PageBtn>
              ))}
              <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-3.5 w-3.5" />
              </PageBtn>
            </div>
          )}
        </main>
      </div>

      <Footer />
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

function BusinessCard({
  b,
  isFavorite,
  onToggleFavorite,
}: {
  b: BusinessListing;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const badgeColor = TYPE_BADGE_COLORS[b.type] ?? DEFAULT_BADGE_COLOR;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Banner — swap the src for a per-business <Image> once Business has an imageUrl column */}
      <div
        className="relative h-40 bg-cover bg-center"
        style={{ backgroundImage: "url('/hotel.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {b.type && (
          <span
            className={`absolute left-2.5 top-2.5 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${badgeColor}`}
          >
            {b.type}
          </span>
        )}
        <button
          type="button"
          aria-label={isFavorite ? `Remove ${b.name} from saved favorites` : `Save ${b.name} to favorites`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite(b.id);
          }}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border transition ${
            isFavorite
              ? "border-red-500 bg-red-500 text-white shadow-sm"
              : "border-white/60 bg-white/90 text-orange-700 hover:bg-white"
          }`}
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={isFavorite ? "currentColor" : "none"}
            strokeWidth={isFavorite ? 2.5 : 2}
          />
        </button>
        <p className="absolute bottom-2.5 left-3 text-base font-bold text-white drop-shadow">
          {b.name}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {b.address && <p className="text-xs text-gray-500">{b.address}</p>}
        <Link href={`/Menu/${b.id}`} className="mt-auto pt-4">
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