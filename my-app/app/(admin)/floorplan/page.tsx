"use client";
import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Radio,
  Table2,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  FileDown,
  Search,
  Bell,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Move,
  Plus,
  X,
  QrCode,
  Download,
  Trash2,
  ChevronDown,
} from "lucide-react";

/* ─── Nav data ───────────────────────────────────────────── */
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Menu Manager", icon: UtensilsCrossed },
  { label: "Live Orders", icon: Radio },
  { label: "Floor Plan", icon: Table2, active: true },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const roomTabs = ["Main Dining", "Patio", "VIP Lounge"];

const capacities = ["2", "4", "6", "8+"];

/* ─── Table data ─────────────────────────────────────────── */
type TableStatus = "occupied" | "available" | "reserved";

type TableItem = {
  id: string;
  number: string;
  status: TableStatus;
  capacity: number;
  shape: "square" | "round" | "booth";
};

const tables: TableItem[] = [
  { id: "t1", number: "01", status: "occupied", capacity: 4, shape: "square" },
  { id: "t2", number: "02", status: "available", capacity: 2, shape: "square" },
  { id: "t3", number: "03", status: "reserved", capacity: 6, shape: "square" },
  { id: "t5", number: "05", status: "occupied", capacity: 2, shape: "round" },
  { id: "b1", number: "B1", status: "available", capacity: 4, shape: "booth" },
];

const statusStyles: Record<TableStatus, { border: string; text: string; badge: string; dot: string }> = {
  occupied: { border: "border-red-500", text: "text-red-500", badge: "bg-red-500", dot: "bg-red-500" },
  available: { border: "border-green-500", text: "text-green-600", badge: "bg-green-500", dot: "bg-green-500" },
  reserved: { border: "border-orange-500", text: "text-orange-500", badge: "bg-orange-500", dot: "bg-orange-500" },
};

const legendCounts = { available: 12, occupied: 8, reserved: 3 };

