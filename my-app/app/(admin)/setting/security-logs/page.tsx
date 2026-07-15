"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  ShieldCheck,
  ChevronRight,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  Eye,
  AlertTriangle,
  XCircle,
  X,
  CheckCircle2,
  FileText,
  CalendarDays,
  ShieldAlert,
  Fingerprint,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

/* ─── Status Badge ──────────────────────────────────────── */

function StatusBadge({ status }: { status: "SUCCESS" | "WARNING" | "FAILED" }) {
  const config = {
    SUCCESS: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    WARNING: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    FAILED: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: XCircle,
      iconColor: "text-red-500",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${c.bg} ${c.border} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c.text}`}
    >
      <Icon className={`h-3 w-3 ${c.iconColor}`} strokeWidth={2.5} />
      {status}
    </span>
  );
}

/* ─── Priority Dot ──────────────────────────────────────── */

function PriorityDot({ priority }: { priority: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-gray-300",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[priority]}`}
      title={`${priority} priority`}
    />
  );
}

/* ─── Data ────────────────────────────────────────────────── */

type LogEntry = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string;
  priority: "high" | "medium" | "low";
};

const logData: LogEntry[] = [
  {
    id: "1",
    timestamp: "2025-01-15 14:32:08",
    user: "Sarah Mitchell",
    role: "Admin",
    action: "Menu Item Updated",
    category: "Content",
    ipAddress: "192.168.1.45",
    status: "SUCCESS",
    details: 'Updated "Truffle Risotto" price from $28 to $32',
    priority: "low",
  },
  {
    id: "2",
    timestamp: "2025-01-15 14:28:51",
    user: "Unknown",
    role: "—",
    action: "Login Failed",
    category: "Auth",
    ipAddress: "104.22.184.21",
    status: "FAILED",
    details: "Invalid credentials — 3rd attempt from IP 104.22.184.21",
    priority: "high",
  },
  {
    id: "3",
    timestamp: "2025-01-15 14:15:33",
    user: "James Cooper",
    role: "Manager",
    action: "Reservation Modified",
    category: "Operations",
    ipAddress: "10.0.0.12",
    status: "SUCCESS",
    details: "Changed party size for RES-20250115-089 from 4 to 6 guests",
    priority: "low",
  },
  {
    id: "4",
    timestamp: "2025-01-15 13:58:12",
    user: "System",
    role: "Automated",
    action: "Backup Completed",
    category: "System",
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    details: "Daily database backup completed — 2.4 GB compressed",
    priority: "low",
  },
  {
    id: "5",
    timestamp: "2025-01-15 13:42:07",
    user: "Sarah Mitchell",
    role: "Admin",
    action: "User Role Changed",
    category: "Access",
    ipAddress: "192.168.1.45",
    status: "WARNING",
    details: 'Elevated "Emily Davis" from Staff to Manager role',
    priority: "medium",
  },
  {
    id: "6",
    timestamp: "2025-01-15 13:30:45",
    user: "Unknown",
    role: "—",
    action: "Login Failed",
    category: "Auth",
    ipAddress: "203.0.113.42",
    status: "FAILED",
    details: "Account locked — exceeded 5 failed login attempts",
    priority: "high",
  },
  {
    id: "7",
    timestamp: "2025-01-15 13:15:20",
    user: "James Cooper",
    role: "Manager",
    action: "Report Exported",
    category: "Data",
    ipAddress: "10.0.0.12",
    status: "SUCCESS",
    details: "Exported Monthly Revenue Report — January 2025 (PDF, 1.2 MB)",
    priority: "low",
  },
  {
    id: "8",
    timestamp: "2025-01-15 12:58:03",
    user: "System",
    role: "Automated",
    action: "SSL Certificate Check",
    category: "System",
    ipAddress: "127.0.0.1",
    status: "WARNING",
    details: "SSL certificate expires in 21 days — renewal recommended",
    priority: "medium",
  },
  {
    id: "9",
    timestamp: "2025-01-15 12:40:18",
    user: "Emily Davis",
    role: "Staff",
    action: "Table Status Updated",
    category: "Operations",
    ipAddress: "192.168.1.78",
    status: "SUCCESS",
    details: "Marked Table 14 as Available — party left at 12:38",
    priority: "low",
  },
  {
    id: "10",
    timestamp: "2025-01-15 12:22:55",
    user: "Sarah Mitchell",
    role: "Admin",
    action: "Security Settings Modified",
    category: "Access",
    ipAddress: "192.168.1.45",
    status: "SUCCESS",
    details: "Updated password rotation interval from 60 to 90 days",
    priority: "medium",
  },
  {
    id: "11",
    timestamp: "2025-01-15 12:05:41",
    user: "Unknown",
    role: "—",
    action: "API Rate Limit Exceeded",
    category: "System",
    ipAddress: "198.51.100.77",
    status: "WARNING",
    details: "Rate limit triggered — 150 requests/min from single IP",
    priority: "medium",
  },
  {
    id: "12",
    timestamp: "2025-01-15 11:48:29",
    user: "James Cooper",
    role: "Manager",
    action: "Inventory Adjusted",
    category: "Operations",
    ipAddress: "10.0.0.12",
    status: "SUCCESS",
    details: "Reduced Wagyu Beef stock by 5 units — waste logged",
    priority: "low",
  },
];

