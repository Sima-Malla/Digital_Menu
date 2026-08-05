"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users, ChefHat, ShieldCheck, Clock, Search, ChevronRight, ChevronLeft,
  MoreVertical, Trash2, UserPlus, X, ArrowUpDown, Loader2, Copy, Check,
} from "lucide-react";
import {
  inviteStaffAction,
  updateStaffPositionAction,
  toggleStaffActiveAction,
  removeStaffAction,
  type InviteStaffState,
} from "@/app/actions/team";
import { positions } from "@/lib/validations/team";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  position: string;
  role: string;
  isActive: boolean;
  isSelf: boolean;
  lastActiveLabel: string;
  lastActiveMinutes: number;
};

const positionStyles: Record<string, string> = {
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
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, accent }: {
  icon: React.ElementType; iconBg: string; iconColor: string; label: string; value: number; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-5 ${accent ? "border-orange-200" : "border-gray-200"}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} strokeWidth={2} />
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-orange-500" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${active ? "text-green-600" : "text-gray-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const PAGE_SIZE = 5;
const inviteInitial: InviteStaffState = { success: false, message: "" };

export default function TeamClient({ initialStaff }: { initialStaff: StaffMember[] }) {
  const router = useRouter();
  const staff = initialStaff;

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<"name" | "lastActive">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const totalStaff = staff.length;
  const managerCount = staff.filter((s) => s.position === "Manager").length;
  const chefCount = staff.filter((s) => s.position === "Chef").length;
  const inactiveCount = staff.filter((s) => !s.isActive).length;

  const filtered = useMemo(() => {
    let list = staff.filter(
      (s) =>
        (positionFilter === "All" || s.position === positionFilter) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return (a.lastActiveMinutes - b.lastActiveMinutes) * dir;
    });
    return list;
  }, [staff, search, positionFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key: "name" | "lastActive") => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const changePosition = (id: string, position: string) => {
    setBusyId(id);
    startTransition(async () => {
      await updateStaffPositionAction(id, position);
      setBusyId(null);
      router.refresh();
    });
  };

  const toggleActive = (id: string) => {
    setOpenMenuId(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        await toggleStaffActiveAction(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong.");
      }
      setBusyId(null);
      router.refresh();
    });
  };

  const removeMember = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your team? This deletes their login access.`)) return;
    setOpenMenuId(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        await removeStaffAction(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong.");
      }
      setBusyId(null);
      router.refresh();
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-8 py-8">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span>System</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-500">Team Management</span>
          </div>

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
              Add Team Member
            </button>
          </div>

          {showInvite && <InvitePanel onClose={() => setShowInvite(false)} onDone={() => { setShowInvite(false); router.refresh(); }} />}

          <div className="grid grid-cols-4 gap-5">
            <StatCard icon={Users} iconBg="bg-gray-100" iconColor="text-gray-500" label="Total Staff" value={totalStaff} />
            <StatCard icon={ShieldCheck} iconBg="bg-blue-50" iconColor="text-blue-500" label="Managers" value={managerCount} />
            <StatCard icon={ChefHat} iconBg="bg-gray-100" iconColor="text-gray-500" label="Chefs" value={chefCount} />
            <StatCard icon={Clock} iconBg="bg-orange-50" iconColor="text-orange-500" label="Inactive" value={inactiveCount} accent />
          </div>

          <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search staff by name or email..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-4 text-[13px] focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <select
                value={positionFilter}
                onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="All">All Positions</option>
                {positions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3 text-left">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                        Name &amp; Contact <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Position</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => toggleSort("lastActive")} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                        Last Updated <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => {
                    const isOwner = s.role === "owner";
                    const locked = isOwner || s.isSelf;
                    const busy = isPending && busyId === s.id;
                    return (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColor(s.name)}`}>
                              {initials(s.name)}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800">
                                {s.name} {s.isSelf && <span className="text-gray-400">(you)</span>}
                              </p>
                              <p className="text-[11px] text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {isOwner ? (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-700">
                              Owner
                            </span>
                          ) : (
                            <select
                              value={s.position}
                              onChange={(e) => changePosition(s.id, e.target.value)}
                              disabled={busy}
                              className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50 ${positionStyles[s.position] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-4"><StatusDot active={s.isActive} /></td>
                        <td className="px-4 py-4 text-[12px] text-gray-500">{s.lastActiveLabel}</td>
                        <td className="px-6 py-4">
                          {locked ? (
                            <span className="block text-right text-[11px] text-gray-300">—</span>
                          ) : (
                            <div className="relative flex justify-end">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              >
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                              </button>
                              {openMenuId === s.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                                    <button type="button" onClick={() => toggleActive(s.id)} className="block w-full px-4 py-2.5 text-left text-[12px] font-medium text-gray-600 hover:bg-gray-50">
                                      {s.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <button type="button" onClick={() => removeMember(s.id, s.name)} className="block w-full px-4 py-2.5 text-left text-[12px] font-medium text-red-500 hover:bg-red-50">
                                      Remove
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pageItems.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[13px] text-gray-400">No staff members match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[12px] text-gray-400">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} members
              </p>
              <div className="flex items-center gap-1.5">
                <button type="button" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition ${p === currentPage ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                ))}
                <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
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

/* ─── Invite panel ────────────────────────────────────────── */
function InvitePanel({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState<InviteStaffState, FormData>(inviteStaffAction, inviteInitial);
  const errors = state.fieldErrors ?? {};
  const [copied, setCopied] = useState(false);

  if (state.success && state.tempPassword) {
    return (
      <section className="mb-5 rounded-2xl border border-green-200 bg-green-50/40 p-6">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" />
          <h2 className="text-[14px] font-bold">Staff member added</h2>
        </div>
        <p className="mt-2 text-[13px] text-gray-600">Share this temporary password with them — it won&apos;t be shown again.</p>
        <div className="mt-3 flex max-w-sm items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <code className="text-sm font-semibold">{state.tempPassword}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(state.tempPassword!); setCopied(true); }}
            className="text-gray-400 hover:text-gray-600"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
        </div>
        <button onClick={onDone} className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-orange-600">
          Done
        </button>
      </section>
    );
  }

  return (
    <section className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-gray-900">Add Team Member</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!state.success && state.message && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{state.message}</div>
      )}

      <form id="invite-staff-form" action={formAction} className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
          <input name="fullName" placeholder="Jane Doe" className={fieldCls(errors.fullName)} />
          {errors.fullName && <p className="text-[11px] text-red-600">{errors.fullName}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email</label>
          <input name="email" type="email" placeholder="jane@example.com" className={fieldCls(errors.email)} />
          {errors.email && <p className="text-[11px] text-red-600">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Phone</label>
          <input name="phone" placeholder="+1 (555) 000-0000" className={fieldCls(errors.phone)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Position</label>
          <select name="position" defaultValue="Waiter" className={fieldCls(errors.position)}>
            {positions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </form>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button
          form="invite-staff-form"
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send Invite
        </button>
      </div>
    </section>
  );
}

function fieldCls(error?: string) {
  return `rounded-xl border bg-white px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 ${
    error ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"
  }`;
}