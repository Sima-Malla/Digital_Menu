"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  UserPlus,
  Upload,
  Download,
  Eye,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Users,
  UserCheck,
  Ban,
  ClipboardCheck,
  Building2,
  Shield,
  Clock,
  Mail,
  Phone,
  Calendar,
  Layers,
  Gauge,
} from "lucide-react";

// ============================================================================
// Types & mock data
// ============================================================================

type Status = "Active" | "Suspended";
type Role = "Super Admin" | "Admin" | "Moderator" | "Support" | "Viewer";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  status: Status;
  lastActive: string;
  createdDate: string;
  permissionSummary: string;
  permissions: string[];
  activity: { label: string; time: string }[];
}

const users: PlatformUser[] = [
  {
    id: "1",
    name: "Sima",
    email: "sima@gourmetflow.com",
    phone: "+1 (555) 012-3344",
    role: "Super Admin",
    department: "Global Operations",
    status: "Active",
    lastActive: "2 mins ago",
    createdDate: "Jan 14, 2024",
    permissionSummary: "Full Access",
    permissions: ["Full Access", "Billing", "User Management", "System Settings"],
    activity: [
      { label: "Approved 3 pending verifications", time: "2 mins ago" },
      { label: "Updated business profile: Kathmandu Grand", time: "1 hour ago" },
      { label: "Signed in from Kathmandu, NP", time: "3 hours ago" },
    ],
  },
  {
    id: "2",
    name: "Ram",
    email: "ram@gourmetflow.com",
    phone: "+1 (555) 221-9087",
    role: "Admin",
    department: "Operations",
    status: "Active",
    lastActive: "1 hour ago",
    createdDate: "Mar 2, 2024",
    permissionSummary: "Business + Orders",
    permissions: ["User Management", "Reports", "Support Tools"],
    activity: [
      { label: "Suspended account: hari@gourmetflow.com", time: "1 hour ago" },
      { label: "Exported user data (CSV)", time: "5 hours ago" },
    ],
  },
  {
    id: "3",
    name: "Hari",
    email: "hari@gourmetflow.com",
    phone: "+1 (555) 908-1122",
    role: "Moderator",
    department: "Trust & Safety",
    status: "Suspended",
    lastActive: "Yesterday",
    createdDate: "Jun 18, 2024",
    permissionSummary: "Verification",
    permissions: ["Content Review", "Flag Reports"],
    activity: [
      { label: "Account suspended by Ram", time: "Yesterday" },
      { label: "Reviewed 12 flagged listings", time: "2 days ago" },
    ],
  },
  {
    id: "4",
    name: "Anita",
    email: "anita@gourmetflow.com",
    phone: "+1 (555) 774-2210",
    role: "Support",
    department: "Customer Care",
    status: "Active",
    lastActive: "20 mins ago",
    createdDate: "Sep 9, 2024",
    permissionSummary: "Support Tools",
    permissions: ["Ticket Management", "Refunds (limited)"],
    activity: [
      { label: "Resolved 8 support tickets", time: "20 mins ago" },
      { label: "Escalated billing dispute #4471", time: "2 hours ago" },
    ],
  },
  {
    id: "5",
    name: "Bikash",
    email: "bikash@gourmetflow.com",
    phone: "+1 (555) 340-7765",
    role: "Viewer",
    department: "Finance",
    status: "Active",
    lastActive: "3 hours ago",
    createdDate: "Nov 27, 2024",
    permissionSummary: "Read Only",
    permissions: ["Read-only Reports"],
    activity: [{ label: "Viewed Q2 revenue report", time: "3 hours ago" }],
  },
];

const roleBadgeStyles: Record<Role, string> = {
  "Super Admin": "bg-orange-50 text-orange-600",
  Admin: "bg-blue-50 text-blue-600",
  Moderator: "bg-purple-50 text-purple-600",
  Support: "bg-emerald-50 text-emerald-600",
  Viewer: "bg-slate-100 text-slate-600",
};

