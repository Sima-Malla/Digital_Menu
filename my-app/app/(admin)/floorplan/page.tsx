"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import { useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Plus,
  LayoutGrid,
  Rows3,
  Map,
  Search,
  ChevronDown,
  MoreVertical,
  Users,
  CheckCircle2,
  Sparkles,
  Wrench,
  Ban,
  X,
  Pencil,
  Copy,
  Trash2,
  UtensilsCrossed,
  BedDouble,
  TrendingUp,
  ArrowUpRight,
  Info,
  DoorClosed,
  UserCheck,
  ClipboardList,
  ChefHat,
  Truck,
  PackageCheck,
  BellOff,
  Phone,
  QrCode,
  Download,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */

type AreaType = "dining" | "rooms";
type AreaStatus = "available" | "cleaning" | "occupied" | "maintenance" | "blocked";
// Room-service pipeline — what's actually happening with a guest ordering food from their room,
// as distinct from AreaStatus (which describes whether a whole wing/dining space is operating).
type RoomOrderStatus =
  | "vacant"
  | "checked_in"
  | "order_placed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "do_not_disturb";
type SubUnitStatus = AreaStatus | RoomOrderStatus;
type ViewMode = "grid" | "list" | "visual";
type SortKey = "capacityDesc" | "capacityAsc" | "nameAsc" | "status";

type SubUnit = {
  id: string;
  label: string;
  status: SubUnitStatus;
  // Room-service only:
  guestName?: string | null;
  orderItems?: string[];
  orderPlacedAt?: string;
};

type Area = {
  id: string;
  type: AreaType;
  name: string;
  status: AreaStatus;
  capacity: number;
  unitCount: number;
  style: string;
  note: string;
  occupancyRate: number;
  revenueToday: number;
  subUnits: SubUnit[];
};

/* ─── Config ──────────────────────────────────────────────── */

// Replace with your live ordering domain — each table/room gets its own link off this base.
const ORDER_BASE_URL = "https://menu.gourmetflow.app/order";

const STATUS_CONFIG: Record<
  SubUnitStatus,
  { label: string; dot: string; badge: string; icon: React.ElementType; description: string }
> = {
  // Dining / wing-level operational statuses
  available: {
    label: "Available",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle2,
    description: "Open and ready to seat or book.",
  },
  cleaning: {
    label: "Cleaning Needed",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    icon: Sparkles,
    description: "Turnover in progress between guests.",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    icon: Users,
    description: "Currently seated or in use.",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-gray-400",
    badge: "bg-gray-200 text-gray-600",
    icon: Wrench,
    description: "Out of service for repairs.",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-gray-900",
    badge: "bg-gray-800 text-white",
    icon: Ban,
    description: "Manually closed off — not bookable.",
  },
  // Room-service pipeline (per room, not per wing)
  vacant: {
    label: "Vacant",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-500",
    icon: DoorClosed,
    description: "No guest checked in — nothing to deliver.",
  },
  checked_in: {
    label: "Checked-In",
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-600",
    icon: UserCheck,
    description: "Guest is in the room, no active order.",
  },
  order_placed: {
    label: "Order Placed",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    icon: ClipboardList,
    description: "Order received — waiting on the kitchen.",
  },
  preparing: {
    label: "Preparing",
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700",
    icon: ChefHat,
    description: "Kitchen is actively cooking the order.",
  },
  on_the_way: {
    label: "On The Way",
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-700",
    icon: Truck,
    description: "Staff is delivering the order to the room.",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    icon: PackageCheck,
    description: "Order has reached the guest.",
  },
  do_not_disturb: {
    label: "Do Not Disturb",
    dot: "bg-gray-900",
    badge: "bg-gray-800 text-white",
    icon: BellOff,
    description: "Guest requested no service — hold all deliveries.",
  },
};

const DINING_STATUS_ORDER: AreaStatus[] = ["available", "cleaning", "occupied", "maintenance", "blocked"];
const ROOM_ORDER_STATUS_ORDER: RoomOrderStatus[] = [
  "vacant",
  "checked_in",
  "order_placed",
  "preparing",
  "on_the_way",
  "delivered",
  "do_not_disturb",
];

const TYPE_CONFIG: Record<
  AreaType,
  {
    tabLabel: string;
    unitLabel: string; // singular, e.g. "Table" / "Room"
    unitLabelPlural: string;
    icon: React.ElementType;
    stylePresets: string[];
    capacityFieldLabel: string;
    unitFieldLabel: string;
  }
