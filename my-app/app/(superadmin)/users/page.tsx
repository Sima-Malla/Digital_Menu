"use client";

import { useEffect, useState } from "react";
import {
  Search, Bell, UserPlus, Upload, Download, Eye, Pencil, Lock, Unlock,
  Trash2, X, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Users, UserCheck, Ban, ClipboardCheck, Building2, Shield, Clock,
  Mail, Phone, Calendar, Loader2,
} from "lucide-react";
import {
  getPlatformUsers,
  getPlatformUserDetail,
  getPlatformStats,
  createPlatformUserAction,
  toggleSuspendAction,
  deletePlatformUserAction,
  PlatformUserRow,
  PlatformUserDetail,
} from "@/app/actions/platform-users";

// ============================================================================
// Types
// ============================================================================

type Status = "Active" | "Suspended";
type Role = "Super Admin" | "Admin" | "Moderator" | "Support" | "Viewer";

// ============================================================================
// Style maps
// ============================================================================

const roleBadgeStyles: Record<string, string> = {
  "Super Admin": "bg-orange-50 text-orange-600",
  Admin: "bg-blue-50 text-blue-600",
  Moderator: "bg-purple-50 text-purple-600",
  Support: "bg-emerald-50 text-emerald-600",
  Viewer: "bg-slate-100 text-slate-600",
};

const roleDotStyles: Record<string, string> = {
  "Super Admin": "bg-orange-500",
  Admin: "bg-blue-500",
  Moderator: "bg-purple-500",
  Support: "bg-emerald-500",
  Viewer: "bg-slate-500",
};

const avatarPalette: Record<string, string> = {
  S: "bg-orange-50 text-orange-500",
  R: "bg-blue-50 text-blue-500",
  H: "bg-rose-50 text-rose-500",
  A: "bg-purple-50 text-purple-500",
  B: "bg-emerald-50 text-emerald-500",
};

function initialAvatarColor(name: string) {
  const letter = name?.[0]?.toUpperCase() ?? "";
  return avatarPalette[letter] ?? "bg-slate-100 text-slate-500";
}