/* ─── Page ────────────────────────────────────────────────── */

export default function SecurityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "SUCCESS" | "WARNING" | "FAILED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [showDetailModal, setShowDetailModal] = useState<LogEntry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const filterTabs: { label: string; value: "ALL" | "SUCCESS" | "WARNING" | "FAILED"; count: number }[] = [
    { label: "All Events", value: "ALL", count: logData.length },
    { label: "Success", value: "SUCCESS", count: logData.filter((l) => l.status === "SUCCESS").length },
    { label: "Warning", value: "WARNING", count: logData.filter((l) => l.status === "WARNING").length },
    { label: "Failed", value: "FAILED", count: logData.filter((l) => l.status === "FAILED").length },
  ];

  const categories = ["All Categories", ...Array.from(new Set(logData.map((l) => l.category)))];

  const filteredLogs = logData.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    const matchesStatus = activeFilter === "ALL" || log.status === activeFilter;
    const matchesCategory = categoryFilter === "All Categories" || log.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredLogs.length / perPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] px-8 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-500">Security Log</span>
          </div>

          {/* ── Page Header ─────────────────────────────── */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">System Audit Logs</h1>
                <p className="mt-1 text-[13px] text-gray-400">
                  Review all administrative actions, authentication events, and security alerts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* ── Filter Tabs + Search ─────────────────────── */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveFilter(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-all ${
                      activeFilter === tab.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        activeFilter === tab.value
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-200/80 text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search + Category filter */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search logs..."
                    className="w-56 rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-[13px] text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-8 text-[12px] font-semibold text-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* ── Table ──────────────────────────────────── */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <div className="flex items-center gap-1">
                        Timestamp
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      User
                    </th>
                    <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                    <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      IP Address
                    </th>
                    <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`group border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80 ${
                        log.status === "FAILED" ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <PriorityDot priority={log.priority} />
                          <div>
                            <p className="text-[12px] font-semibold text-gray-700">{log.timestamp.split(" ")[1]}</p>
                            <p className="text-[10px] text-gray-400">{log.timestamp.split(" ")[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div>
                          <p
                            className={`text-[13px] font-semibold ${
                              log.user === "Unknown" ? "text-red-500" : "text-gray-800"
                            }`}
                          >
                            {log.user}
                          </p>
                          <p className="text-[10px] text-gray-400">{log.role}</p>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[12px] font-semibold text-gray-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-mono text-[12px] text-gray-500">{log.ipAddress}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setShowDetailModal(log)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-500 opacity-0 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 group-hover:opacity-100"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-gray-300" />
                          <p className="text-[13px] font-medium text-gray-400">No log entries found</p>
                          <p className="text-[11px] text-gray-300">Try adjusting your search or filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────── */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-[12px] text-gray-400">
                  Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredLogs.length)}{" "}
                  of {filteredLogs.length} entries
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-semibold transition-all ${
                        currentPage === page
                          ? "bg-orange-500 text-white shadow-sm shadow-orange-200/60"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Bottom Stats ────────────────────────────── */}
          <div className="mt-5 grid grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                  <FileText className="h-4.5 w-4.5 text-orange-500" strokeWidth={2} />
                </div>
                <span className="rounded-lg bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  +24 today
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">12,842</p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray-400">Total Events</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                <Fingerprint className="h-4.5 w-4.5 text-red-500" strokeWidth={2} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">12</p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray-400">Authentication Failures</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" strokeWidth={2} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">0</p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray-400">High Priority Alerts</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <CalendarDays className="h-4.5 w-4.5 text-blue-500" strokeWidth={2} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">90 Days</p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray-400">Log Retention Period</p>
            </div>
          </div>

          <div className="h-10" />
        </div>
      </main>

      {/* ── Detail Modal ────────────────────────────────── */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDetailModal(null)}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    showDetailModal.status === "SUCCESS"
                      ? "bg-green-50"
                      : showDetailModal.status === "WARNING"
                      ? "bg-amber-50"
                      : "bg-red-50"
                  }`}
                >
                  {showDetailModal.status === "SUCCESS" ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500" strokeWidth={2} />
                  ) : showDetailModal.status === "WARNING" ? (
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" strokeWidth={2} />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-red-500" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">{showDetailModal.action}</h3>
                  <p className="text-[11px] text-gray-400">Event Detail</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Timestamp</span>
                  <span className="text-[13px] font-semibold text-gray-800">{showDetailModal.timestamp}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                  <StatusBadge status={showDetailModal.status} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">User</span>
                  <span className="text-[13px] font-semibold text-gray-800">{showDetailModal.user}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Role</span>
                  <span className="text-[13px] font-semibold text-gray-800">{showDetailModal.role}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</span>
                  <span className="text-[13px] font-semibold text-gray-800">{showDetailModal.category}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">IP Address</span>
                  <span className="font-mono text-[13px] font-semibold text-gray-800">{showDetailModal.ipAddress}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Priority</span>
                  <div className="flex items-center gap-1.5">
                    <PriorityDot priority={showDetailModal.priority} />
                    <span className="text-[13px] font-semibold capitalize text-gray-800">
                      {showDetailModal.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-1.5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Details</span>
                <p className="text-[13px] leading-relaxed text-gray-700">{showDetailModal.details}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm shadow-orange-200/60 transition hover:bg-orange-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Full Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}