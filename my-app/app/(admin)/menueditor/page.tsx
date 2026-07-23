"use client";
import { useMemo, useState } from "react";
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
  Tag,
  Calendar,
  MoreVertical,
  X,
  LayoutGrid,
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

/* ─── Daily Specials Schedule ─────────────────────────────── */

type ScheduleType = "recurring" | "one-time";
type SpecialStatus = "today" | "upcoming" | "expired";

type Special = {
  id: number;
  dishName: string;
  badgeLabel: string;
  scheduleType: ScheduleType;
  weekday?: number; // 0 = Sunday ... 6 = Saturday, for recurring
  date?: string; // "YYYY-MM-DD", for one-time
  image?: string; // optional custom photo; falls back to the dish's own photo
};

// Prefer a custom photo (e.g. a seasonal plating shot for the special) but fall back to
// whatever photo the linked dish already uses in the inventory, so a card is never blank.
function getSpecialImage(special: Special): string {
  if (special.image) return special.image;
  const dish = menuInventory.find((item) => item.name === special.dishName);
  return dish?.img ?? "/vegmomo.jpg";
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const INITIAL_SPECIALS: Special[] = [
  { id: 1, dishName: "Wild Mushroom Risotto", badgeLabel: "Chef's Choice", scheduleType: "recurring", weekday: 1 },
  { id: 2, dishName: "Saffron Sea Bass", badgeLabel: "Today's Deal", scheduleType: "one-time", date: "2025-10-25" },
];

function formatOneTimeDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function getSpecialStatus(special: Special): SpecialStatus {
  const today = new Date();
  if (special.scheduleType === "recurring") {
    return today.getDay() === special.weekday ? "today" : "upcoming";
  }
  const target = new Date(`${special.date}T00:00:00`);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (target.getTime() === todayMidnight.getTime()) return "today";
  return target.getTime() > todayMidnight.getTime() ? "upcoming" : "expired";
}

const STATUS_CONFIG: Record<SpecialStatus, { label: string; badge: string }> = {
  today: { label: "TODAY", badge: "bg-orange-500 text-white" },
  upcoming: { label: "UPCOMING", badge: "bg-green-100 text-green-700" },
  expired: { label: "EXPIRED", badge: "bg-gray-200 text-gray-500" },
};

function DailySpecialsSchedule() {
  const [specials, setSpecials] = useState<Special[]>(INITIAL_SPECIALS);
  const [view, setView] = useState<"grid" | "calendar">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Form state
  const [formDish, setFormDish] = useState(menuInventory[0]?.name ?? "");
  const [formBadge, setFormBadge] = useState("");
  const [formScheduleType, setFormScheduleType] = useState<ScheduleType>("recurring");
  const [formWeekday, setFormWeekday] = useState(1);
  const [formDate, setFormDate] = useState("");
  const [formImage, setFormImage] = useState<string>("");

  const sortedSpecials = useMemo(() => {
    const order: Record<SpecialStatus, number> = { today: 0, upcoming: 1, expired: 2 };
    return [...specials].sort((a, b) => order[getSpecialStatus(a)] - order[getSpecialStatus(b)]);
  }, [specials]);

  const openAddModal = () => {
    setEditingId(null);
    setFormDish(menuInventory[0]?.name ?? "");
    setFormBadge("");
    setFormScheduleType("recurring");
    setFormWeekday(1);
    setFormDate("");
    setFormImage("");
    setShowModal(true);
  };

  const openEditModal = (special: Special) => {
    setEditingId(special.id);
    setFormDish(special.dishName);
    setFormBadge(special.badgeLabel);
    setFormScheduleType(special.scheduleType);
    setFormWeekday(special.weekday ?? 1);
    setFormDate(special.date ?? "");
    setFormImage(special.image ?? "");
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formImage.startsWith("blob:")) URL.revokeObjectURL(formImage);
    setFormImage(URL.createObjectURL(file));
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleRemoveCustomImage = () => {
    if (formImage.startsWith("blob:")) URL.revokeObjectURL(formImage);
    setFormImage("");
  };

  const handleSave = () => {
    if (!formDish || !formBadge.trim()) return;
    if (formScheduleType === "one-time" && !formDate) return;

    const payload: Omit<Special, "id"> = {
      dishName: formDish,
      badgeLabel: formBadge.trim(),
      scheduleType: formScheduleType,
      weekday: formScheduleType === "recurring" ? formWeekday : undefined,
      date: formScheduleType === "one-time" ? formDate : undefined,
      image: formImage || undefined,
    };

    if (editingId) {
      setSpecials((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s)));
    } else {
      setSpecials((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    setShowModal(false);
  };

  const handleRemove = (id: number) => {
    setSpecials((prev) => prev.filter((s) => s.id !== id));
    setOpenMenuId(null);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {openMenuId !== null && (
        <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">Daily Specials Schedule</h2>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setView(view === "grid" ? "calendar" : "grid")}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            {view === "grid" ? <Calendar className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
            {view === "grid" ? "Calendar View" : "Grid View"}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600"
          >
            <Plus className="h-3.5 w-3.5" /> Add Special
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSpecials.map((special) => {
            const status = getSpecialStatus(special);
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={special.id} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <div className="relative h-28 w-full bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element -- may be a blob: preview URL, which next/image can't optimize */}
                  <img
                    src={getSpecialImage(special)}
                    alt={special.dishName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <span
                    className={`absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                  <div className="absolute right-2.5 top-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === special.id ? null : special.id);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow hover:bg-white"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                    {openMenuId === special.id && (
                      <div className="absolute right-0 top-7 z-40 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                        <button
                          onClick={() => openEditModal(special)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleRemove(special.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm font-bold text-gray-900">{special.dishName}</p>

                  <div className="mt-2 flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Tag className="h-3.5 w-3.5 text-orange-500" />
                    Badge: {special.badgeLabel}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                    {special.scheduleType === "recurring"
                      ? `Every ${WEEKDAYS[special.weekday ?? 1]}`
                      : formatOneTimeDate(special.date ?? "")}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={openAddModal}
            className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-300 transition hover:border-orange-300 hover:text-orange-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold">Schedule New Special</span>
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((day, i) => {
              const daySpecials = specials.filter(
                (s) => s.scheduleType === "recurring" && s.weekday === i
              );
              const isToday = new Date().getDay() === i;
              return (
                <div
                  key={day}
                  className={`min-h-[110px] rounded-xl border p-2.5 ${
                    isToday ? "border-orange-300 bg-orange-50" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase ${isToday ? "text-orange-600" : "text-gray-400"}`}>
                    {day.slice(0, 3)}
                  </p>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {daySpecials.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => openEditModal(s)}
                        className="truncate rounded-md bg-orange-100 px-1.5 py-1 text-left text-[10px] font-semibold text-orange-700 hover:bg-orange-200"
                      >
                        {s.dishName}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
              One-Time Dated Specials
            </p>
            <div className="flex flex-col gap-2">
              {specials
                .filter((s) => s.scheduleType === "one-time")
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => openEditModal(s)}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left hover:border-orange-200"
                  >
                    <span className="text-xs font-semibold text-gray-700">{s.dishName}</span>
                    <span className="text-[11px] text-gray-400">{formatOneTimeDate(s.date ?? "")}</span>
                  </button>
                ))}
              {specials.filter((s) => s.scheduleType === "one-time").length === 0 && (
                <p className="text-xs text-gray-400">No one-time specials scheduled.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? "Edit Special" : "Add Special"}
              </h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Dish
                </label>
                <div className="relative">
                  <select
                    value={formDish}
                    onChange={(e) => setFormDish(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
                  >
                    {menuInventory.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Special Photo
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element -- may be a blob: preview URL */}
                    <img
                      src={formImage || menuInventory.find((item) => item.name === formDish)?.img || "/vegmomo.jpg"}
                      alt="Special preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
                      <UploadCloud className="h-3.5 w-3.5" />
                      Upload files
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {formImage ? (
                      <button
                        type="button"
                        onClick={handleRemoveCustomImage}
                        className="text-left text-[11px] font-semibold text-rose-500 hover:underline"
                      >
                        Remove — use dish photo instead
                      </button>
                    ) : (
                      <p className="text-[11px] text-gray-400">Using {formDish || "dish"}'s existing photo</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. Chef's Choice"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Schedule Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormScheduleType("recurring")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold ${
                      formScheduleType === "recurring"
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    Recurring
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormScheduleType("one-time")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold ${
                      formScheduleType === "one-time"
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    One-Time
                  </button>
                </div>
              </div>

              {formScheduleType === "recurring" ? (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Day of Week
                  </label>
                  <div className="relative">
                    <select
                      value={formWeekday}
                      onChange={(e) => setFormWeekday(Number(e.target.value))}
                      className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
                    >
                      {WEEKDAYS.map((day, i) => (
                        <option key={day} value={i}>
                          Every {day}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formBadge.trim() || (formScheduleType === "one-time" && !formDate)}
                className="rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? "Save Changes" : "Add Special"}
              </button>
            </div>
          </div>
        </div>
      )}
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

          <div className="mt-5">
            <DailySpecialsSchedule />
          </div>
        </main>
      </div>
    </div>
  );
}