/* ─── Top header ─────────────────────────────────────────── */
function Header({ activeRoom, setActiveRoom }: { activeRoom: string; setActiveRoom: (r: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Floor Plan</p>
        <h1 className="mt-0.5 text-2xl font-extrabold leading-tight text-gray-900">Floor Management</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-gray-200 p-1">
          {roomTabs.map((room) => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                activeRoom === room
                  ? "bg-orange-800 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search tables..."
            className="w-44 rounded-full border border-gray-200 bg-white py-2 pl-4 pr-9 text-xs text-gray-600 outline-none focus:border-orange-300"
          />
          <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100">
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
          <Image src="/hotel.png" alt="Profile" width={36} height={36} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

/* ─── Canvas toolbar ──────────────────────────────────────── */
function CanvasToolbar() {
  const tools = [ZoomIn, ZoomOut, Grid3x3, Move];
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {tools.map((Icon, i) => (
        <button
          key={i}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
            i === 3 ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

/* ─── Table card ──────────────────────────────────────────── */
function TableCard({
  table,
  selected,
  onSelect,
}: {
  table: TableItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const style = statusStyles[table.status];

  if (table.shape === "round") {
    return (
      <button onClick={onSelect} className="relative">
        <div
          className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 bg-white transition ${style.border} ${
            selected ? "ring-2 ring-offset-2 ring-orange-300" : ""
          }`}
        >
          <span className="text-xl font-extrabold text-gray-900">{table.number}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text}`}>{table.status}</span>
        </div>
      </button>
    );
  }

  if (table.shape === "booth") {
    return (
      <button onClick={onSelect} className="relative">
        <div
          className={`flex h-24 w-52 flex-col justify-center rounded-xl border-2 bg-white px-5 transition ${style.border} ${
            selected ? "ring-2 ring-offset-2 ring-orange-300" : ""
          }`}
        >
          <span className="text-xl font-extrabold text-gray-900">{table.number}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Booth Section</span>
          <div className="mt-2 flex gap-1.5">
            <span className="h-3 w-3 rounded-full border border-gray-300 bg-gray-100" />
            <span className="h-3 w-3 rounded-full border border-gray-300 bg-gray-100" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <button onClick={onSelect} className="relative">
      <div
        className={`relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-white transition ${style.border} ${
          selected ? "ring-2 ring-offset-2 ring-orange-300" : ""
        }`}
      >
        <span
          className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${style.badge}`}
        >
          {table.capacity}
        </span>
        <span className="text-xl font-extrabold text-gray-900">{table.number}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text}`}>{table.status}</span>
      </div>
    </button>
  );
}

function AddTableCard() {
  return (
    <button className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-300 transition hover:border-orange-200 hover:text-orange-400">
      <Plus className="h-5 w-5" />
      <span className="text-[9px] font-bold uppercase tracking-wide">Add New</span>
    </button>
  );
}

/* ─── Legend ──────────────────────────────────────────────── */
function Legend() {
  const total = legendCounts.available + legendCounts.occupied + legendCounts.reserved;
  const occupiedPct = Math.round(((legendCounts.occupied + legendCounts.reserved) / total) * 100);

  return (
    <div className="flex flex-wrap items-center gap-6 border-t border-gray-100 px-6 py-4">
      <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> {legendCounts.available} Available
      </span>
      <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> {legendCounts.occupied} Occupied
      </span>
      <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> {legendCounts.reserved} Reserved
      </span>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-600">Capacity: {occupiedPct}%</span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-red-400" style={{ width: `${occupiedPct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Table details panel ────────────────────────────────── */
function TableDetailsPanel({
  table,
  onClose,
}: {
  table: TableItem;
  onClose: () => void;
}) {
  const [capacity, setCapacity] = useState(String(table.capacity));
  const [status, setStatus] = useState(table.status);
  const [room, setRoom] = useState("Main Dining");

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <h2 className="text-base font-extrabold text-gray-900">Table Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            <QrCode className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Dynamic QR Code</p>
            <button className="mt-0.5 flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700">
              Download <Download className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Table Number
          </label>
          <input
            type="text"
            defaultValue={table.number}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Capacity (Persons)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {capacities.map((c) => (
              <button
                key={c}
                onClick={() => setCapacity(c)}
                className={`rounded-lg border py-2 text-sm font-bold transition ${
                  capacity === c
                    ? "border-orange-500 text-orange-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus)}
              className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm capitalize text-gray-700 outline-none focus:border-orange-300"
            >
              <option value="occupied">Occupied</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Room Location
          </label>
          <div className="relative">
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
            >
              {roomTabs.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Special Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g., Birthday celebration setting needed..."
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-orange-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 px-6 py-4">
        <button className="flex-1 rounded-lg bg-orange-800 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:bg-orange-900">
          Save Changes
        </button>
        <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function floorplan() {
  const [activeRoom, setActiveRoom] = useState("Main Dining");
  const [selectedId, setSelectedId] = useState<string | null>("t3");

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header activeRoom={activeRoom} setActiveRoom={setActiveRoom} />

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="px-6 pt-5">
              <CanvasToolbar />
            </div>

            <div className="flex-1 overflow-auto px-6 py-8">
              <div className="grid grid-cols-4 gap-x-8 gap-y-10">
                {tables
                  .filter((t) => t.shape !== "booth")
                  .slice(0, 3)
                  .map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      selected={selectedId === table.id}
                      onSelect={() => setSelectedId(table.id)}
                    />
                  ))}
                <AddTableCard />

                {tables
                  .filter((t) => t.number === "05")
                  .map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      selected={selectedId === table.id}
                      onSelect={() => setSelectedId(table.id)}
                    />
                  ))}

                <div className="col-span-2">
                  {tables
                    .filter((t) => t.shape === "booth")
                    .map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        selected={selectedId === table.id}
                        onSelect={() => setSelectedId(table.id)}
                      />
                    ))}
                </div>
              </div>
            </div>

            <Legend />
          </div>

          {selectedTable && (
            <TableDetailsPanel table={selectedTable} onClose={() => setSelectedId(null)} />
          )}
        </div>
      </div>
    </div>
  );
}