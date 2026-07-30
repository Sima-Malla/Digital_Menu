"use client";

import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import {
  Plus,
  UploadCloud,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
  Tag,
  Calendar,
  MoreVertical,
  X,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import {
  createMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemActiveAction,
  type MenuItemState,
} from "@/app/actions/menu";
import {
  createSpecialAction,
  updateSpecialAction,
  deleteSpecialAction,
  type SpecialState,
} from "@/app/actions/specials";

/* ─── Types (mirror the serialized shape from page.tsx) ──── */
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: string;
  calories: number | null;
  imageUrl: string | null;
  isActive: boolean;
};

type Special = {
  id: string;
  menuItemId: string;
  dishName: string;
  dishImageUrl: string | null;
  badgeLabel: string;
  scheduleType: "recurring" | "one-time";
  weekday: number | null;
  date: string | null; // "YYYY-MM-DD"
  imageUrl: string | null;
};

const categories = ["Main Course", "Appetizer", "Seafood", "Dessert", "Beverage"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FALLBACK_IMG = "/vegmomo.jpg";

const menuItemInitial: MenuItemState = { success: false, message: "" };
const specialInitial: SpecialState = { success: false, message: "" };

/* ─── Toggle switch ──────────────────────────────────────── */
function StatusToggle({ active, onChange, disabled }: { active: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={active}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${
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

/* ─── Item details form (create + edit) ──────────────────── */
function ItemDetailsForm({
  editingItem,
  onDone,
}: {
  editingItem: MenuItem | null;
  onDone: () => void;
}) {
  // A single action that decides create vs. update based on whether an
  // "id" field is present — avoids swapping which action useActionState
  // is bound to mid-flow.
  const upsertAction = async (prevState: MenuItemState, formData: FormData) => {
    const result = formData.get("id")
      ? await updateMenuItemAction(prevState, formData)
      : await createMenuItemAction(prevState, formData);
    if (result.success) {
      formRef.current?.reset();
      setPreview(null);
      onDone();
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState<MenuItemState, FormData>(upsertAction, menuItemInitial);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const errors = state.fieldErrors ?? {};

  const displayImage = preview || editingItem?.imageUrl || null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">
          {editingItem ? "Edit Item" : "Item Details"}
        </h2>
        {editingItem && (
          <button
            type="button"
            onClick={onDone}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            Cancel edit
          </button>
        )}
      </div>

      {!state.success && state.message && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.message}
        </div>
      )}

      <form ref={formRef} action={formAction} key={editingItem?.id ?? "new"}>
        <input type="hidden" name="id" defaultValue={editingItem?.id ?? ""} />

        <label className="mt-4 flex h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-orange-300">
          {displayImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={displayImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <UploadCloud className="h-6 w-6" />
              <span className="text-xs font-semibold text-gray-500">Upload Dish Photo</span>
              <span className="text-[10px] text-gray-400">JPG, PNG (max. 5MB)</span>
            </>
          )}
          <input
            type="file"
            name="image"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>

        <div className="mt-5">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Item Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={editingItem?.name ?? ""}
            placeholder="e.g. Wagyu Truffle Burger"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Category
          </label>
          <div className="relative">
            <select
              name="category"
              defaultValue={editingItem?.category ?? categories[0]}
              className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Price ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              name="price"
              defaultValue={editingItem?.price ?? ""}
              placeholder="24.00"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Calories
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="calories"
              defaultValue={editingItem?.calories ?? ""}
              placeholder="450"
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
            name="description"
            defaultValue={editingItem?.description ?? ""}
            placeholder="Briefly describe the ingredients and flavor profile..."
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-orange-500 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? "Saving…" : editingItem ? "Save Changes" : "Save Item"}
          </button>
          <button
            type="button"
            onClick={() => {
              formRef.current?.reset();
              setPreview(null);
              onDone();
            }}
            className="flex-1 rounded-full border border-orange-300 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Menu inventory table ───────────────────────────────── */
function MenuInventory({
  items,
  onEdit,
}: {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const handleToggle = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      try {
        await toggleMenuItemActiveAction(id);
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this dish? This can't be undone.")) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteMenuItemAction(id);
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">Menu Inventory ({items.length})</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  {items.length === 0 ? "No dishes yet — add your first one." : "No dishes match your search."}
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id} className="text-gray-700">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || FALLBACK_IMG}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="truncate text-[11px] text-gray-400">
                        {item.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 font-semibold text-orange-600">${item.price}</td>
                <td className="py-3">
                  <StatusToggle
                    active={item.isActive}
                    onChange={() => handleToggle(item.id)}
                    disabled={isPending && pendingId === item.id}
                  />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <button onClick={() => onEdit(item)} className="hover:text-orange-600" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending && pendingId === item.id}
                      className="hover:text-rose-500 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Daily Specials Schedule ─────────────────────────────── */
function getSpecialStatus(special: Special): "today" | "upcoming" | "expired" {
  const today = new Date();
  if (special.scheduleType === "recurring") {
    return today.getDay() === special.weekday ? "today" : "upcoming";
  }
  if (!special.date) return "upcoming";
  const target = new Date(`${special.date}T00:00:00`);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (target.getTime() === todayMidnight.getTime()) return "today";
  return target.getTime() > todayMidnight.getTime() ? "upcoming" : "expired";
}

const STATUS_CONFIG = {
  today: { label: "TODAY", badge: "bg-orange-500 text-white" },
  upcoming: { label: "UPCOMING", badge: "bg-green-100 text-green-700" },
  expired: { label: "EXPIRED", badge: "bg-gray-200 text-gray-500" },
} as const;

function formatOneTimeDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function DailySpecialsSchedule({ specials, items }: { specials: Special[]; items: MenuItem[] }) {
  const [view, setView] = useState<"grid" | "calendar">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Special | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<"recurring" | "one-time">("recurring");
  const [isPending, startTransition] = useTransition();

  const sortedSpecials = useMemo(() => {
    const order = { today: 0, upcoming: 1, expired: 2 };
    return [...specials].sort((a, b) => order[getSpecialStatus(a)] - order[getSpecialStatus(b)]);
  }, [specials]);

  const upsertAction = async (prevState: SpecialState, formData: FormData) => {
    const result = formData.get("id")
      ? await updateSpecialAction(prevState, formData)
      : await createSpecialAction(prevState, formData);
    if (result.success) {
      setShowModal(false);
      setEditing(null);
    }
    return result;
  };

  const [state, formAction, isSaving] = useActionState<SpecialState, FormData>(upsertAction, specialInitial);
  const errors = state.fieldErrors ?? {};

  const openAddModal = () => {
    setEditing(null);
    setScheduleType("recurring");
    setShowModal(true);
  };

  const openEditModal = (special: Special) => {
    setEditing(special);
    setScheduleType(special.scheduleType);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleRemove = (id: string) => {
    if (!confirm("Remove this special?")) return;
    setOpenMenuId(null);
    startTransition(async () => {
      await deleteSpecialAction(id);
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {openMenuId !== null && <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />}

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
            disabled={items.length === 0}
            className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add Special
          </button>
        </div>
      </div>
      {items.length === 0 && (
        <p className="mt-2 text-xs text-gray-400">Add a dish to your inventory before scheduling a special.</p>
      )}

      {view === "grid" ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSpecials.map((special) => {
            const status = getSpecialStatus(special);
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={special.id} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <div className="relative h-28 w-full bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={special.imageUrl || special.dishImageUrl || FALLBACK_IMG}
                    alt={special.dishName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <span className={`absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide ${cfg.badge}`}>
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
                          disabled={isPending}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-50"
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
                      : special.date
                      ? formatOneTimeDate(special.date)
                      : "—"}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={openAddModal}
            disabled={items.length === 0}
            className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-300 transition hover:border-orange-300 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
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
              const daySpecials = specials.filter((s) => s.scheduleType === "recurring" && s.weekday === i);
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
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">One-Time Dated Specials</p>
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
                    <span className="text-[11px] text-gray-400">{s.date ? formatOneTimeDate(s.date) : "—"}</span>
                  </button>
                ))}
              {specials.filter((s) => s.scheduleType === "one-time").length === 0 && (
                <p className="text-xs text-gray-400">No one-time specials scheduled.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{editing ? "Edit Special" : "Add Special"}</h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!state.success && state.message && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {state.message}
              </div>
            )}

            <form action={formAction} className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="id" defaultValue={editing?.id ?? ""} />

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Dish</label>
                <div className="relative">
                  <select
                    name="menuItemId"
                    defaultValue={editing?.menuItemId ?? items[0]?.id}
                    className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
                  >
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.menuItemId && <p className="mt-1 text-xs text-red-600">{errors.menuItemId}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Special Photo (optional — falls back to dish photo)
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/png, image/jpeg"
                  className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-full file:border file:border-gray-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-gray-600 hover:file:bg-gray-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Badge Label</label>
                <input
                  type="text"
                  name="badgeLabel"
                  defaultValue={editing?.badgeLabel ?? ""}
                  placeholder="e.g. Chef's Choice"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
                />
                {errors.badgeLabel && <p className="mt-1 text-xs text-red-600">{errors.badgeLabel}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Schedule Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleType("recurring")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold ${
                      scheduleType === "recurring" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    Recurring
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType("one-time")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold ${
                      scheduleType === "one-time" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    One-Time
                  </button>
                </div>
                <input type="hidden" name="scheduleType" value={scheduleType} />
              </div>

              {scheduleType === "recurring" ? (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Day of Week</label>
                  <div className="relative">
                    <select
                      name="weekday"
                      defaultValue={editing?.weekday ?? 1}
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
                  {errors.weekday && <p className="mt-1 text-xs text-red-600">{errors.weekday}</p>}
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editing?.date ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
                  />
                  {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                </div>
              )}

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : editing ? "Save Changes" : "Add Special"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MenuEditorClient({
  initialItems,
  initialSpecials,
}: {
  initialItems: MenuItem[];
  initialSpecials: Special[];
}) {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Menu Editor</h1>
          <p className="mt-1 text-sm text-gray-400">
            Curate your restaurant&apos;s digital presence and signature dishes.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <ItemDetailsForm editingItem={editingItem} onDone={() => setEditingItem(null)} />
        <MenuInventory items={initialItems} onEdit={setEditingItem} />
      </div>

      <div className="mt-5">
        <DailySpecialsSchedule specials={initialSpecials} items={initialItems} />
      </div>
    </>
  );
}