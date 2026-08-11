"use client";

import { useEffect, useState } from "react";
import {
  Search, Bell, Download, Archive, RefreshCw, Shield, AlertTriangle,
  XCircle, FileText, ChevronLeft, ChevronRight, ChevronDown, Loader2, X,
} from "lucide-react";
import {
  getSystemLogs, getLogDetail, getLogModules, getLogStats,
  getWeeklyActivity, getRecentSecurityEvents, archiveLogsAction,
  LogRow, LogDetail,
} from "@/app/actions/system-logs";

const LOG_LEVELS = ["All Levels", "Info", "Warning", "Critical"];
const DATE_RANGES = ["Today", "Last 7 Days", "Last 30 Days", "All Time"];
const PAGE_SIZE = 5;

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Completed: "bg-sky-50 text-sky-700 ring-sky-600/20",
    Failed: "bg-red-50 text-red-700 ring-red-600/20",
    Blocked: "bg-orange-50 text-orange-700 ring-orange-600/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${styles[status] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
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

function StatCard({ icon, iconBg, label, value, valueClass = "text-slate-900" }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function SecurityEventItem({ title, detail, level }: { title: string; detail: string; level: string }) {
  const iconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
    Critical: { icon: <XCircle className="h-4 w-4 text-red-500" />, bg: "bg-red-50" },
    Warning: { icon: <Shield className="h-4 w-4 text-amber-500" />, bg: "bg-amber-50" },
    Info: { icon: <Shield className="h-4 w-4 text-blue-500" />, bg: "bg-blue-50" },
  };
  const { icon, bg } = iconMap[level] ?? iconMap.Info;
  return (
    <li className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>{icon}</span>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </li>
  );
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [modules, setModules] = useState<string[]>(["All Modules"]);
  const [stats, setStats] = useState({ total: 0, warnings: 0, critical: 0, securityEvents: 0, levelBreakdown: { info: 0, warning: 0, critical: 0 } });
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; count: number; h: number }[]>([]);
  const [securityEvents, setSecurityEvents] = useState<{ id: string; title: string; detail: string; level: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState(LOG_LEVELS[0]);
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [page, setPage] = useState(1);

  const [viewLog, setViewLog] = useState<LogDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function loadLogs() {
    setLoading(true);
    const data = await getSystemLogs({
      search,
      level: level === "All Levels" ? "" : level,
      module: moduleFilter === "All Modules" ? "" : moduleFilter,
      dateRange,
      page,
      pageSize: PAGE_SIZE,
    });
    setLogs(data.logs);
    setTotal(data.total);
    setLoading(false);
  }

  async function loadSidebarData() {
    const [statsData, activity, events, mods] = await Promise.all([
      getLogStats(), getWeeklyActivity(), getRecentSecurityEvents(), getLogModules(),
    ]);
    setStats(statsData);
    setWeeklyActivity(activity);
    setSecurityEvents(events);
    setModules(["All Modules", ...mods]);
  }

  useEffect(() => {
    loadSidebarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, moduleFilter, dateRange, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadLogs();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleView(id: string) {
    setViewLoading(true);
    const detail = await getLogDetail(id);
    setViewLoading(false);
    if (detail) setViewLog(detail);
  }

  async function handleRefresh() {
    await Promise.all([loadLogs(), loadSidebarData()]);
  }

  async function handleArchiveVisible() {
    if (logs.length === 0) return;
    if (!confirm(`Archive ${logs.length} log(s) currently shown on this page?`)) return;
    const res = await archiveLogsAction(logs.map((l) => l.id));
    if (res.success) {
      loadLogs();
      loadSidebarData();
    } else {
      alert(res.message);
    }
  }

  function exportToCSV() {
    const headers = ["Timestamp", "Event", "Module", "User", "Business", "IP Address", "Status", "Level"];
    const csvRows = logs.map((l) =>
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
            <button type="button" aria-label="Notifications" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Stat cards — real counts */}
        <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<FileText className="h-5 w-5 text-orange-500" />} iconBg="bg-orange-50" label="Total Logs" value={stats.total.toLocaleString()} />
          <StatCard icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50" label="Warnings" value={stats.warnings.toLocaleString()} />
          <StatCard icon={<XCircle className="h-5 w-5 text-red-500" />} iconBg="bg-red-50" label="Errors" value={stats.critical.toLocaleString()} valueClass="text-red-600" />
          <StatCard icon={<Shield className="h-5 w-5 text-blue-500" />} iconBg="bg-blue-50" label="Security Events" value={stats.securityEvents.toLocaleString()} />
        </section>

        {/* Action bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              <Download className="h-4 w-4" /> Export Logs
            </button>
            <button
              type="button"
              onClick={handleArchiveVisible}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900"
            >
              <Archive className="h-4 w-4" /> Archive Logs
            </button>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-orange-600 hover:text-orange-700 sm:self-auto"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">Search Logs</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      type="text"
                      placeholder="Search by event or user..."
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
                <SelectField label="Log Level" value={level} onChange={(v) => { setLevel(v); setPage(1); }} options={LOG_LEVELS} />
                <SelectField label="Module" value={moduleFilter} onChange={(v) => { setModuleFilter(v); setPage(1); }} options={modules} />
                <SelectField label="Date Range" value={dateRange} onChange={(v) => { setDateRange(v); setPage(1); }} options={DATE_RANGES} />
              </div>
            </div>

            {/* Logs table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex h-56 flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                  <span className="mt-2 text-sm font-medium text-slate-500">Loading logs...</span>
                </div>
              ) : (
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
                      {logs.map((log) => (
                        <tr key={log.id} className="transition hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.displayTime}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{log.event}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{log.module}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar initials={log.userInitials} />
                              <span className="text-slate-700">{log.user}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.business}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.ip}</td>
                          <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={log.status} /></td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <button onClick={() => handleView(log.id)} className="text-sm font-medium text-orange-600 hover:text-orange-700">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                            No logs match your filters. Try adjusting search, level, module or date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} logs
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium ${page === i + 1 ? "bg-orange-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
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

            {/* Bottom charts row — real data */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Logs by Level</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div
                    className="relative h-28 w-28 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(#f97316 0% ${stats.levelBreakdown.info}%, #fed7aa ${stats.levelBreakdown.info}% ${stats.levelBreakdown.info + stats.levelBreakdown.warning}%, #dc2626 ${stats.levelBreakdown.info + stats.levelBreakdown.warning}% 100%)`,
                    }}
                  >
                    <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                      {stats.total}
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Info ({stats.levelBreakdown.info}%)</li>
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orange-200" /> Warning ({stats.levelBreakdown.warning}%)</li>
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Critical ({stats.levelBreakdown.critical}%)</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Activity Timeline</h3>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Events (7d)
                  </span>
                </div>
                <div className="flex h-28 items-end justify-between gap-2">
                  {weeklyActivity.map((d) => (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="w-full max-w-[22px] rounded-t-md bg-orange-500/80" style={{ height: `${Math.max(d.h, 3)}%` }} />
                      <span className="text-[10px] text-slate-400">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Security Events</h3>
                <Shield className="h-4 w-4 text-orange-400" />
              </div>
              <ul className="space-y-3">
                {securityEvents.length > 0 ? (
                  securityEvents.map((e) => <SecurityEventItem key={e.id} title={e.title} detail={e.detail} level={e.level} />)
                ) : (
                  <p className="text-xs text-slate-400">No recent security events.</p>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">System Health</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Database Connectivity</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {(viewLog || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">Log Details</h2>
              <button onClick={() => setViewLog(null)}><X size={22} /></button>
            </div>
            {viewLoading || !viewLog ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              </div>
            ) : (
              <div className="space-y-3 p-5 text-sm sm:p-6">
                <p><span className="font-medium">Event:</span> {viewLog.event}</p>
                <p><span className="font-medium">Time:</span> {viewLog.displayTime}</p>
                <p><span className="font-medium">Module:</span> {viewLog.module}</p>
                <p><span className="font-medium">User:</span> {viewLog.user}</p>
                <p><span className="font-medium">Business:</span> {viewLog.business}</p>
                <p><span className="font-medium">IP Address:</span> {viewLog.ip}</p>
                <p className="flex items-center gap-2"><span className="font-medium">Status:</span> <StatusBadge status={viewLog.status} /></p>
                <div className="rounded-lg bg-slate-50 p-3 text-slate-600">{viewLog.details}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}