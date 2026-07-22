"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  Download,
  Archive,
  RefreshCw,
  Shield,
  AlertTriangle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type LogLevel = "Info" | "Warning" | "Critical";
type LogStatus = "Success" | "Completed" | "Failed" | "Blocked";

interface LogEntry {
  id: string;
  timestamp: string; // ISO string, used for date-range filtering
  displayTime: string; // pre-formatted for the table
  event: string;
  module: string;
  user: string;
  userInitials: string;
  business: string;
  ip: string;
  status: LogStatus;
  level: LogLevel;
}

// ---------------------------------------------------------------------------
// Mock data — swap this out for a real API / DB call
// ---------------------------------------------------------------------------
const LOG_DATA: LogEntry[] = [
  { id: "1", timestamp: "2026-07-22T10:32:00", displayTime: "22 Jul 2026, 10:32 AM", event: "User Login", module: "Authentication", user: "Sima Malla", userInitials: "SM", business: "Global", ip: "192.168.1.22", status: "Success", level: "Info" },
  { id: "2", timestamp: "2026-07-22T10:40:00", displayTime: "22 Jul 2026, 10:40 AM", event: "Business Approved", module: "Businesses", user: "Sima Malla", userInitials: "SM", business: "Green Kitchen", ip: "192.168.1.22", status: "Completed", level: "Info" },
  { id: "3", timestamp: "2026-07-22T11:30:00", displayTime: "22 Jul 2026, 11:30 AM", event: "Payment Failed", module: "Payments", user: "Restaurant Admin", userInitials: "RA", business: "Le Bistro", ip: "192.168.4.15", status: "Failed", level: "Critical" },
  { id: "4", timestamp: "2026-07-22T12:10:00", displayTime: "22 Jul 2026, 12:10 PM", event: "Failed Login Attempt", module: "Authentication", user: "Unknown User", userInitials: "??", business: "—", ip: "103.55.xx.xx", status: "Blocked", level: "Warning" },
  { id: "5", timestamp: "2026-07-22T13:45:00", displayTime: "22 Jul 2026, 01:45 PM", event: "New User Registered", module: "Authentication", user: "Guest", userInitials: "GU", business: "Global", ip: "112.44.52.1", status: "Success", level: "Info" },
  { id: "6", timestamp: "2026-07-21T09:12:00", displayTime: "21 Jul 2026, 09:12 AM", event: "Password Reset Requested", module: "Authentication", user: "Sima Malla", userInitials: "SM", business: "Global", ip: "192.168.1.22", status: "Completed", level: "Warning" },
  { id: "7", timestamp: "2026-07-21T14:02:00", displayTime: "21 Jul 2026, 02:02 PM", event: "New Security Rule Added", module: "Global Config", user: "Sima Malla", userInitials: "SM", business: "Global", ip: "192.168.1.22", status: "Success", level: "Info" },
  { id: "8", timestamp: "2026-07-20T16:30:00", displayTime: "20 Jul 2026, 04:30 PM", event: "Session Timeout", module: "Authentication", user: "User 8291", userInitials: "U8", business: "Spice Route", ip: "192.168.9.4", status: "Completed", level: "Info" },
  { id: "9", timestamp: "2026-07-20T18:00:00", displayTime: "20 Jul 2026, 06:00 PM", event: "Order Refund Issued", module: "Payments", user: "Restaurant Admin", userInitials: "RA", business: "Le Bistro", ip: "192.168.4.15", status: "Completed", level: "Info" },
  { id: "10", timestamp: "2026-07-19T08:20:00", displayTime: "19 Jul 2026, 08:20 AM", event: "API Rate Limit Exceeded", module: "System", user: "System", userInitials: "SY", business: "Global", ip: "10.0.0.5", status: "Failed", level: "Critical" },
];

const LOG_LEVELS: (LogLevel | "All Levels")[] = ["All Levels", "Info", "Warning", "Critical"];
const MODULES: string[] = ["All Modules", ...Array.from(new Set(LOG_DATA.map((l) => l.module)))];
const DATE_RANGES = ["Today", "Last 7 Days", "Last 30 Days", "All Time"] as const;

