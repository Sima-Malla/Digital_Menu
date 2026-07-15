"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  Users,
  ChefHat,
  ShieldCheck,
  Clock,
  Search,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Trash2,
  UserPlus,
  X,
  ArrowUpDown,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ─── Types & data ────────────────────────────────────────── */

type Role = "Chef" | "Manager" | "Waiter" | "Host" | "Barista" | "Dishwasher";
type Status = "Active" | "Inactive" | "Pending";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastActiveLabel: string;
  lastActiveMinutes: number; // lower = more recent, Infinity = never/pending
};

const roles: Role[] = ["Chef", "Manager", "Waiter", "Host", "Barista", "Dishwasher"];

const roleStyles: Record<Role, string> = {
  Chef: "bg-gray-100 text-gray-600",
  Manager: "bg-blue-50 text-blue-600",
  Waiter: "bg-purple-50 text-purple-600",
  Host: "bg-teal-50 text-teal-600",
  Barista: "bg-pink-50 text-pink-600",
  Dishwasher: "bg-amber-50 text-amber-600",
};

const avatarPalette = ["bg-orange-500", "bg-blue-500", "bg-purple-500", "bg-teal-500", "bg-pink-500"];

function avatarColor(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const initialStaff: StaffMember[] = [
  { id: "1", name: "Marco Rossi", email: "m.rossi@gourmetflow.com", role: "Chef", status: "Active", lastActiveLabel: "10 mins ago", lastActiveMinutes: 10 },
  { id: "2", name: "Sarah Miller", email: "s.miller@gourmetflow.com", role: "Manager", status: "Active", lastActiveLabel: "Online now", lastActiveMinutes: 0 },
  { id: "3", name: "Leo Chen", email: "l.chen@gourmetflow.com", role: "Waiter", status: "Inactive", lastActiveLabel: "2 days ago", lastActiveMinutes: 2880 },
  { id: "4", name: "Priya Nair", email: "p.nair@gourmetflow.com", role: "Host", status: "Active", lastActiveLabel: "35 mins ago", lastActiveMinutes: 35 },
  { id: "5", name: "Diego Alvarez", email: "d.alvarez@gourmetflow.com", role: "Barista", status: "Active", lastActiveLabel: "1 hour ago", lastActiveMinutes: 60 },
  { id: "6", name: "Emma Walsh", email: "e.walsh@gourmetflow.com", role: "Chef", status: "Inactive", lastActiveLabel: "5 days ago", lastActiveMinutes: 7200 },
  { id: "7", name: "Tomás Silva", email: "t.silva@gourmetflow.com", role: "Dishwasher", status: "Active", lastActiveLabel: "20 mins ago", lastActiveMinutes: 20 },
  { id: "8", name: "invite-pending@user.com", email: "Invite sent 2 hours ago", role: "Chef", status: "Pending", lastActiveLabel: "—", lastActiveMinutes: Infinity },
];

/* ─── Small building blocks ──────────────────────────────── */

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${
        accent ? "border-orange-200" : "border-gray-200"
      }`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} strokeWidth={2} />
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-orange-500" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Active: "bg-green-500",
    Inactive: "bg-gray-300",
    Pending: "bg-orange-500 animate-pulse",
  };
  const text: Record<Status, string> = {
    Active: "text-green-600",
    Inactive: "text-gray-400",
    Pending: "text-orange-500",
  };
  return (
    <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${text[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles[status]}`} />
      {status}
    </span>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

const PAGE_SIZE = 5;