// ============================================================================
// Small building blocks
// ============================================================================

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-5 min-w-[150px]">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  options,
  compact,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  compact?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {!compact && (
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{label}</span>
      )}
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
      <Ban className="h-3 w-3" />
      SUSPENDED
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
        roleBadgeStyles[role] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${roleDotStyles[role] ?? "bg-slate-400"}`} />
      {role}
    </span>
  );
}

// ============================================================================
// Add New User modal
// ============================================================================

function AddUserModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    permissions: string[];
  }) => Promise<void>;
}) {
  const [sendInvite, setSendInvite] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Viewer",
    department: "Global Operations",
    permissionTemplate: "Standard Access",
  });

  const permissionMap: Record<string, string[]> = {
    "Full Access": ["Full Access", "Billing", "User Management", "System Settings"],
    "Standard Access": ["User Management", "Reports", "Support Tools"],
    "Read Only": ["Read-only Reports"],
    Custom: [],
  };

  async function handleCreate() {
    if (!form.fullName || !form.email) return;
    setSubmitting(true);
    await onCreate({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      role: form.role,
      department: form.department,
      permissions: permissionMap[form.permissionTemplate] ?? [],
    });
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-orange-100">
          <h2 className="text-xl font-bold text-slate-900">Add New Platform User</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Phone Number (Optional)</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Select Role</label>
              <div className="relative mt-1.5">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Moderator</option>
                  <option>Support</option>
                  <option>Viewer</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Department</label>
              <div className="relative mt-1.5">
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option>Global Operations</option>
                  <option>Operations</option>
                  <option>Trust &amp; Safety</option>
                  <option>Customer Care</option>
                  <option>Finance</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Permission Template</label>
            <div className="relative mt-1.5">
              <select
                value={form.permissionTemplate}
                onChange={(e) => setForm({ ...form, permissionTemplate: e.target.value })}
                className="w-full appearance-none rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option>Full Access</option>
                <option>Standard Access</option>
                <option>Read Only</option>
                <option>Custom</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-bold text-slate-800">Send Invitation Email</p>
              <p className="text-xs text-slate-400 mt-0.5">User will receive login instructions</p>
            </div>
            <button
              role="switch"
              aria-checked={sendInvite}
              onClick={() => setSendInvite((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                sendInvite ? "bg-orange-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  sendInvite ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 bg-slate-50 border-t border-slate-100 px-7 py-5">
          <button onClick={onClose} className="text-sm font-bold text-slate-700 hover:text-slate-900">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// View drawer
// ============================================================================

function UserDrawer({ user, onClose }: { user: PlatformUserDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">User Profile</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-7">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold ${initialAvatarColor(
                  user.name
                )}`}
              >
                {user.name[0]}
              </div>
              <span
                title={user.status === "Active" ? "Online" : "Offline"}
                className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                  user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusPill status={user.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">{user.department}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Created {user.createdDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Last login {user.lastActive}</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Permissions
            </p>
            <div className="flex flex-wrap gap-2">
              {user.permissions.length > 0 ? (
                user.permissions.map((p) => (
                  <span key={p} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No permissions assigned</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-3">
              Recent Activities
            </p>
            <div className="flex flex-col gap-4">
              {user.activity.length > 0 ? (
                user.activity.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">{a.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

const ROLE_OPTIONS = ["Role", "Super Admin", "Admin", "Moderator", "Support", "Viewer"];
const DEPARTMENT_OPTIONS = [
  "Department",
  "Global Operations",
  "Operations",
  "Trust & Safety",
  "Customer Care",
  "Finance",
];
const STATUS_OPTIONS = ["Status", "Active", "Suspended"];
const LAST_LOGIN_OPTIONS = ["Last Login", "Today", "This week", "This month"];
const SORT_OPTIONS = ["Sort: Newest", "Name A-Z", "Name Z-A", "Role"];

export default function PlatformUsersPage() {
  const [rowUsers, setRowUsers] = useState<PlatformUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddOpen, setAddOpen] = useState(false);
  const [viewUser, setViewUser] = useState<PlatformUserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(ROLE_OPTIONS[0]);
  const [departmentFilter, setDepartmentFilter] = useState(DEPARTMENT_OPTIONS[0]);
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0]);
  const [lastLoginFilter, setLastLoginFilter] = useState(LAST_LOGIN_OPTIONS[0]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function loadUsers() {
    setLoading(true);
    const data = await getPlatformUsers({
      search: searchQuery,
      role: roleFilter === "Role" ? "" : roleFilter,
      department: departmentFilter === "Department" ? "" : departmentFilter,
      status: statusFilter === "Status" ? "" : statusFilter,
      lastLogin: lastLoginFilter === "Last Login" ? "" : lastLoginFilter,
      sortBy,
      page,
      pageSize,
    });
    setRowUsers(data.users);
    setTotal(data.total);
    setLoading(false);
  }

  async function loadStats() {
    setStats(await getPlatformStats());
  }

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, departmentFilter, statusFilter, lastLoginFilter, sortBy, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadUsers();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleCreate(data: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    permissions: string[];
  }) {
    const res = await createPlatformUserAction(data);
    if (res.success) {
      setAddOpen(false);
      loadUsers();
      loadStats();
    } else {
      alert(res.message);
    }
  }

  async function handleView(id: string) {
    setViewLoading(true);
    const detail = await getPlatformUserDetail(id);
    setViewLoading(false);
    if (detail) setViewUser(detail);
  }

  async function toggleSuspend(id: string) {
    const res = await toggleSuspendAction(id);
    if (res.success && res.status) {
      setRowUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: res.status! } : u)));
      loadStats();
    } else {
      alert(res.message ?? "Failed to update status.");
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const previous = rowUsers;
    setRowUsers((prev) => prev.filter((u) => u.id !== id));
    const res = await deletePlatformUserAction(id);
    if (!res.success) {
      setRowUsers(previous);
      alert(res.message ?? "Failed to delete user.");
    } else {
      setTotal((t) => t - 1);
      loadStats();
    }
  }

  const hasActiveFilters =
    !!searchQuery ||
    roleFilter !== "Role" ||
    departmentFilter !== "Department" ||
    statusFilter !== "Status" ||
    lastLoginFilter !== "Last Login" ||
    sortBy !== "Sort: Newest";

  function resetFilters() {
    setSearchQuery("");
    setRoleFilter(ROLE_OPTIONS[0]);
    setDepartmentFilter(DEPARTMENT_OPTIONS[0]);
    setStatusFilter(STATUS_OPTIONS[0]);
    setLastLoginFilter(LAST_LOGIN_OPTIONS[0]);
    setSortBy(SORT_OPTIONS[0]);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-0 bg-white px-4 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8 rounded-t-3xl flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Platform Users</h1>
            <p className="text-sm text-slate-400 mt-1">Manage internal platform users</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              aria-label="Notifications"
              className="relative h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
            </button>
            <img
              src="https://i.pravatar.cc/72?img=13"
              alt="Account"
              className="h-9 w-9 rounded-full ring-2 ring-orange-400 object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <StatCard
              icon={<Users className="h-4.5 w-4.5" />}
              iconBg="bg-orange-50"
              iconColor="text-orange-500"
              label="Total Users"
              value={stats.total.toLocaleString()}
              subtitle="Registered accounts"
            />
            <StatCard
              icon={<UserCheck className="h-4.5 w-4.5" />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              label="Active Users"
              value={stats.active.toLocaleString()}
              subtitle={stats.total ? `${Math.round((stats.active / stats.total) * 100)}% Active` : "0% Active"}
            />
            <StatCard
              icon={<Ban className="h-4.5 w-4.5" />}
              iconBg="bg-rose-50"
              iconColor="text-rose-400"
              label="Suspended"
              value={stats.suspended.toLocaleString()}
              subtitle="Need Review"
            />
            <StatCard
              icon={<ClipboardCheck className="h-4.5 w-4.5" />}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label="Matching Filters"
              value={total.toLocaleString()}
              subtitle="Current results"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              + Add User
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Upload className="h-4 w-4" />
              Bulk Import
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* User directory */}
          <div className="rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 pb-5 sm:p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">User Directory</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  Global
                </span>
              </div>
            </div>

            {/* Search + filters */}
            <div className="flex flex-wrap items-center gap-3 px-4 pb-3 sm:px-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users...."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <FilterSelect
                compact
                label="Role"
                options={ROLE_OPTIONS}
                value={roleFilter}
                onChange={(v: string) => {
                  setRoleFilter(v);
                  setPage(1);
                }}
              />
              <FilterSelect
                compact
                label="Department"
                options={DEPARTMENT_OPTIONS}
                value={departmentFilter}
                onChange={(v: string) => {
                  setDepartmentFilter(v);
                  setPage(1);
                }}
              />
              <FilterSelect
                compact
                label="Status"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(v: string) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              />
              <FilterSelect
                compact
                label="Last Login"
                options={LAST_LOGIN_OPTIONS}
                value={lastLoginFilter}
                onChange={(v: string) => {
                  setLastLoginFilter(v);
                  setPage(1);
                }}
              />
              <FilterSelect compact label="Sort" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
            </div>

            {/* Filter summary */}
            <div className="flex items-center justify-between px-4 pb-4 sm:px-6">
              <p className="text-xs text-slate-400">
                {rowUsers.length} of {total} users match{hasActiveFilters ? " your filters" : ""}
              </p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs font-semibold text-orange-500 hover:text-orange-600">
                  Clear filters
                </button>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="mt-2 text-sm font-medium text-slate-500">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-auto max-h-[520px] rounded-b-2xl">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                    <tr className="border-y border-slate-100 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      <th className="py-3 pl-6 pr-2 w-14">Avatar</th>
                      <th className="py-3 pr-2">Name</th>
                      <th className="py-3 pr-2">Email</th>
                      <th className="py-3 pr-2">Role</th>
                      <th className="py-3 pr-2">Department</th>
                      <th className="py-3 pr-2">Permissions</th>
                      <th className="py-3 pr-2">Status</th>
                      <th className="py-3 pr-2">Last Login</th>
                      <th className="py-3 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowUsers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <p className="text-sm font-semibold text-slate-500">No users match these filters</p>
                          <button
                            onClick={resetFilters}
                            className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600"
                          >
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    )}
                    {rowUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                        <td className="py-4 pl-6 pr-2">
                          <div className="relative h-9 w-9">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${initialAvatarColor(
                                u.name
                              )}`}
                            >
                              {u.name[0]}
                            </div>
                            <span
                              title={u.status === "Active" ? "Online" : "Offline"}
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                                u.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                          </div>
                        </td>
                        <td className="py-4 pr-2 text-sm font-semibold text-slate-800">{u.name}</td>
                        <td className="py-4 pr-2 text-sm text-slate-500">{u.email}</td>
                        <td className="py-4 pr-2">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-4 pr-2 text-sm text-slate-500">{u.department}</td>
                        <td className="py-4 pr-2 text-sm text-slate-500">{u.permissionSummary}</td>
                        <td className="py-4 pr-2">
                          <StatusPill status={u.status} />
                        </td>
                        <td className="py-4 pr-2 text-sm text-slate-500">{u.lastActive}</td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center justify-end gap-3 text-slate-400">
                            <button onClick={() => handleView(u.id)} title="View" className="hover:text-slate-700">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button title="Edit" className="hover:text-slate-700">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleSuspend(u.id)}
                              title={u.status === "Active" ? "Suspend" : "Activate"}
                              className="hover:text-slate-700"
                            >
                              {u.status === "Active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </button>
                            <button onClick={() => deleteUser(u.id)} title="Delete" className="hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Rows per page</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-7 py-1.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 disabled:text-slate-300"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 disabled:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 rounded-md bg-orange-500 text-white text-sm font-bold">{page}</button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 disabled:text-slate-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 disabled:text-slate-300"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddOpen && <AddUserModal onClose={() => setAddOpen(false)} onCreate={handleCreate} />}
      {(viewUser || viewLoading) &&
        (viewLoading || !viewUser ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <UserDrawer user={viewUser} onClose={() => setViewUser(null)} />
        ))}
    </div>
  );
}
