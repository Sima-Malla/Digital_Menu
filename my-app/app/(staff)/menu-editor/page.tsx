"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────── */
const categories = ["Main Course", "Appetizer", "Seafood", "Dessert", "Beverage"];

const menuInventory = [
  {
    id: 1,
    name: "Wild Mushroom Risotto",
    meta: "Porcini, truffle",
    category: "Main Course",
    price: "$28.50",
    active: true,
    img: "/vegmomo.jpg",
  },
  {
    id: 2,
    name: "Saffron Sea Bass",
    meta: "Pan-seared,...",
    category: "Seafood",
    price: "$34.00",
    active: false,
    img: "/vegmomo.jpg",
  },
  {
    id: 3,
    name: "Gold Leaf Lava Cake",
    meta: "70% Dark...",
    category: "Dessert",
    price: "$16.00",
    active: true,
    img: "/lemonade.jpg",
  },
];

/* ─── Toggle switch ──────────────────────────────────────── */
function StatusToggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={active}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        active ? "bg-green-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Menu inventory (grid / list) ───────────────────────── */
function MenuInventory() {
  const [items, setItems] = useState(menuInventory);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const toggleActive = (id: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, active: !it.active } : it)));
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || it.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">Menu Inventory ({filtered.length})</h2>

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
                view === "grid" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={`rounded-md p-1.5 ${
                view === "list" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {["All", ...categories].map((c) => (
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

      {/* Grid view */}
      {view === "grid" && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={item.img} alt={item.name} fill className="object-cover" />
              </div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="truncate text-[11px] text-gray-400">{item.meta}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-orange-600">{item.price}</span>
              </div>
              <span className="mb-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                {item.category}
              </span>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <StatusToggle active={item.active} onChange={() => toggleActive(item.id)} />
                <div className="flex items-center gap-3 text-gray-400">
                  <button className="hover:text-orange-600" aria-label="Edit dish">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="hover:text-rose-500" aria-label="Delete dish">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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

      {/* List view */}
      {view === "list" && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                <th className="pb-3 font-bold">Dish</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Price</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((item) => (
                <tr key={item.id} className="text-gray-700">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image src={item.img} alt={item.name} width={44} height={44} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="truncate text-[11px] text-gray-400">{item.meta}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-orange-600">{item.price}</td>
                  <td className="py-3">
                    <StatusToggle active={item.active} onChange={() => toggleActive(item.id)} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button className="hover:text-orange-600" aria-label="Edit dish">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="hover:text-rose-500" aria-label="Delete dish">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
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
          {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
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
                page === i + 1 ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
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
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MenuEditorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Menu Editor</h1>
          <p className="mt-1 text-sm text-gray-400">
            Curate your restaurant's digital presence and signature dishes.
          </p>
        </div>

        <div className="mt-6">
          <MenuInventory />
        </div>
      </main>
    </div>
  );
}