const roleDotStyles: Record<Role, string> = {
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
  return avatarPalette[name[0]] ?? "bg-slate-100 text-slate-500";
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
  delta,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  delta?: string;
  subtitle: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-5 min-w-[190px]">
      <div className="flex items-center justify-between">
        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
        {delta && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <TrendingUp className="h-3.5 w-3.5" />
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </p>
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
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </span>
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

function StatusPill({ status }: { status: Status }) {
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

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${roleBadgeStyles[role]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${roleDotStyles[role]}`} />
      {role}
    </span>
  );
}

// ============================================================================
// Add New User modal
// ============================================================================

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [sendInvite, setSendInvite] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-orange-100">
          <h2 className="text-xl font-bold text-slate-900">
            Add New Platform User
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              className="mt-1.5 w-full rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="mt-1.5 w-full rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="mt-1.5 w-full rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Select Role
              </label>
              <div className="relative mt-1.5">
                <select className="w-full appearance-none rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200">
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
              <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Department
              </label>
              <div className="relative mt-1.5">
                <select className="w-full appearance-none rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200">
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
            <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Permission Template
            </label>
            <div className="relative mt-1.5">
              <select className="w-full appearance-none rounded-lg border border-orange-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200">
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
              <p className="text-sm font-bold text-slate-800">
                Send Invitation Email
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                User will receive login instructions
              </p>
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-6 bg-slate-50 border-t border-slate-100 px-7 py-5">
          <button
            onClick={onClose}
            className="text-sm font-bold text-slate-700 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// View drawer
// ============================================================================

function UserDrawer({
  user,
  onClose,
}: {
  user: PlatformUser;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">User Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-7">
          {/* Identity */}
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

          {/* Contact */}
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
              <span className="text-sm text-slate-600">
                {user.department}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                Created {user.createdDate}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                Last login {user.lastActive}
              </span>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Permissions
            </p>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-3">
              Recent Activities
            </p>
            <div className="flex flex-col gap-4">
              {user.activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">{a.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
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

function matchesLastLogin(lastActive: string, filter: string) {
  if (filter === "Last Login") return true;
  const isToday = /mins? ago|hours? ago/i.test(lastActive);
  const isThisWeek = isToday || /yesterday|days? ago/i.test(lastActive);
  const isThisMonth = isThisWeek || true; // everything in this mock dataset falls within the month
  if (filter === "Today") return isToday;
  if (filter === "This week") return isThisWeek;
  if (filter === "This month") return isThisMonth;
  return true;
}

export default function PlatformUsersPage() {
  const [page] = useState(1);
  const [isAddOpen, setAddOpen] = useState(false);
  const [viewUser, setViewUser] = useState<PlatformUser | null>(null);
  const [rowUsers, setRowUsers] = useState(users);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(ROLE_OPTIONS[0]);
  const [departmentFilter, setDepartmentFilter] = useState(DEPARTMENT_OPTIONS[0]);
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0]);
  const [lastLoginFilter, setLastLoginFilter] = useState(LAST_LOGIN_OPTIONS[0]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);

  function toggleSuspend(id: string) {
    setRowUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  }

  function deleteUser(id: string) {
    setRowUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const query = searchQuery.trim().toLowerCase();

  const filteredUsers = rowUsers
    .filter((u) =>
      query
        ? u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        : true
    )
    .filter((u) => (roleFilter === "Role" ? true : u.role === roleFilter))
    .filter((u) =>
      departmentFilter === "Department" ? true : u.department === departmentFilter
    )
    .filter((u) => (statusFilter === "Status" ? true : u.status === statusFilter))
    .filter((u) => matchesLastLogin(u.lastActive, lastLoginFilter))
    .sort((a, b) => {
      if (sortBy === "Name A-Z") return a.name.localeCompare(b.name);
      if (sortBy === "Name Z-A") return b.name.localeCompare(a.name);
      if (sortBy === "Role") return a.role.localeCompare(b.role);
      return 0; // "Sort: Newest" — keep original order
    });

  function resetFilters() {
    setSearchQuery("");
    setRoleFilter(ROLE_OPTIONS[0]);
    setDepartmentFilter(DEPARTMENT_OPTIONS[0]);
    setStatusFilter(STATUS_OPTIONS[0]);
    setLastLoginFilter(LAST_LOGIN_OPTIONS[0]);
    setSortBy(SORT_OPTIONS[0]);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        {/* Header */}
        <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-0 bg-white px-6 pt-6 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8 rounded-t-3xl flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Platform Users
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage internal platform users
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="search users ...."
                className="w-64 rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
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

        {/* Main + sidebar layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 mt-6">
          {/* ---------------- Main column ---------------- */}
          <div className="flex flex-col gap-4">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              <StatCard
                icon={<Users className="h-4.5 w-4.5" />}
                iconBg="bg-orange-50"
                iconColor="text-orange-500"
                label="Total Users"
                value="1,248,390"
                delta="12.5%"
                subtitle="+12.5% this month"
              />
              <StatCard
                icon={<UserCheck className="h-4.5 w-4.5" />}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-500"
                label="Active Users"
                value="1,102,450"
                subtitle="88% Active"
              />
              <StatCard
                icon={<Ban className="h-4.5 w-4.5" />}
                iconBg="bg-rose-50"
                iconColor="text-rose-400"
                label="Suspended Accounts"
                value="218"
                subtitle="Need Review"
              />
              <StatCard
                icon={<ClipboardCheck className="h-4.5 w-4.5" />}
                iconBg="bg-blue-50"
                iconColor="text-blue-500"
                label="Pending Verifications"
                value="1,402"
                subtitle="Awaiting Verification"
              />
            </div>

            {/* Action buttons — one row on desktop */}
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

            {/* Quick stats bar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-6 py-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
              <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Platform Coverage
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="h-4 w-4 text-orange-500" />
                248 Internal Users
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-blue-500" />
                18 Departments
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Gauge className="h-4 w-4 text-emerald-500" />
                99.9% Active
              </div>
            </div>

            {/* User directory */}
            <div className="rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4 p-6 pb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    User Directory
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    Global
                  </span>
                </div>
              </div>

              {/* Search + filter row */}
              <div className="flex flex-wrap items-center gap-3 px-6 pb-3">
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
                  onChange={setRoleFilter}
                />
                <FilterSelect
                  compact
                  label="Department"
                  options={DEPARTMENT_OPTIONS}
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                />
                <FilterSelect
                  compact
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                <FilterSelect
                  compact
                  label="Last Login"
                  options={LAST_LOGIN_OPTIONS}
                  value={lastLoginFilter}
                  onChange={setLastLoginFilter}
                />
                <FilterSelect
                  compact
                  label="Sort"
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>

              {/* Active filter summary + reset */}
              <div className="flex items-center justify-between px-6 pb-4">
                <p className="text-xs text-slate-400">
                  {filteredUsers.length} of {rowUsers.length} users match
                  {query || roleFilter !== "Role" || departmentFilter !== "Department" || statusFilter !== "Status" || lastLoginFilter !== "Last Login"
                    ? " your filters"
                    : ""}
                </p>
                {(query ||
                  roleFilter !== "Role" ||
                  departmentFilter !== "Department" ||
                  statusFilter !== "Status" ||
                  lastLoginFilter !== "Last Login" ||
                  sortBy !== "Sort: Newest") && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[520px] rounded-b-2xl">
                <table className="w-full text-left">
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
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <p className="text-sm font-semibold text-slate-500">
                            No users match these filters
                          </p>
                          <button
                            onClick={resetFilters}
                            className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600"
                          >
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                      >
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
                        <td className="py-4 pr-2 text-sm font-semibold text-slate-800">
                          {u.name}
                        </td>
                        <td className="py-4 pr-2 text-sm text-slate-500">
                          {u.email}
                        </td>
                        <td className="py-4 pr-2">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-4 pr-2 text-sm text-slate-500">
                          {u.department}
                        </td>
                        <td className="py-4 pr-2 text-sm text-slate-500">
                          {u.permissionSummary}
                        </td>
                        <td className="py-4 pr-2">
                          <StatusPill status={u.status} />
                        </td>
                        <td className="py-4 pr-2 text-sm text-slate-500 whitespace-pre-line">
                          {u.lastActive}
                        </td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center justify-end gap-3 text-slate-400">
                            <button
                              onClick={() => setViewUser(u)}
                              aria-label={`View ${u.name}`}
                              title="View"
                              className="hover:text-slate-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              aria-label={`Edit ${u.name}`}
                              title="Edit"
                              className="hover:text-slate-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleSuspend(u.id)}
                              aria-label={
                                u.status === "Active"
                                  ? `Suspend ${u.name}`
                                  : `Activate ${u.name}`
                              }
                              title={u.status === "Active" ? "Suspend" : "Activate"}
                              className="hover:text-slate-700"
                            >
                              {u.status === "Active" ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              aria-label={`Delete ${u.name}`}
                              title="Delete"
                              className="hover:text-rose-600"
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

              {/* Table footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Rows per page
                  </span>
                  <div className="relative">
                    <select className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-7 py-1.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Showing 1-{filteredUsers.length} of {rowUsers.length} users
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-300"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled
                    className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 rounded-md bg-orange-500 text-white text-sm font-bold">
                    {page}
                  </button>
                  <button className="h-8 w-8 rounded-md text-sm font-semibold text-slate-500 hover:bg-slate-50">
                    2
                  </button>
                  <button className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Sidebar ---------------- */}
          <div className="flex flex-col gap-4">
            {/* Platform summary widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-4">
                Platform Summary
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">1,248,390</p>
                    <p className="text-xs text-slate-400">Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">5</p>
                    <p className="text-xs text-slate-400">Roles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">18</p>
                    <p className="text-xs text-slate-400">Departments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Gauge className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">99.9%</p>
                    <p className="text-xs text-slate-400">Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role legend widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-4">
                Role Colors
              </p>
              <div className="flex flex-col gap-3">
                {(Object.keys(roleDotStyles) as Role[]).map((r) => (
                  <div key={r} className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${roleDotStyles[r]}`} />
                    <span className="text-sm text-slate-600">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-4">
                Recent Activity
              </p>
              <div className="flex flex-col gap-3.5">
                {[
                  { label: "Ram logged in", time: "1 hour ago" },
                  { label: "Hari suspended", time: "Yesterday" },
                  { label: "Anita created", time: "2 days ago" },
                  { label: "Password reset requested", time: "3 days ago" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddOpen && <AddUserModal onClose={() => setAddOpen(false)} />}
      {viewUser && (
        <UserDrawer user={viewUser} onClose={() => setViewUser(null)} />
      )}
    </div>
  );
}