const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: LogStatus }) {
  const styles: Record<LogStatus, string> = {
    Success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Completed: "bg-sky-50 text-sky-700 ring-sky-600/20",
    Failed: "bg-red-50 text-red-700 ring-red-600/20",
    Blocked: "bg-orange-50 text-orange-700 ring-orange-600/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-semibold text-orange-700">
      {initials}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SystemLogsPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<(typeof LOG_LEVELS)[number]>("All Levels");
  const [moduleFilter, setModuleFilter] = useState(MODULES[0]);
  const [dateRange, setDateRange] = useState<(typeof DATE_RANGES)[number]>("Last 30 Days");
  const [page, setPage] = useState(1);

  // ---- filtering -----------------------------------------------------
  const filteredLogs = useMemo(() => {
    const now = new Date("2026-07-22T23:59:59");
    const cutoff = new Date(now);
    if (dateRange === "Today") cutoff.setDate(now.getDate());
    if (dateRange === "Last 7 Days") cutoff.setDate(now.getDate() - 7);
    if (dateRange === "Last 30 Days") cutoff.setDate(now.getDate() - 30);

    return LOG_DATA.filter((log) => {
      const matchesSearch =
        search.trim() === "" ||
        log.event.toLowerCase().includes(search.toLowerCase()) ||
        log.user.toLowerCase().includes(search.toLowerCase());

      const matchesLevel = level === "All Levels" || log.level === level;
      const matchesModule = moduleFilter === "All Modules" || log.module === moduleFilter;

      const logDate = new Date(log.timestamp);
      const matchesDate =
        dateRange === "All Time"
          ? true
          : dateRange === "Today"
          ? logDate.toDateString() === now.toDateString()
          : logDate >= cutoff;

      return matchesSearch && matchesLevel && matchesModule && matchesDate;
    });
  }, [search, level, moduleFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset to page 1 whenever a filter changes and pushes us out of range
  if (page > totalPages) setPage(1);

  // ---- export ----------------------------------------------------------
  function exportToCSV() {
    const rows = filteredLogs.length > 0 ? filteredLogs : LOG_DATA;
    const headers = ["Timestamp", "Event", "Module", "User", "Business", "IP Address", "Status", "Level"];
    const csvRows = rows.map((l) =>
      [l.displayTime, l.event, l.module, l.user, l.business, l.ip, l.status, l.level]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `system-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">System Logs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor platform activities, audit trails, security events and system operations.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Global search..."
                className="w-56 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 lg:w-64"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="https://i.pravatar.cc/64?img=47"
                alt="Sima Malla"
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="hidden leading-tight md:block">
                <p className="text-sm font-medium text-slate-900">Sima Malla</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stat cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FileText className="h-5 w-5 text-orange-500" />}
            iconBg="bg-orange-50"
            label="Total Logs"
            value="84,392"
            badge="+8.5%"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            iconBg="bg-amber-50"
            label="Warnings"
            value="152"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            iconBg="bg-red-50"
            label="Errors"
            value="21"
            valueClass="text-red-600"
          />
          <StatCard
            icon={<Shield className="h-5 w-5 text-blue-500" />}
            iconBg="bg-blue-50"
            label="Security Events"
            value="36"
          />
        </section>

        {/* Action bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              <Download className="h-4 w-4" />
              Export Logs
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900"
            >
              <Archive className="h-4 w-4" />
              Archive Logs
            </button>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-orange-600 hover:text-orange-700 sm:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-6 xl:col-span-2">
            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Search Logs
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      type="text"
                      placeholder="Search by event or user..."
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <SelectField
                  label="Log Level"
                  value={level}
                  onChange={(v) => {
                    setLevel(v as typeof level);
                    setPage(1);
                  }}
                  options={LOG_LEVELS}
                />

                <SelectField
                  label="Module"
                  value={moduleFilter}
                  onChange={(v) => {
                    setModuleFilter(v);
                    setPage(1);
                  }}
                  options={MODULES}
                />

                <SelectField
                  label="Date Range"
                  value={dateRange}
                  onChange={(v) => {
                    setDateRange(v as typeof dateRange);
                    setPage(1);
                  }}
                  options={[...DATE_RANGES]}
                />
              </div>
            </div>

            {/* Logs table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <th className="whitespace-nowrap px-4 py-3">Timestamp</th>
                      <th className="whitespace-nowrap px-4 py-3">Event</th>
                      <th className="whitespace-nowrap px-4 py-3">Module</th>
                      <th className="whitespace-nowrap px-4 py-3">User</th>
                      <th className="whitespace-nowrap px-4 py-3">Business</th>
                      <th className="whitespace-nowrap px-4 py-3">IP Address</th>
                      <th className="whitespace-nowrap px-4 py-3">Status</th>
                      <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedLogs.map((log) => (
                      <tr key={log.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.displayTime}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{log.event}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {log.module}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar initials={log.userInitials} />
                            <span className="text-slate-700">{log.user}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.business}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.ip}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {paginatedLogs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                          No logs match your filters. Try adjusting search, level, module or date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Showing {filteredLogs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} logs
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages })
                    .slice(0, 5)
                    .map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`h-8 w-8 rounded-lg text-xs font-medium ${
                          page === i + 1
                            ? "bg-orange-600 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom charts row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Logs by Level</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div
                    className="relative h-28 w-28 shrink-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#f97316 0% 80%, #fed7aa 80% 95%, #dc2626 95% 100%)",
                    }}
                  >
                    <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                      100%
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Info (80%)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-200" /> Warning (15%)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Critical (5%)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Activity Timeline</h3>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Events / Hour
                  </span>
                </div>
                <div className="flex h-28 items-end justify-between gap-2">
                  {[
                    { day: "Mon", h: 30 },
                    { day: "Tue", h: 45 },
                    { day: "Wed", h: 60 },
                    { day: "Thu", h: 100 },
                    { day: "Fri", h: 70 },
                    { day: "Sat", h: 85 },
                    { day: "Sun", h: 65 },
                  ].map((d) => (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className="w-full max-w-[22px] rounded-t-md bg-orange-500/80"
                        style={{ height: `${d.h}%` }}
                      />
                      <span className="text-[10px] text-slate-400">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Security events */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Security Events</h3>
                <Shield className="h-4 w-4 text-orange-400" />
              </div>
              <ul className="space-y-3">
                <SecurityEventItem
                  icon={<XCircle className="h-4 w-4 text-red-500" />}
                  iconBg="bg-red-50"
                  title="Failed Login Attempt"
                  detail="IP: 103.55.xx.xx • 2m ago"
                />
                <SecurityEventItem
                  icon={<Shield className="h-4 w-4 text-blue-500" />}
                  iconBg="bg-blue-50"
                  title="Password Reset Requested"
                  detail="Admin (Sima) • 15m ago"
                />
                <SecurityEventItem
                  icon={<Shield className="h-4 w-4 text-emerald-500" />}
                  iconBg="bg-emerald-50"
                  title="New Security Rule Added"
                  detail="Global Config • 1h ago"
                />
                <SecurityEventItem
                  icon={<Shield className="h-4 w-4 text-amber-500" />}
                  iconBg="bg-amber-50"
                  title="Session Timeout"
                  detail="User 8291 • 3h ago"
                />
              </ul>
              <button className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50">
                VIEW ALL SECURITY LOGS
              </button>
            </div>

            {/* System health */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">System Health</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Database Connectivity</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    OPTIMAL
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">API Gateway Latency</span>
                  <span className="font-medium text-slate-700">24ms</span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-slate-500">Server Load</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className="h-1.5 w-1/3 rounded-full bg-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade banner */}
            <div className="relative overflow-hidden rounded-xl bg-slate-900 p-5 text-white shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-transparent to-transparent" />
              <div className="relative">
                <p className="text-sm font-semibold">Upgrade Protection</p>
                <p className="mt-1 text-xs text-slate-300">
                  Enable AI-driven threat detection for real-time security mitigation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({
  icon,
  iconBg,
  label,
  value,
  badge,
  valueClass = "text-slate-900",
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  badge?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>
        {badge && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function SecurityEventItem({
  icon,
  iconBg,
  title,
  detail,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>{icon}</span>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </li>
  );
}
