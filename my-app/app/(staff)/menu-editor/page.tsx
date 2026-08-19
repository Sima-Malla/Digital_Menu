"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  Loader2,
} from "lucide-react";
import {
  getStaffMenuItems,
  updateStaffDishStatus,
  AvailabilityStatus,
  MenuItemData,
} from "@/app/actions/staff/staff-menu";

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; dot: string; className: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  "low-stock": {
    label: "Low Stock",
    dot: "bg-amber-500",
    className: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  "out-of-stock": {
    label: "Out of Stock",
    dot: "bg-red-500",
    className: "bg-red-50 text-red-600 hover:bg-red-100",
  },
};

const STATUS_CYCLE: AvailabilityStatus[] = ["available", "low-stock", "out-of-stock"];

/* ─── Availability badge (click to cycle status) ─────────── */
function AvailabilityToggle({
  status,
  onChange,
  disabled = false,
}: {
  status: AvailabilityStatus;
  onChange: () => void;
  disabled?: boolean;
}) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
        cfg.className
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title="Click to update availability"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </button>
  );
}

/* ─── Read-only view modal ───────────────────────────────── */
function ViewDishModal({
  item,
  onClose,
}: {
  item: MenuItemData;
  onClose: () => void;
}) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Dish Details</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={item.img}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <p className="text-lg font-bold text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-400">{item.meta || "No description available"}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Category
            </p>
            <p className="mt-1 font-semibold text-gray-800">{item.category}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Price
            </p>
            <p className="mt-1 font-semibold text-orange-600">{item.price}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Availability
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Pricing and item details are managed by the restaurant admin. You can update availability from the menu list.
        </p>
      </div>
    </div>
  );
}

/* ─── Menu inventory (grid / list) ───────────────────────── */
function MenuInventory() {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const [viewingItem, setViewingItem] = useState<MenuItemData | null>(null);
  const pageSize = 10;

  // 1. Initial Data Fetching from Database
  useEffect(() => {
    async function loadMenu() {
      setLoading(true);
      const data = await getStaffMenuItems();
      setItems(data);
      setLoading(false);
    }
    loadMenu();
  }, []);

  // 2. Dynamic Categories list from items
  const dynamicCategories = useMemo(() => {
    const unique = Array.from(new Set(items.map((it) => it.category).filter(Boolean)));
    return ["All", ...unique];
  }, [items]);

  // 3. Status Cycle Logic (Optimistic Update)
  const cycleStatus = async (id: number) => {
    const targetItem = items.find((it) => it.id === id);
    if (!targetItem) return;

    const nextIndex =
      (STATUS_CYCLE.indexOf(targetItem.status) + 1) % STATUS_CYCLE.length;
    const newStatus = STATUS_CYCLE[nextIndex];

    // Immediate UI Update
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
    );

    setUpdatingId(id);
    const res = await updateStaffDishStatus(id, newStatus);

    setUpdatingId(null);

    // Rollback if DB update fails
    if (!res.success) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: targetItem.status } : it))
      );
      alert("Failed to update dish availability in database.");
    }
  };

  // Search & Filter Logic
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch = it.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || it.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
        <span className="mt-2 text-sm font-medium text-gray-500">Loading Menu Inventory...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">
          Menu Items ({filtered.length})
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search dish..."
              className="w-40 rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 outline-none focus:border-orange-300 sm:w-56"
            />
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`rounded-md p-1.5 ${
                view === "grid"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={`rounded-md p-1.5 ${
                view === "list"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Category Chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {dynamicCategories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategoryFilter(c);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              categoryFilter === c
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-100 p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] text-gray-400">
                    {item.meta || "No description"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-orange-600">
                  {item.price}
                </span>
              </div>
              <span className="mb-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                {item.category}
              </span>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <AvailabilityToggle
                  status={item.status}
                  onChange={() => cycleStatus(item.id)}
                  disabled={updatingId === item.id}
                />
                <button
                  onClick={() => setViewingItem(item)}
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                  aria-label="View dish"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {paginated.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
              No dishes match your search or filter.
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                <th className="pb-3 font-bold">Dish</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Price</th>
                <th className="pb-3 font-bold">Availability</th>
                <th className="pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((item) => (
                <tr key={item.id} className="text-gray-700 hover:bg-gray-50/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100 relative">
                        <Image
                          src={item.img}
                          alt={item.name}
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="truncate text-[11px] text-gray-400">
                          {item.meta || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-orange-600">
                    {item.price}
                  </td>
                  <td className="py-3">
                    <AvailabilityToggle
                      status={item.status}
                      onChange={() => cycleStatus(item.id)}
                      disabled={updatingId === item.id}
                    />
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="text-gray-400 hover:text-orange-600 transition-colors"
                      aria-label="View dish"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    No dishes match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
          entries
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${
                page === i + 1
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {viewingItem && (
        <ViewDishModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Menu Inventory
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Monitor menu items and manage availability status for kitchen inventory.
          </p>
        </div>

        <div className="mt-6">
          <MenuInventory />
        </div>
      </main>
    </div>
  );
}