> = {
  dining: {
    tabLabel: "Tables & Dining",
    unitLabel: "Table",
    unitLabelPlural: "Tables",
    icon: UtensilsCrossed,
    stylePresets: ["Fine Dining", "Casual Dining", "Lounge", "Speakeasy Bar", "Rooftop / Outdoor", "Café Seating"],
    capacityFieldLabel: "Total Seating Capacity",
    unitFieldLabel: "Number of Tables",
  },
  rooms: {
    tabLabel: "Rooms & Stay",
    unitLabel: "Room",
    unitLabelPlural: "Rooms",
    icon: BedDouble,
    stylePresets: ["Standard Room", "Deluxe Room", "Executive Suite", "Luxury Suite", "Penthouse", "Accessible Room"],
    capacityFieldLabel: "Max Guest Capacity",
    unitFieldLabel: "Number of Rooms",
  },
};

/* ─── Deterministic seed helpers (avoid hydration mismatches) ─ */

const STATUS_CYCLE: AreaStatus[] = ["available", "available", "available", "occupied", "cleaning", "maintenance"];

function makeSubUnits(count: number, unitLabel: string, offset: number): SubUnit[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${unitLabel}-${offset}-${i + 1}`,
    label: `${unitLabel} ${i + 1}`,
    status: STATUS_CYCLE[(i + offset) % STATUS_CYCLE.length],
  }));
}

const ROOM_STATUS_CYCLE: RoomOrderStatus[] = [
  "vacant",
  "checked_in",
  "order_placed",
  "preparing",
  "on_the_way",
  "delivered",
  "checked_in",
  "do_not_disturb",
];
const GUEST_NAMES = [
  "Daniel Cho",
  "Priya Patel",
  "Andres Ruiz",
  "Emily Novak",
  "Kenji Watanabe",
  "Sara Lindqvist",
  "Omar Haddad",
  "Lucia Ferreira",
];
const ORDER_ITEM_SETS = [
  ["Club Sandwich", "Iced Tea"],
  ["Margherita Pizza", "Sparkling Water"],
  ["Caesar Salad", "Lemonade"],
  ["Grilled Salmon", "House Wine"],
  ["Pancake Stack", "Orange Juice"],
];
const TIME_LABELS = ["5 min ago", "12 min ago", "20 min ago", "35 min ago", "1 hr ago"];

const ORDER_ACTIVE_STATUSES: RoomOrderStatus[] = ["order_placed", "preparing", "on_the_way"];

function makeRoomSubUnits(count: number, statusOffset: number): SubUnit[] {
  return Array.from({ length: count }).map((_, i) => {
    const status = ROOM_STATUS_CYCLE[(i + statusOffset) % ROOM_STATUS_CYCLE.length];
    const hasGuest = status !== "vacant";
    const hasOrder = hasGuest && status !== "checked_in" && status !== "do_not_disturb";
    return {
      id: `Room-${statusOffset}-${i + 1}`,
      label: `Room ${i + 1}`,
      status,
      guestName: hasGuest ? GUEST_NAMES[(i + statusOffset) % GUEST_NAMES.length] : null,
      orderItems: hasOrder ? ORDER_ITEM_SETS[(i + statusOffset) % ORDER_ITEM_SETS.length] : undefined,
      orderPlacedAt: hasOrder ? TIME_LABELS[(i + statusOffset) % TIME_LABELS.length] : undefined,
    };
  });
}

/* ─── Seed data ───────────────────────────────────────────── */

const INITIAL_AREAS: Area[] = [
  {
    id: "AREA-1",
    type: "dining",
    name: "Main Dining Hall",
    status: "available",
    capacity: 84,
    unitCount: 24,
    style: "Fine Dining",
    note: "Formal dress code, host-seated only.",
    occupancyRate: 92,
    revenueToday: 2400,
    subUnits: makeSubUnits(24, "Table", 0),
  },
  {
    id: "AREA-2",
    type: "dining",
    name: "Rooftop Terrace",
    status: "cleaning",
    capacity: 120,
    unitCount: 18,
    style: "Rooftop / Outdoor",
    note: "Self-service bar during Happy Hour.",
    occupancyRate: 78,
    revenueToday: 1850,
    subUnits: makeSubUnits(18, "Table", 3),
  },
  {
    id: "AREA-3",
    type: "dining",
    name: "The Vault Bar",
    status: "maintenance",
    capacity: 45,
    unitCount: 12,
    style: "Speakeasy Bar",
    note: "AC system offline for repair.",
    occupancyRate: 12,
    revenueToday: 210,
    subUnits: makeSubUnits(12, "Table", 5),
  },
  {
    id: "AREA-4",
    type: "dining",
    name: "Garden Café",
    status: "available",
    capacity: 36,
    unitCount: 10,
    style: "Café Seating",
    note: "Walk-ins welcome, pet-friendly patio.",
    occupancyRate: 54,
    revenueToday: 640,
    subUnits: makeSubUnits(10, "Table", 7),
  },
  {
    id: "AREA-5",
    type: "rooms",
    name: "Standard Rooms",
    status: "available",
    capacity: 2,
    unitCount: 20,
    style: "Standard Room",
    note: "Comfortable rooms with essential amenities and daily housekeeping.",
    occupancyRate: 58,
    revenueToday: 2600,
    subUnits: makeRoomSubUnits(20, 0),
  },
  {
    id: "AREA-6",
    type: "rooms",
    name: "Deluxe Rooms",
    status: "available",
    capacity: 2,
    unitCount: 14,
    style: "Deluxe Room",
    note: "Complimentary breakfast, upgraded room views.",
    occupancyRate: 68,
    revenueToday: 3100,
    subUnits: makeRoomSubUnits(14, 2),
  },
  {
    id: "AREA-7",
    type: "rooms",
    name: "Executive Suites",
    status: "cleaning",
    capacity: 3,
    unitCount: 8,
    style: "Executive Suite",
    note: "Turn-down service, private lounge access.",
    occupancyRate: 45,
    revenueToday: 1975,
    subUnits: makeRoomSubUnits(8, 4),
  },
  {
    id: "AREA-8",
    type: "rooms",
    name: "Premium Suites",
    status: "occupied",
    capacity: 4,
    unitCount: 3,
    style: "Penthouse",
    note: "Personal butler service, premium amenities included.",
    occupancyRate: 100,
    revenueToday: 4200,
    subUnits: makeRoomSubUnits(3, 1),
  },
];

/* ─── Small components ────────────────────────────────────── */

function StatusBadge({ status }: { status: SubUnitStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={checked}
      aria-label={label}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
        checked ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white hover:border-orange-300"
      }`}
    >
      {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </button>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function AreaManagementPage() {
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [activeType, setActiveType] = useState<AreaType>("dining");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("capacityDesc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [drawerAreaId, setDrawerAreaId] = useState<string | null>(null);
  const [selectedSubUnitId, setSelectedSubUnitId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Modal (new / edit)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<AreaType>("dining");
  const [formName, setFormName] = useState("");
  const [formUnitCount, setFormUnitCount] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formStyle, setFormStyle] = useState(TYPE_CONFIG.dining.stylePresets[0]);
  const [formNote, setFormNote] = useState("");

  const fireToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  /* ── QR codes ─────────────────────────────────────────── */

  const buildOrderUrl = (area: Area, unit: SubUnit) => {
    const params = new URLSearchParams({
      type: area.type,
      area: area.name,
      unit: unit.label,
    });
    return `${ORDER_BASE_URL}?${params.toString()}`;
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single table/room: QR code with the name printed underneath, ready to laminate.
  const downloadSingleQR = async (area: Area, unit: SubUnit) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(buildOrderUrl(area, unit), {
        width: 512,
        margin: 2,
        color: { dark: "#111827", light: "#FFFFFF" },
      });

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 580;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 512, 512);
          ctx.fillStyle = "#111827";
          ctx.font = "bold 30px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${area.name} — ${unit.label}`, 256, 552);
          resolve();
        };
        img.src = qrDataUrl;
      });

      triggerDownload(canvas.toDataURL("image/png"), `${area.name}-${unit.label}-QR.png`.replace(/\s+/g, "-"));
      fireToast(`QR code for ${unit.label} downloaded.`);
    } catch {
      fireToast("Couldn't generate that QR code — try again.");
    }
  };

  // Whole area: one printable sheet with every table/room's QR code laid out in a grid.
  const downloadAreaQRSheet = async (area: Area) => {
    fireToast(`Generating QR sheet for ${area.name}…`);
    try {
      const cellSize = 240;
      const cols = 4;
      const rows = Math.ceil(area.subUnits.length / cols);
      const canvas = document.createElement("canvas");
      canvas.width = cols * cellSize;
      canvas.height = rows * cellSize + 70;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#111827";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(area.name, 20, 42);

      const qrDataUrls = await Promise.all(
        area.subUnits.map((unit) =>
          QRCode.toDataURL(buildOrderUrl(area, unit), { width: 200, margin: 1 })
        )
      );

      await Promise.all(
        qrDataUrls.map(
          (dataUrl, i) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = col * cellSize + 20;
                const y = row * cellSize + 70;
                ctx.drawImage(img, x, y, 200, 200);
                ctx.fillStyle = "#374151";
                ctx.font = "600 14px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(area.subUnits[i].label, x + 100, y + 222);
                resolve();
              };
              img.src = dataUrl;
            })
        )
      );

      triggerDownload(canvas.toDataURL("image/png"), `${area.name}-QR-Sheet.png`.replace(/\s+/g, "-"));
      fireToast(`QR sheet for ${area.name} downloaded.`);
    } catch {
      fireToast("Couldn't generate the QR sheet — try again.");
    }
  };

  /* ── Derived data ─────────────────────────────────────── */

  const visibleAreas = useMemo(() => {
    let list = areas.filter((a) => a.type === activeType);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.style.toLowerCase().includes(q) ||
          a.note.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sortKey) {
      case "capacityDesc":
        sorted.sort((a, b) => b.capacity - a.capacity);
        break;
      case "capacityAsc":
        sorted.sort((a, b) => a.capacity - b.capacity);
        break;
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "status":
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }
    return sorted;
  }, [areas, activeType, searchTerm, sortKey]);

  const typeCfg = TYPE_CONFIG[activeType];
  const drawerArea = areas.find((a) => a.id === drawerAreaId) ?? null;
  const selectedSubUnit = drawerArea?.subUnits.find((u) => u.id === selectedSubUnitId) ?? null;

  const getActiveOrderCount = (area: Area) =>
    area.type === "rooms"
      ? area.subUnits.filter((u) => ORDER_ACTIVE_STATUSES.includes(u.status as RoomOrderStatus)).length
      : 0;

  const topPerformers = useMemo(() => {
    return [...areas]
      .filter((a) => a.type === activeType)
      .sort((a, b) => b.occupancyRate - a.occupancyRate)
      .slice(0, 3);
  }, [areas, activeType]);

  /* ── Selection ────────────────────────────────────────── */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const applyBulkStatus = (status: AreaStatus) => {
    if (selectedIds.length === 0) return;
    setAreas((prev) => prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status } : a)));
    fireToast(`${selectedIds.length} area${selectedIds.length > 1 ? "s" : ""} set to ${STATUS_CONFIG[status].label}.`);
    clearSelection();
  };

  /* ── Modal handlers ───────────────────────────────────── */

  const openNewAreaModal = () => {
    setEditingId(null);
    setFormType(activeType);
    setFormName("");
    setFormUnitCount("");
    setFormCapacity("");
    setFormStyle(TYPE_CONFIG[activeType].stylePresets[0]);
    setFormNote("");
    setShowModal(true);
  };

  const openEditAreaModal = (area: Area) => {
    setEditingId(area.id);
    setFormType(area.type);
    setFormName(area.name);
    setFormUnitCount(String(area.unitCount));
    setFormCapacity(String(area.capacity));
    setFormStyle(area.style);
    setFormNote(area.note);
    setShowModal(true);
    setOpenMenuId(null);
    // Editing can be triggered from inside the drawer (its "Edit Details" button). If we don't
    // close the drawer here, its full-screen backdrop stays mounted at the same z-index and,
    // since it renders after the modal in the DOM, silently intercepts clicks/typing meant for
    // the modal's inputs — the modal is visible but not actually reachable.
    setDrawerAreaId(null);
    setSelectedSubUnitId(null);
  };

  const openDrawer = (areaId: string) => {
    setDrawerAreaId(areaId);
    setSelectedSubUnitId(null);
    setShowLegend(false);
  };
  const closeDrawer = () => {
    setDrawerAreaId(null);
    setSelectedSubUnitId(null);
  };

  const generateSubUnits = (type: AreaType, count: number, offset: number): SubUnit[] =>
    type === "rooms" ? makeRoomSubUnits(count, offset) : makeSubUnits(count, TYPE_CONFIG[type].unitLabel, offset);

  const handleSaveArea = () => {
    const unitCount = parseInt(formUnitCount, 10);
    const capacity = parseInt(formCapacity, 10);
    if (!formName.trim() || !unitCount || unitCount < 1 || !capacity || capacity < 1) return;

    if (editingId) {
      setAreas((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                type: formType,
                name: formName.trim(),
                unitCount,
                capacity,
                style: formStyle,
                note: formNote.trim(),
                subUnits:
                  unitCount !== a.unitCount || formType !== a.type
                    ? generateSubUnits(formType, unitCount, 0)
                    : a.subUnits,
              }
            : a
        )
      );
      fireToast(`${formName.trim()} updated.`);
    } else {
      const newArea: Area = {
        id: `AREA-${Date.now()}`,
        type: formType,
        name: formName.trim(),
        status: "available",
        capacity,
        unitCount,
        style: formStyle,
        note: formNote.trim(),
        occupancyRate: 0,
        revenueToday: 0,
        subUnits: generateSubUnits(formType, unitCount, 0),
      };
      setAreas((prev) => [newArea, ...prev]);
      fireToast(`${newArea.name} added to ${TYPE_CONFIG[formType].tabLabel}.`);
    }
    setShowModal(false);
  };

  const handleDuplicateArea = (area: Area) => {
    const copy: Area = {
      ...area,
      id: `AREA-${Date.now()}`,
      name: `${area.name} (Copy)`,
      subUnits: generateSubUnits(area.type, area.unitCount, 9),
    };
    setAreas((prev) => [copy, ...prev]);
    fireToast(`Duplicated as "${copy.name}".`);
    setOpenMenuId(null);
  };

  const handleDeleteArea = (area: Area) => {
    setAreas((prev) => prev.filter((a) => a.id !== area.id));
    setSelectedIds((prev) => prev.filter((id) => id !== area.id));
    if (drawerAreaId === area.id) setDrawerAreaId(null);
    fireToast(`${area.name} deleted.`);
    setOpenMenuId(null);
  };

  // Dining tables: quick tap cycles straight through the operational states.
  const cycleSubUnitStatus = (areaId: string, subUnitId: string) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : {
              ...a,
              subUnits: a.subUnits.map((s) =>
                s.id !== subUnitId
                  ? s
                  : {
                      ...s,
                      status:
                        DINING_STATUS_ORDER[
                          (DINING_STATUS_ORDER.indexOf(s.status as AreaStatus) + 1) % DINING_STATUS_ORDER.length
                        ],
                    }
              ),
            }
      )
    );
  };

  // Rooms: staff pick the exact stage from the chip row in the detail panel — no guessing which
  // direction "tap to cycle" moves, since Do Not Disturb shouldn't sit in a linear sequence.
  const setRoomSubUnitStatus = (areaId: string, subUnitId: string, status: RoomOrderStatus) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : {
              ...a,
              subUnits: a.subUnits.map((s) => (s.id !== subUnitId ? s : { ...s, status })),
            }
      )
    );
  };

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      {/* Close any open card menu when clicking elsewhere */}
      {openMenuId && (
        <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1320px] px-8 py-8">
          {toast && (
            <div role="status" className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-[13px] font-medium text-green-700">{toast}</span>
            </div>
          )}

          {/* ── Header ─────────────────────────────────── */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-bold text-gray-900">
                Area &amp; Space Management
              </h1>
              <p className="mt-1 text-[13px] text-gray-500">
                Manage your dining areas and rooms, and print QR codes for guest ordering.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={openNewAreaModal}
                className="flex items-center gap-1.5 rounded-xl border border-orange-500 px-4 py-2.5 text-[13px] font-semibold text-orange-500 transition hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                New Area
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "visual" ? "grid" : "visual")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold shadow-sm transition ${
                  viewMode === "visual"
                    ? "bg-orange-600 text-white"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2.5} />
                Visual Layout
              </button>
            </div>
          </div>

          {/* ── Type tabs + search ─────────────────────── */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1">
              {(Object.keys(TYPE_CONFIG) as AreaType[]).map((t) => {
                const cfg = TYPE_CONFIG[t];
                const active = activeType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setActiveType(t);
                      clearSelection();
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition ${
                      active ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <cfg.icon className="h-4 w-4" />
                    {cfg.tabLabel}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${typeCfg.tabLabel.toLowerCase()}...`}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-gray-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* ── Toolbar ────────────────────────────────── */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {selectedIds.length > 0 ? (
                <>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                    <Info className="h-4 w-4 text-orange-500" />
                    {selectedIds.length} Area{selectedIds.length > 1 ? "s" : ""} Selected
                  </div>
                  <button
                    onClick={() => applyBulkStatus("available")}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  >
                    Set Available
                  </button>
                  <button
                    onClick={() => applyBulkStatus("maintenance")}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 transition hover:border-gray-400 hover:bg-gray-50"
                  >
                    Set Maintenance
                  </button>
                  <button
                    onClick={() => applyBulkStatus("blocked")}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-red-500 transition hover:bg-red-50"
                  >
                    Block Area
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <p className="text-[13px] text-gray-400">
                  Select areas below to apply bulk actions.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-[12px] font-semibold text-gray-600 outline-none focus:border-orange-400"
                >
                  <option value="capacityDesc">Sort: Capacity (High–Low)</option>
                  <option value="capacityAsc">Sort: Capacity (Low–High)</option>
                  <option value="nameAsc">Sort: Name (A–Z)</option>
                  <option value="status">Sort: Status</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  className={`rounded-md p-1.5 transition ${viewMode === "grid" ? "bg-orange-100 text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  className={`rounded-md p-1.5 transition ${viewMode === "list" ? "bg-orange-100 text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Rows3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("visual")}
                  aria-pressed={viewMode === "visual"}
                  className={`rounded-md p-1.5 transition ${viewMode === "visual" ? "bg-orange-100 text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Empty state ────────────────────────────── */}
          {visibleAreas.length === 0 && (
            <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <typeCfg.icon className="h-8 w-8 text-gray-300" />
              <p className="mt-3 text-[14px] font-semibold text-gray-600">
                {searchTerm ? `No ${typeCfg.tabLabel.toLowerCase()} match "${searchTerm}"` : `No ${typeCfg.tabLabel.toLowerCase()} yet`}
              </p>
              <p className="mt-1 text-[12px] text-gray-400">
                {searchTerm ? "Try a different search term." : `Add your first area to start managing ${typeCfg.unitLabelPlural.toLowerCase()}.`}
              </p>
              {!searchTerm && (
                <button
                  onClick={openNewAreaModal}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  New Area
                </button>
              )}
            </div>
          )}

          {/* ── GRID VIEW ──────────────────────────────── */}
          {viewMode === "grid" && visibleAreas.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {visibleAreas.map((area) => {
                const cfg = TYPE_CONFIG[area.type];
                const Icon = cfg.icon;
                const checked = selectedIds.includes(area.id);
                return (
                  <div
                    key={area.id}
                    className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                      checked ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                      <Icon className="h-9 w-9 text-white/25" strokeWidth={1.5} />
                      <div className="absolute left-2.5 top-2.5">
                        <Checkbox checked={checked} onToggle={() => toggleSelect(area.id)} label={`Select ${area.name}`} />
                      </div>
                      <div className="absolute right-2.5 top-2.5">
                        <StatusBadge status={area.status} />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-[14px] font-bold text-gray-900">{area.name}</h3>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === area.id ? null : area.id);
                            }}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenuId === area.id && (
                            <div className="absolute right-0 top-7 z-40 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                              <button
                                onClick={() => openEditAreaModal(area)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDuplicateArea(area)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <Copy className="h-3.5 w-3.5" /> Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  downloadAreaQRSheet(area);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <QrCode className="h-3.5 w-3.5" /> Download QR Sheet
                              </button>
                              <button
                                onClick={() => handleDeleteArea(area)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> Cap: {area.capacity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon className="h-3 w-3" /> {area.unitCount} {area.unitCount === 1 ? cfg.unitLabel : cfg.unitLabelPlural}
                        </span>
                      </div>

                      {area.type === "rooms" && (
                        <div className="mt-2">
                          {getActiveOrderCount(area) > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                              <ChefHat className="h-3 w-3" />
                              {getActiveOrderCount(area)} Active Order{getActiveOrderCount(area) > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-400">
                              <CheckCircle2 className="h-3 w-3" />
                              No Active Orders
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          {area.style}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">{area.note}</p>
                      </div>

                      <button
                        onClick={() => openDrawer(area.id)}
                        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2.5 text-[12px] font-semibold text-gray-700 transition hover:bg-gray-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {area.type === "rooms" ? "Manage Rooms" : "Manage Layout"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── LIST VIEW ──────────────────────────────── */}
          {viewMode === "list" && visibleAreas.length > 0 && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-[24px_1.5fr_1fr_1fr_1fr_100px] items-center gap-3 bg-gray-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span />
                <span>Area</span>
                <span>Status</span>
                <span>Capacity</span>
                <span>Style</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-gray-100">
                {visibleAreas.map((area) => {
                  const cfg = TYPE_CONFIG[area.type];
                  const checked = selectedIds.includes(area.id);
                  return (
                    <div
                      key={area.id}
                      className={`grid grid-cols-[24px_1.5fr_1fr_1fr_1fr_100px] items-center gap-3 px-4 py-3.5 ${
                        checked ? "bg-orange-50/50" : ""
                      }`}
                    >
                      <Checkbox checked={checked} onToggle={() => toggleSelect(area.id)} label={`Select ${area.name}`} />
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{area.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {area.unitCount} {cfg.unitLabelPlural.toLowerCase()}
                        </p>
                      </div>
                      <StatusBadge status={area.status} />
                      <span className="text-[13px] text-gray-600">{area.capacity} guests</span>
                      <span className="text-[13px] text-gray-600">{area.style}</span>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDrawer(area.id)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VISUAL VIEW ────────────────────────────── */}
          {viewMode === "visual" && visibleAreas.length > 0 && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
              <p className="mb-4 text-[12px] text-gray-400">
                Tile size reflects capacity. Click a space to manage it.
              </p>
              <div className="grid auto-rows-[100px] grid-cols-4 gap-3">
                {visibleAreas.map((area) => {
                  const cfg = STATUS_CONFIG[area.status];
                  const span =
                    area.capacity >= 100 ? "col-span-2 row-span-2" : area.capacity >= 40 ? "col-span-2" : "col-span-1";
                  return (
                    <button
                      key={area.id}
                      onClick={() => openDrawer(area.id)}
                      className={`${span} flex flex-col justify-between rounded-xl p-3 text-left text-white shadow-sm transition hover:opacity-90 ${cfg.dot}`}
                    >
                      <span className="text-[12px] font-bold leading-tight">{area.name}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                        {cfg.label} · Cap {area.capacity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Bottom panels ──────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Area Performance */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-gray-900">Area Performance</h2>
                <button
                  onClick={() => fireToast("Opening full analytics…")}
                  className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-600"
                >
                  VIEW ANALYTICS
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {topPerformers.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{area.name}</p>
                        <p className="text-[11px] text-gray-400">{area.occupancyRate}% occupancy today</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-green-600">
                      +${(area.revenueToday / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <p className="py-4 text-center text-[12px] text-gray-400">No data yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── New / Edit Area Modal ────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-900">
                {editingId ? "Edit Area" : "New Area"}
              </h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Type toggle */}
            <div className="mt-5 flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-1">
              {(Object.keys(TYPE_CONFIG) as AreaType[]).map((t) => {
                const cfg = TYPE_CONFIG[t];
                const active = formType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFormType(t);
                      setFormStyle(TYPE_CONFIG[t].stylePresets[0]);
                    }}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
                      active ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:bg-white"
                    }`}
                  >
                    <cfg.icon className="h-3.5 w-3.5" />
                    {cfg.tabLabel}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Area Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={formType === "dining" ? "e.g. Main Dining Hall" : "e.g. Deluxe Rooms"}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {TYPE_CONFIG[formType].unitFieldLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUnitCount}
                    onChange={(e) => setFormUnitCount(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {TYPE_CONFIG[formType].capacityFieldLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    placeholder="e.g. 48"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Style
                </label>
                <div className="relative">
                  <select
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    {TYPE_CONFIG[formType].stylePresets.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Notes
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Dress code, service notes, amenities..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArea}
                disabled={!formName.trim() || !formUnitCount || !formCapacity}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? "Save Changes" : "Create Area"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Layout Drawer ──────────────────────────── */}
      {drawerArea && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">{drawerArea.name}</h3>
                <p className="text-[12px] text-gray-400">{drawerArea.style}</p>
              </div>
              <button onClick={closeDrawer} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={drawerArea.status} />
                  <span className="text-[12px] text-gray-500">
                    Cap {drawerArea.capacity} · {drawerArea.unitCount} {TYPE_CONFIG[drawerArea.type].unitLabelPlural}
                  </span>
                </div>
                <button
                  onClick={() => setShowLegend((v) => !v)}
                  className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600"
                >
                  <Info className="h-3.5 w-3.5" />
                  What do these mean?
                </button>
              </div>

              {showLegend && (
                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Wing Status — the space as a whole
                  </p>
                  <div className="mb-3 flex flex-col gap-1.5">
                    {DINING_STATUS_ORDER.map((s) => (
                      <div key={s} className="flex items-start gap-2 text-[11px]">
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${STATUS_CONFIG[s].dot}`} />
                        <span>
                          <span className="font-semibold text-gray-700">{STATUS_CONFIG[s].label}:</span>{" "}
                          <span className="text-gray-500">{STATUS_CONFIG[s].description}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  {drawerArea.type === "rooms" && (
                    <>
                      <p className="mb-2 mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Room Order Status — each individual room
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {ROOM_ORDER_STATUS_ORDER.map((s) => (
                          <div key={s} className="flex items-start gap-2 text-[11px]">
                            <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${STATUS_CONFIG[s].dot}`} />
                            <span>
                              <span className="font-semibold text-gray-700">{STATUS_CONFIG[s].label}:</span>{" "}
                              <span className="text-gray-500">{STATUS_CONFIG[s].description}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <p className="mt-3 text-[13px] leading-5 text-gray-600">{drawerArea.note}</p>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Wing Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {DINING_STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setAreas((prev) => prev.map((a) => (a.id === drawerArea.id ? { ...a, status: s } : a)))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
                        drawerArea.status === s
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-200 text-gray-500 hover:border-orange-200"
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {drawerArea.type === "dining" ? (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {TYPE_CONFIG[drawerArea.type].unitLabelPlural} · tap to cycle status
                    </p>
                    <button
                      onClick={() => downloadAreaQRSheet(drawerArea)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download All QR
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {drawerArea.subUnits.map((unit) => {
                      const cfg = STATUS_CONFIG[unit.status];
                      return (
                        <div key={unit.id} className="relative">
                          <button
                            onClick={() => cycleSubUnitStatus(drawerArea.id, unit.id)}
                            className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg py-3 text-[10px] font-bold text-white transition hover:opacity-90 ${cfg.dot}`}
                            title={cfg.label}
                          >
                            {unit.label.split(" ")[1] ?? unit.label}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleQR(drawerArea, unit);
                            }}
                            title={`Download QR for ${unit.label}`}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow ring-1 ring-gray-200 transition hover:text-orange-600"
                          >
                            <QrCode className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Rooms · guest &amp; order status — tap a room to view details
                    </p>
                    <button
                      onClick={() => downloadAreaQRSheet(drawerArea)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download All QR
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {drawerArea.subUnits.map((unit) => {
                      const cfg = STATUS_CONFIG[unit.status];
                      const isSelected = selectedSubUnitId === unit.id;
                      return (
                        <div key={unit.id} className="relative">
                          <button
                            onClick={() => setSelectedSubUnitId(isSelected ? null : unit.id)}
                            className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg py-3 text-[10px] font-bold text-white transition hover:opacity-90 ${cfg.dot} ${
                              isSelected ? "ring-2 ring-orange-500 ring-offset-2" : ""
                            }`}
                            title={cfg.label}
                          >
                            {unit.label.split(" ")[1] ?? unit.label}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleQR(drawerArea, unit);
                            }}
                            title={`Download QR for ${unit.label}`}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow ring-1 ring-gray-200 transition hover:text-orange-600"
                          >
                            <QrCode className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected room detail panel */}
                  {selectedSubUnit && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">{selectedSubUnit.label}</p>
                          <p className="text-[11px] text-gray-500">
                            {selectedSubUnit.guestName ? `Guest: ${selectedSubUnit.guestName}` : "No guest checked in"}
                          </p>
                        </div>
                        <StatusBadge status={selectedSubUnit.status} />
                      </div>

                      {selectedSubUnit.orderItems && (
                        <div className="mt-3 rounded-lg bg-white p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Order · {selectedSubUnit.orderPlacedAt}
                          </p>
                          <ul className="mt-1.5 flex flex-col gap-0.5">
                            {selectedSubUnit.orderItems.map((item) => (
                              <li key={item} className="text-[12px] text-gray-600">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Set status
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ROOM_ORDER_STATUS_ORDER.map((s) => (
                          <button
                            key={s}
                            onClick={() => setRoomSubUnitStatus(drawerArea.id, selectedSubUnit.id, s)}
                            className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold transition ${
                              selectedSubUnit.status === s
                                ? "border-orange-500 bg-orange-50 text-orange-600"
                                : "border-gray-200 bg-white text-gray-500 hover:border-orange-200"
                            }`}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => fireToast(`Calling ${selectedSubUnit.label}…`)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call Room
                        </button>
                        <button
                          onClick={() => fireToast(`Opening order form for ${selectedSubUnit.label}…`)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          Log Order
                        </button>
                        <button
                          onClick={() => downloadSingleQR(drawerArea, selectedSubUnit)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          Download QR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => openEditAreaModal(drawerArea)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </button>
              <button
                onClick={() => handleDeleteArea(drawerArea)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-[13px] font-semibold text-red-500 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Area
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}