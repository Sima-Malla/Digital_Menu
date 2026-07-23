"use client";

import { useMemo, useState } from "react";
import {
  Store,
  Clock,
  Users,
  BedDouble,
  Printer,
  Bell,
  Plus,
  Trash2,
  Check,
  Search,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

export default function StaffSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Property profile
  const [propertyName, setPropertyName] = useState("Grand Plaza Heights");
  const [address, setAddress] = useState("Durbar Marg, Kathmandu");

  // Operating hours
  const [openTime, setOpenTime] = useState("07:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [open24h, setOpen24h] = useState(false);

  // Staff accounts
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: "1", name: "Ramesh Thapa", role: "Head Chef", online: true },
    { id: "2", name: "Nisha Rai", role: "Waiter", online: true },
    { id: "3", name: "Sujan Lama", role: "Manager", online: false },
  ]);
  const [staffSearch, setStaffSearch] = useState("");

  const filteredStaff = useMemo(() => {
    if (staffSearch.trim() === "") return staff;
    const q = staffSearch.toLowerCase();
    return staff.filter((m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
  }, [staff, staffSearch]);

  // Notifications
  const [newOrderSound, setNewOrderSound] = useState(true);
  const [delayAlert, setDelayAlert] = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleStaffOnline(id: string) {
    setStaff((s) => s.map((m) => (m.id === id ? { ...m, online: !m.online } : m)));
  }

  function removeStaff(id: string) {
    setStaff((s) => s.filter((m) => m.id !== id));
  }

  function addStaff() {
    setStaff((s) => [...s, { id: crypto.randomUUID(), name: "New Staff", role: "Waiter", online: false }]);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Property profile, hours, staff, and notification preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Property profile */}
          <Card title="Property Profile" icon={Store}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Property Name">
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Address">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          </Card>

          {/* Operating hours */}
          <Card title="Operating Hours" icon={Clock}>
            <div className="space-y-4">
              <SettingRow label="Open 24 Hours">
                <Toggle checked={open24h} onChange={() => setOpen24h((v) => !v)} />
              </SettingRow>
              {!open24h && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Opens At">
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label="Closes At">
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="input"
                    />
                  </Field>
                </div>
              )}
            </div>
          </Card>

          {/* Staff accounts */}
          <Card title="Staff Accounts" icon={Users} description="Manage who has access and their on-duty status.">
            <div className="mb-3 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff by name or role..."
                className="input pl-9"
              />
            </div>
            <div className="space-y-2">
              {filteredStaff.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${m.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStaffOnline(m.id)}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      {m.online ? "Set Off-duty" : "Set On-duty"}
                    </button>
                    <button
                      onClick={() => removeStaff(m.id)}
                      aria-label="Remove staff"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredStaff.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">No staff match your search.</p>
              )}
              <button
                onClick={addStaff}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                <Plus size={15} />
                Add staff member
              </button>
            </div>
          </Card>

          {/* Table/Room mapping */}
          <Card title="Table &amp; Room Management" icon={BedDouble}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Number of Tables">
                <input type="number" defaultValue={18} className="input" />
              </Field>
              <Field label="Number of Rooms">
                <input type="number" defaultValue={40} className="input" />
              </Field>
            </div>
          </Card>

          {/* KOT / Printer */}
          <Card title="Kitchen Order Ticket (KOT) Printer" icon={Printer}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Printer Name">
                <input type="text" defaultValue="Kitchen Printer 1" className="input" />
              </Field>
              <Field label="Connection">
                <select className="input">
                  <option>Bluetooth</option>
                  <option>Wi-Fi / Network</option>
                  <option>USB</option>
                </select>
              </Field>
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notifications" icon={Bell}>
            <div className="divide-y divide-slate-100">
              <SettingRow label="New Order Sound Alert">
                <Toggle checked={newOrderSound} onChange={() => setNewOrderSound((v) => !v)} />
              </SettingRow>
              <SettingRow label="Delayed Order Alert">
                <Toggle checked={delayAlert} onChange={() => setDelayAlert((v) => !v)} />
              </SettingRow>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Check size={14} /> Changes saved
              </span>
            ) : (
              "Unsaved changes are not applied until you save."
            )}
          </p>
          <button
            onClick={handleSave}
            className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Shared input styling */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #334155;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
        }
      `}</style>
    </div>
  );
}

function Card({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-orange-500" />}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-orange-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
