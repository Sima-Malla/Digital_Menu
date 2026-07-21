"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import { useState } from "react";
import {
  ChevronRight,
  Clock,
  Calendar,
  MapPin,
  Plus,
  X,
  Edit2,
  Trash2,
  Globe,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function OperatingHoursPage() {
  // Timezone
  const [timezone] = useState("GMT -05:00 (EST)");
  
  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: "Monday", open: "09:00 AM", close: "10:00 PM", isOpen: true },
    { day: "Tuesday", open: "09:00 AM", close: "10:00 PM", isOpen: true },
    { day: "Wednesday", open: "09:00 AM", close: "10:00 PM", isOpen: true },
    { day: "Thursday", open: "09:00 AM", close: "11:00 PM", isOpen: true },
    { day: "Friday", open: "09:00 AM", close: "11:59 PM", isOpen: true },
    { day: "Saturday", open: "", close: "", isOpen: false },
    { day: "Sunday", open: "11:00 AM", close: "08:00 PM", isOpen: true },
  ]);

  // Special Hours
  const [specialHours, setSpecialHours] = useState([
    { id: 1, name: "Christmas Eve", date: "Dec 24, 2024", status: "LIMITED", hours: "09:00 - 15:00" },
    { id: 2, name: "Christmas Day", date: "Dec 25, 2024", status: "CLOSED", hours: "--" },
    { id: 3, name: "New Year's Eve", date: "Dec 31, 2024", status: "EXTENDED", hours: "09:00 - 02:00" },
  ]);

  // Add Exception Modal
  const [showAddException, setShowAddException] = useState(false);
  const [newException, setNewException] = useState({
    name: "",
    date: "",
    status: "LIMITED",
    hours: "",
  });

  // Edit mode for weekly schedule
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState("");
  const [editClose, setEditClose] = useState("");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSaveSchedule = () => {
    setToastMessage("Operating hours updated successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddException = () => {
    if (newException.name && newException.date && newException.hours) {
      setSpecialHours([
        ...specialHours,
        {
          id: Date.now(),
          name: newException.name,
          date: newException.date,
          status: newException.status as "LIMITED" | "CLOSED" | "EXTENDED",
          hours: newException.hours,
        },
      ]);
      setNewException({ name: "", date: "", status: "LIMITED", hours: "" });
      setShowAddException(false);
      setToastMessage("Special hours added successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDeleteException = (id: number) => {
    setSpecialHours(specialHours.filter((item) => item.id !== id));
    setToastMessage("Special hours removed successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const startEditingDay = (day: string, open: string, close: string) => {
    setEditingDay(day);
    setEditOpen(open);
    setEditClose(close);
  };

  const saveDayEdit = () => {
    if (editingDay) {
      setWeeklySchedule(
        weeklySchedule.map((day) =>
          day.day === editingDay
            ? { ...day, open: editOpen, close: editClose, isOpen: true }
            : day
        )
      );
      setEditingDay(null);
      setToastMessage("Day updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const toggleDayOpen = (day: string) => {
    setWeeklySchedule(
      weeklySchedule.map((d) =>
        d.day === day ? { ...d, isOpen: !d.isOpen } : d
      )
    );
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
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
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
            <h1 className="text-[28px] font-bold text-gray-900">
              Operating Hours
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your restaurant's weekly schedule and special holiday hours. 
              Changes will be reflected immediately in the customer booking app.
            </p>
          </div>

          {/* ── Toast Message ────────────────────────────── */}
          {showToast && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-[13px] font-medium text-green-700">
                {toastMessage}
              </span>
            </div>
          )}

          {/* ── Timezone ──────────────────────────────────── */}
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Time zone:</span>
            <span className="text-sm text-gray-500">{timezone}</span>
          </div>

          {/* ── Weekly Schedule ───────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Weekly Schedule
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {weeklySchedule.map((day) => (
                <div key={day.day} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm font-semibold text-gray-900">
                        {day.day}
                      </span>
                      {!day.isOpen ? (
                        <span className="text-sm text-gray-400">
                          Closed — No hours configured. Restaurant is closed for regular maintenance.
                        </span>
                      ) : editingDay === day.day ? (
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
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600"
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
                            Open: <span className="font-medium">{day.open}</span>
                          </span>
                          <span className="text-sm text-gray-400">To</span>
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">{day.close}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {day.isOpen && editingDay !== day.day && (
                        <button
                          onClick={() => startEditingDay(day.day, day.open, day.close)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleDayOpen(day.day)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Special Hours & Holidays
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure exceptions for holidays and special events
                </p>
              </div>
              <button
                onClick={() => setShowAddException(true)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add Exception
              </button>
            </div>

            {/* ── Table ────────────────────────────────────── */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      EVENT NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      HOURS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {specialHours.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {item.hours}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteException(item.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Special Hours Exception
                  </h3>
                  <button
                    onClick={() => setShowAddException(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={newException.name}
                      onChange={(e) =>
                        setNewException({ ...newException, name: e.target.value })
                      }
                      placeholder="e.g. Christmas Eve"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="text"
                      value={newException.date}
                      onChange={(e) =>
                        setNewException({ ...newException, date: e.target.value })
                      }
                      placeholder="e.g. Dec 24, 2024"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={newException.status}
                      onChange={(e) =>
                        setNewException({ ...newException, status: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    >
                      <option value="LIMITED">Limited Hours</option>
                      <option value="CLOSED">Closed</option>
                      <option value="EXTENDED">Extended Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Hours
                    </label>
                    <input
                      type="text"
                      value={newException.hours}
                      onChange={(e) =>
                        setNewException({ ...newException, hours: e.target.value })
                      }
                      placeholder="e.g. 09:00 - 15:00"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleAddException}
                    className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
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

          {/* ── Save Button ───────────────────────────────── */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveSchedule}
              className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}