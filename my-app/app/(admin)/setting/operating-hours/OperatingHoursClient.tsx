"use client";

import { useState, useTransition } from "react";
import {
  ChevronRight,
  Globe,
  Plus,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import type { OperatingHoursData, DaySchedule, SpecialHourEntry } from "@/lib/setting/operating-hour";
import {
  updateDayHoursAction,
  toggleDayOpenAction,
  addSpecialHoursAction,
  deleteSpecialHoursAction,
} from "@/app/actions/adminsetting/operating-hours";

export default function OperatingHoursClient({ initialData }: { initialData: OperatingHoursData }) {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(initialData.weeklySchedule);
  const [specialHours, setSpecialHours] = useState<SpecialHourEntry[]>(initialData.specialHours);
  const [isPending, startTransition] = useTransition();

  const [showAddException, setShowAddException] = useState(false);
  const [newException, setNewException] = useState({
    name: "",
    date: "",
    status: "LIMITED" as "LIMITED" | "CLOSED" | "EXTENDED",
    hours: "",
  });

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState("");
  const [editClose, setEditClose] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fireToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3000);
  };

  const startEditingDay = (dayOfWeek: number, open: string, close: string) => {
    setEditingDay(dayOfWeek);
    setEditOpen(open);
    setEditClose(close);
    setError(null);
  };

  const saveDayEdit = () => {
    if (editingDay === null) return;
    if (!editOpen.trim() || !editClose.trim()) {
      setError("Both open and close times are required.");
      return;
    }

    const dayOfWeek = editingDay;
    const prevSchedule = weeklySchedule;

    // Optimistic update
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, open: editOpen, close: editClose, isOpen: true } : d))
    );
    setEditingDay(null);

    startTransition(async () => {
      const res = await updateDayHoursAction(dayOfWeek, editOpen, editClose);
      if (res.success) {
        fireToast("Day updated successfully!");
      } else {
        setWeeklySchedule(prevSchedule); // roll back
        setError(res.message ?? "Couldn't save — please try again.");
      }
    });
  };

  const toggleDayOpen = (dayOfWeek: number, currentlyOpen: boolean) => {
    const prevSchedule = weeklySchedule;
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isOpen: !currentlyOpen } : d))
    );

    startTransition(async () => {
      const res = await toggleDayOpenAction(dayOfWeek, !currentlyOpen);
      if (!res.success) {
        setWeeklySchedule(prevSchedule);
        fireToast(res.message ?? "Couldn't update — please try again.");
      }
    });
  };

  const handleAddException = () => {
    if (!newException.name.trim() || !newException.date.trim() || !newException.hours.trim()) {
      setError("All fields are required.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await addSpecialHoursAction(newException);
      if (res.success) {
        setShowAddException(false);
        setNewException({ name: "", date: "", status: "LIMITED", hours: "" });
        fireToast("Special hours added successfully!");
        // Re-derive list from server on next revalidation; for immediate feedback, append locally too
        setSpecialHours((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            name: newException.name,
            date: newException.date,
            status: newException.status,
            hours: newException.status === "CLOSED" ? "--" : newException.hours,
          },
        ]);
      } else {
        setError(res.message ?? "Couldn't add exception — please try again.");
      }
    });
  };

  const handleDeleteException = (id: string) => {
    const prev = specialHours;
    setSpecialHours((cur) => cur.filter((item) => item.id !== id));

    startTransition(async () => {
      const res = await deleteSpecialHoursAction(id);
      if (res.success) {
        fireToast("Special hours removed successfully!");
      } else {
        setSpecialHours(prev); // roll back
        fireToast(res.message ?? "Couldn't remove — please try again.");
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIMITED":
        return "bg-yellow-100 text-yellow-700";
      case "CLOSED":
        return "bg-red-100 text-red-700";
      case "EXTENDED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FC]">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1080px] px-6 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
            <span>GourmetFlow</span>
            <ChevronRight className="h-4 w-4" />
            <span>Settings</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-700">Operating Hours</span>
          </div>

          {/* ── Header ───────────────────────────────────── */}
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-gray-900">Operating Hours</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your restaurant's weekly schedule and special holiday hours.
              Changes will be reflected immediately in the customer booking app.
            </p>
          </div>

          {showToast && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-[13px] font-medium text-green-700">{toastMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">
              {error}
            </div>
          )}

          {/* ── Timezone ──────────────────────────────────── */}
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Time zone:</span>
            <span className="text-sm text-gray-500">{initialData.timezone}</span>
          </div>

          {/* ── Weekly Schedule ───────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {weeklySchedule.map((day) => (
                <div key={day.dayOfWeek} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm font-semibold text-gray-900">{day.day}</span>
                      {!day.isOpen ? (
                        <span className="text-sm text-gray-400">
                          Closed — No hours configured. Restaurant is closed for regular maintenance.
                        </span>
                      ) : editingDay === day.dayOfWeek ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editOpen}
                            onChange={(e) => setEditOpen(e.target.value)}
                            className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none"
                            placeholder="09:00 AM"
                          />
                          <span className="text-sm text-gray-400">To</span>
                          <input
                            type="text"
                            value={editClose}
                            onChange={(e) => setEditClose(e.target.value)}
                            className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none"
                            placeholder="10:00 PM"
                          />
                          <button
                            onClick={saveDayEdit}
                            disabled={isPending}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDay(null)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Open: <span className="font-medium">{day.open || "—"}</span>
                          </span>
                          <span className="text-sm text-gray-400">To</span>
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">{day.close || "—"}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {day.isOpen && editingDay !== day.dayOfWeek && (
                        <button
                          onClick={() => startEditingDay(day.dayOfWeek, day.open, day.close)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleDayOpen(day.dayOfWeek, day.isOpen)}
                        disabled={isPending}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                          day.isOpen
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {day.isOpen ? "Open" : "Closed"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Special Hours & Holidays ──────────────────── */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Special Hours & Holidays</h2>
                <p className="mt-1 text-sm text-gray-500">Configure exceptions for holidays and special events</p>
              </div>
              <button
                onClick={() => setShowAddException(true)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add Exception
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">EVENT NAME</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">DATE</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">HOURS</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {specialHours.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.hours}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteException(item.id)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {specialHours.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                        No special hours configured. Click "Add Exception" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Add Exception Modal ────────────────────────── */}
          {showAddException && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add Special Hours Exception</h3>
                  <button
                    onClick={() => setShowAddException(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Event Name</label>
                    <input
                      type="text"
                      value={newException.name}
                      onChange={(e) => setNewException({ ...newException, name: e.target.value })}
                      placeholder="e.g. Christmas Eve"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="text"
                      value={newException.date}
                      onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                      placeholder="e.g. Dec 24, 2024"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={newException.status}
                      onChange={(e) =>
                        setNewException({ ...newException, status: e.target.value as "LIMITED" | "CLOSED" | "EXTENDED" })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    >
                      <option value="LIMITED">Limited Hours</option>
                      <option value="CLOSED">Closed</option>
                      <option value="EXTENDED">Extended Hours</option>
                    </select>
                  </div>

                  {newException.status !== "CLOSED" && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Hours</label>
                      <input
                        type="text"
                        value={newException.hours}
                        onChange={(e) => setNewException({ ...newException, hours: e.target.value })}
                        placeholder="e.g. 09:00 - 15:00"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleAddException}
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                  >
                    Add Exception
                  </button>
                  <button
                    onClick={() => setShowAddException(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}