export default function team() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [sortKey, setSortKey] = useState<"name" | "lastActive">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Waiter");

  const totalStaff = staff.filter((s) => s.status !== "Pending").length;
  const managerCount = staff.filter((s) => s.role === "Manager" && s.status !== "Pending").length;
  const chefCount = staff.filter((s) => s.role === "Chef" && s.status !== "Pending").length;
  const pendingCount = staff.filter((s) => s.status === "Pending").length;

  const filtered = useMemo(() => {
    let list = staff.filter(
      (s) =>
        (roleFilter === "All" || s.role === roleFilter) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return (a.lastActiveMinutes - b.lastActiveMinutes) * dir;
    });
    return list;
  }, [staff, search, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key: "name" | "lastActive") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const changeRole = (id: string, role: Role) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)));
  };

  const toggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
      )
    );
    setOpenMenuId(null);
  };

  const removeMember = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setOpenMenuId(null);
  };

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    setStaff((prev) => [
      {
        id: crypto.randomUUID(),
        name: inviteName.trim() || inviteEmail,
        email: `Invite sent just now`,
        role: inviteRole,
        status: "Pending",
        lastActiveLabel: "—",
        lastActiveMinutes: Infinity,
      },
      ...prev,
    ]);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("Waiter");
    setShowInvite(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-8 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span>System</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-500">Team Management</span>
          </div>

          {/* ── Page Header ─────────────────────────────── */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Team Management</h1>
              <p className="mt-1 text-[13px] text-gray-400">
                Control access levels and manage your restaurant staff database.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInvite((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition hover:bg-orange-600"
            >
              <UserPlus className="h-4 w-4" />
              Invite New Member
            </button>
          </div>

          {/* ── Invite panel ─────────────────────────────── */}
          {showInvite && (
            <section className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-gray-900">Invite New Member</h2>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Full Name
                  </label>
                  <input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Jane Doe"
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Email
                  </label>
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jane@gourmetflow.com"
                    type="email"
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendInvite}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  Send Invite
                </button>
              </div>
            </section>
          )}

          {/* ── Stat cards ──────────────────────────────── */}
          <div className="grid grid-cols-4 gap-5">
            <StatCard icon={Users} iconBg="bg-gray-100" iconColor="text-gray-500" label="Total Staff" value={totalStaff} />
            <StatCard icon={ShieldCheck} iconBg="bg-blue-50" iconColor="text-blue-500" label="Managers" value={managerCount} />
            <StatCard icon={ChefHat} iconBg="bg-gray-100" iconColor="text-gray-500" label="Chefs" value={chefCount} />
            <StatCard icon={Clock} iconBg="bg-orange-50" iconColor="text-orange-500" label="Pending Invites" value={pendingCount} accent />
          </div>

          {/* ── Table card ──────────────────────────────── */}
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
            {/* Search + filter */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search staff by name or email..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-4 text-[13px] focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as Role | "All");
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="All">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => toggleSort("name")}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
                      >
                        Name &amp; Contact
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => toggleSort("lastActive")}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
                      >
                        Last Active
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-gray-50 last:border-0 ${
                        s.status === "Pending" ? "bg-orange-50/40" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                              s.status === "Pending" ? "bg-gray-200 text-gray-400" : avatarColor(s.name)
                            }`}
                          >
                            {s.status === "Pending" ? "?" : initials(s.name)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-800">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={s.role}
                          onChange={(e) => changeRole(s.id, e.target.value as Role)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-orange-200 ${roleStyles[s.role]}`}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <StatusDot status={s.status} />
                      </td>
                      <td className="px-4 py-4 text-[12px] text-gray-500">{s.lastActiveLabel}</td>
                      <td className="px-6 py-4">
                        {s.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              className="text-[12px] font-semibold text-orange-500 hover:underline"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMember(s.id)}
                              className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative flex justify-end">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenuId === s.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => toggleActive(s.id)}
                                    className="block w-full px-4 py-2.5 text-left text-[12px] font-medium text-gray-600 hover:bg-gray-50"
                                  >
                                    {s.status === "Active" ? "Deactivate" : "Activate"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeMember(s.id)}
                                    className="block w-full px-4 py-2.5 text-left text-[12px] font-medium text-red-500 hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[13px] text-gray-400">
                        No staff members match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[12px] text-gray-400">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} members
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition ${
                      p === currentPage
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}