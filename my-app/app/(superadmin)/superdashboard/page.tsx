"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bell, Search, DollarSign, Building2, Clock3, ShieldCheck,
  Eye, Check, X as XIcon, Filter, Calendar, ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";
import {
  getDashboardStats,
  getRegistrationQueue,
  getQueueTypeOptions,
  approveBusinessAction,
  rejectBusinessAction,
  getBusinessTypeBreakdown,
  getBusinessPerformance,
  type DashboardStats,
  type QueueBusiness,
  type TypeBreakdown,
  type BusinessPerformance,
} from "@/app/actions/superadmin/superadmin-dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queue, setQueue] = useState<QueueBusiness[]>([]);
  const [queueTypes, setQueueTypes] = useState<string[]>([]);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([]);
  const [performance, setPerformance] = useState<BusinessPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [viewItem, setViewItem] = useState<QueueBusiness | null>(null);

  const approveLockRef = useRef<Set<number>>(new Set());
  const rejectLockRef = useRef<Set<number>>(new Set());

  async function loadAll() {
    setLoading(true);
    const [statsData, queueData, typeOptions, typeData, perfData] = await Promise.all([
      getDashboardStats(),
      getRegistrationQueue(),
      getQueueTypeOptions(),
      getBusinessTypeBreakdown(),
      getBusinessPerformance(),
    ]);
    setStats(statsData);
    setQueue(queueData);
    setQueueTypes(typeOptions);
    setTypeBreakdown(typeData);
    setPerformance(perfData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Search + type filter → refetch the queue (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      const data = await getRegistrationQueue({ search: search || undefined, type: typeFilter || undefined });
      setQueue(data);
    }, 350);
    return () => clearTimeout(t);
  }, [search, typeFilter]);

  async function handleApprove(id: number) {
    if (approveLockRef.current.has(id)) return;
    approveLockRef.current.add(id);

    const previous = queue;
    setQueue((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await approveBusinessAction(id);
      if (!res.success) {
        setQueue(previous);
        alert(res.message);
      } else {
        setStats(await getDashboardStats());
      }
    } finally {
      approveLockRef.current.delete(id);
    }
  }

  async function handleReject(id: number) {
    if (rejectLockRef.current.has(id)) return;
    if (!confirm("Reject and remove this business registration? This cannot be undone.")) return;
    rejectLockRef.current.add(id);

    const previous = queue;
    setQueue((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await rejectBusinessAction(id);
      if (!res.success) {
        setQueue(previous);
        alert(res.message);
      } else {
        setStats(await getDashboardStats());
      }
    } finally {
      rejectLockRef.current.delete(id);
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        <span className="mt-2 text-sm font-medium text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 sm:p-6 sm:space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 border-b bg-white px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <h1 className="text-xl font-bold text-orange-700 sm:text-3xl">Platform-wide Analytics</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex w-full items-center gap-2 rounded-full border px-4 py-2 sm:w-72">
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="w-full outline-none"
            />
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-start">
            <button className="relative shrink-0">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center gap-3">
              <Image src="/man.png" width={42} height={42} alt="Admin" className="rounded-full" style={{ width: "42px", height: "42px" }} />
              <div className="hidden sm:block">
                <h3 className="font-semibold">Sima Malla</h3>
                <p className="text-xs text-blue-600">SUPER ADMIN</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="TOTAL PLATFORM REV" value={stats.totalRevenue} footer={stats.totalRevenueChange} icon={DollarSign} />
        <StatsCard title="ACTIVE BUSINESSES" value={stats.activeBusinesses.toString()} subtitle={stats.activeBusinessesSubtitle} icon={Building2} />
        <StatsCard title="PENDING APPROVALS" value={stats.pendingApprovals.toString()} footer="Review Queue" icon={Clock3} highlight />
        <StatsCard title="SYSTEM HEALTH" value={stats.systemHealth} subtitle="Uptime (Last 30d)" icon={ShieldCheck} />
      </div>

      {/* ── Queue + Type Breakdown ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-9">
          <div className="overflow-hidden rounded-2xl border border-[#E8C7B4] bg-white">
            <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <h2 className="text-lg font-semibold sm:text-2xl">Business Registration Queue</h2>
              <div className="flex items-center gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 rounded-lg border border-[#E8C7B4] px-2 text-xs outline-none focus:border-[#B54A00] sm:text-sm"
                >
                  <option value="">All Types</option>
                  {queueTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-xs font-semibold tracking-[0.2em] text-gray-400">{queue.length} PENDING</span>
              </div>
            </div>

            <div className="hidden bg-[#F6F4F2] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:grid sm:grid-cols-5">
              <p>Business Name</p>
              <p>Type</p>
              <p>Location</p>
              <p>Status</p>
              <p className="text-center">Actions</p>
            </div>

            {queue.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">No businesses pending approval.</p>
            ) : (
              queue.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-3 border-t border-[#F2DDD2] px-4 py-4 sm:grid-cols-5 sm:items-center sm:gap-0 sm:px-6 sm:py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-200 text-xs font-semibold">
                      {item.initials}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">ID: {item.regId}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 sm:text-inherit">
                    <span className="font-medium sm:hidden">Type: </span>{item.type}
                  </p>
                  <p className="text-sm text-gray-600 sm:text-inherit">
                    <span className="font-medium sm:hidden">Location: </span>{item.location}
                  </p>

                  <div>
                    <span className="rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex gap-2 sm:justify-center">
                    <button
                      onClick={() => setViewItem(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E8C7B4] transition hover:bg-gray-100"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F97316] text-white transition hover:bg-[#e06610]"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                      title="Reject"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="h-full rounded-2xl border border-[#E8C7B4] bg-white p-5 sm:p-6">
            <h2 className="mb-5 text-xl font-semibold sm:text-2xl">Business Types</h2>
            <div className="space-y-4">
              {typeBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400">No businesses yet.</p>
              ) : (
                typeBreakdown.map((t, i) => (
                  <div key={t.type} className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${["bg-[#B54A00]", "bg-[#0A5C8D]", "bg-gray-500", "bg-emerald-500", "bg-purple-500"][i % 5]}`} />
                      <span className="text-sm sm:text-base">{t.type}</span>
                    </div>
                    <span className="font-mono text-sm">{t.count} biz</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Business Performance ── */}
      <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-orange-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Business Performance</h2>
            <p className="mt-1 text-sm text-gray-500">Revenue and order metrics by business, this month.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-orange-200 px-4 py-2 text-sm hover:bg-orange-50 transition">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-orange-200 px-4 py-2 text-sm hover:bg-orange-50 transition">
              <Calendar size={16} /> This Month
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left">Business Name</th>
                <th className="py-4 text-left">Locations</th>
                <th className="py-4 text-left">Revenue (MTD)</th>
                <th className="py-4 text-left">Active Orders</th>
                <th className="py-4 text-left">Growth</th>
                <th className="py-4 text-left">System State</th>
              </tr>
            </thead>
            <tbody>
              {performance.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No businesses yet.</td></tr>
              ) : performance.map((item) => (
                <tr key={item.id} className="border-t border-orange-100 transition hover:bg-orange-50">
                  <td className="px-6 py-5 font-medium text-gray-800">{item.name}</td>
                  <td>{item.locationCount}</td>
                  <td>{item.revenueMTD}</td>
                  <td>{item.activeOrders}</td>
                  <td>
                    <div className={`flex items-center gap-1 font-semibold ${item.positive ? "text-green-600" : "text-red-600"}`}>
                      {item.positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                      {item.growth}
                    </div>
                  </td>
                  <td>
                    {item.status === "STABLE" ? (
                      <span className="rounded-md border border-green-500 px-3 py-1 text-xs font-semibold text-green-600">STABLE</span>
                    ) : (
                      <span className="rounded-md border border-orange-500 px-3 py-1 text-xs font-semibold text-orange-600">ACTION REQ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">{viewItem.name}</h2>
              <button onClick={() => setViewItem(null)}><XIcon size={22} /></button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-lg font-semibold">
                  {viewItem.initials}
                </div>
                <div>
                  <p className="font-semibold">{viewItem.regId}</p>
                  <p className="text-sm text-gray-500">Registered {viewItem.registeredAt}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="font-medium">Owner:</span> {viewItem.ownerName}</p>
                <p><span className="font-medium">Type:</span> {viewItem.type}</p>
                <p><span className="font-medium">Email:</span> {viewItem.email}</p>
                <p><span className="font-medium">Phone:</span> {viewItem.phone}</p>
                <p className="sm:col-span-2"><span className="font-medium">Location:</span> {viewItem.location}</p>
                <p className="sm:col-span-2"><span className="font-medium">Status:</span> {viewItem.status}</p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
              <button onClick={() => setViewItem(null)} className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100 transition">Close</button>
              <button
                onClick={() => {
                  handleReject(viewItem.id);
                  setViewItem(null);
                }}
                className="rounded-xl border border-red-200 px-5 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleApprove(viewItem.id);
                  setViewItem(null);
                }}
                className="rounded-xl bg-[#F97316] px-5 py-2 text-sm text-white hover:bg-[#e06610] transition"
              >
                Approve Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  footer,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  footer?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border shadow-sm transition-all duration-200 ${highlight ? "bg-[#F97316] border-[#F97316] text-white" : "bg-white border-[#E8C7B4]"}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <h4 className={`text-[10px] font-medium uppercase leading-4 tracking-[0.22em] ${highlight ? "text-white/90" : "text-[#6B5B53]"}`}>
            {title}
          </h4>
          <Icon size={18} className={highlight ? "text-white" : "text-[#B54A00]"} />
        </div>
        <h2 className={`mt-3 text-2xl font-bold leading-none sm:text-[36px] ${highlight ? "text-white" : "text-[#222]"}`}>
          {value}
        </h2>
        {subtitle && <p className={`mt-2 text-sm ${highlight ? "text-white/90" : "text-gray-500"}`}>{subtitle}</p>}
        {footer && (
          <div className={`mt-4 flex items-center gap-1 text-sm ${highlight ? "text-white underline" : "text-[#B54A00]"}`}>
            {footer}
            <ArrowUpRight size={15} />
          </div>
        )}
      </div>
    </div>
  );
}
