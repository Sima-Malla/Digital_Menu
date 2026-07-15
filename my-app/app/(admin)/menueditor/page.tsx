"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  UploadCloud,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Sidebar from "@/components/HotelAdmin/Sidebar";

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

/* ─── Item details form ──────────────────────────────────── */
function ItemDetailsForm() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Item Details</h2>

      <label className="mt-4 flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-orange-300">
        <UploadCloud className="h-6 w-6" />
        <span className="text-xs font-semibold text-gray-500">Upload Dish Photo</span>
        <span className="text-[10px] text-gray-400">JPG, PNG (max. 5MB)</span>
        <input type="file" accept="image/png, image/jpeg" className="hidden" />
      </label>

      <div className="mt-5">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
          Item Name
        </label>
        <input
          type="text"
          placeholder="e.g. Wagyu Truffle Burger"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
        />
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
          Category
        </label>
        <div className="relative">
          <select className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Price ($)
          </label>
          <input
            type="text"
            placeholder="24.00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Calories
          </label>
          <input
            type="text"
            placeholder="450 kcal"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Briefly describe the ingredients and flavor profile..."
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
        />
      </div>

      <div className="mt-5 flex gap-3">
        <button className="flex-1 rounded-full bg-orange-500 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600">
          Save Item
        </button>
        <button className="flex-1 rounded-full border border-orange-300 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50">
          Discard
        </button>
      </div>
    </div>
  );
}

/* ─── Menu inventory table ───────────────────────────────── */
function MenuInventory() {
  const [items, setItems] = useState(menuInventory);

  const toggleActive = (id: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, active: !it.active } : it)));
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">Menu Inventory (24)</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search dish..."
            className="w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 outline-none focus:border-orange-300"
          />
        </div>
      </div>

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
            {items.map((item) => (
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
                    <button className="hover:text-orange-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-400">Showing 1 to 10 of 24 entries</p>
        <div className="flex items-center gap-1.5">
          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${
                p === 1 ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Menu Editor</h1>
              <p className="mt-1 text-sm text-gray-400">
                Curate your restaurant's digital presence and signature dishes.
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-800">
              <Plus className="h-4 w-4" /> Add New Dish
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
            <ItemDetailsForm />
            <MenuInventory />
          </div>
        </main>
      </div>
    </div>
  );
}