"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Users,
  Layers3,
  Settings,
  Download,
  CircleHelp,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Globe,
  ShieldCheck,
  Store,
  CreditCard,
  Bell,
  Server,
  KeyRound,
  Wallet,
  Calendar,
  FileType,
  BookOpen,
  MessageCircle,
  Activity,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";

type ChildMenu = {
  name: string;
  icon: React.ElementType;
  href: string;
};

type ChildGroup = {
  label: string;
  items: ChildMenu[];
};

type MenuItem =
  | {
      name: string;
      icon: React.ElementType;
      href: string;
      groups?: never;
    }
  | {
      name: string;
      icon: React.ElementType;
      groups: ChildGroup[];
      href?: never;
    };

const menus: MenuItem[] = [
  { name: "Dashboard", icon: BarChart3, href: "/superdashboard" },
  { name: "Businesses", icon: Building2, href: "/business" },
  { name: "All Orders", icon: ClipboardList, href: "/order" },
  { name: "Platform Users", icon: Users, href: "/users" },
  { name: "System Logs", icon: Layers3, href: "/system_logs" },
  {
    name: "Global Settings",
    icon: Settings,
    groups: [
      {
        label: "Configuration",
        items: [
          { name: "Platform", icon: Globe, href: "/settings/platform" },
          { name: "Business Rules", icon: Store, href: "/settings/business" },
          { name: "Payment", icon: Wallet, href: "/settings/payment" },
          { name: "Subscription", icon: CreditCard, href: "/settings/subscription" },
        ],
      },
      {
        label: "Access & Operations",
        items: [
          { name: "Security", icon: ShieldCheck, href: "/settings/security" },
          { name: "Roles & Permissions", icon: KeyRound, href: "/settings/roles" },
          { name: "Notifications", icon: Bell, href: "/settings/notifications" },
          { name: "System", icon: Server, href: "/settings/system" },
        ],
      },
    ],
  },
];

function hasGroups(item: MenuItem): item is Extract<MenuItem, { groups: ChildGroup[] }> {
  return "groups" in item;
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-expand "Global Settings" if the user is currently on one of its child routes.
  const settingsItem = menus.find(hasGroups);
  const startsOpen =
    !!settingsItem &&
    settingsItem.groups.some((group) => group.items.some((child) => pathname === child.href));

  const [settingsOpen, setSettingsOpen] = useState(startsOpen);

  // Export Reports modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [reportType, setReportType] = useState("Revenue Report");
  const [dateRange, setDateRange] = useState("This Month");
  const [format, setFormat] = useState("PDF");
  const [scheduleReport, setScheduleReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // Support dropdown
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);

  function runExport() {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
      setTimeout(() => {
        setExportDone(false);
        setExportModalOpen(false);
      }, 1200);
    }, 1400);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
        <h1 className="text-xl font-bold">Bistro Central</h1>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col justify-between
          overflow-y-auto border-r border-orange-100 bg-white px-5 py-8 sm:px-6
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:w-64 lg:translate-x-0
        `}
      >
        <div>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h2 className="text-xl font-bold">Menu</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
              <X />
            </button>
          </div>

          <div className="mt-2 lg:mt-5">
            <h1 className="text-2xl font-bold sm:text-3xl">Bistro Central</h1>
            <p className="text-sm text-gray-500">Super Admin Console</p>
          </div>

          <nav className="mt-8 space-y-1.5 lg:mt-10">
            {menus.map((item) => {
              const Icon = item.icon;

              if (hasGroups(item)) {
                const isChildActive = item.groups.some((group) =>
                  group.items.some((child) => pathname === child.href)
                );

                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      aria-expanded={settingsOpen}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
                        isChildActive
                          ? "bg-[#F97316] text-white"
                          : "text-gray-700 hover:bg-[#F97316]/10 hover:text-[#F97316]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="text-xs uppercase tracking-[0.18em]">{item.name}</span>
                      </div>

                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-300 ease-in-out ${
                          settingsOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Animated collapse: grid-rows trick lets us transition to/from "auto" height */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        settingsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-6 mt-2 space-y-3 border-l border-orange-100 pl-4">
                          {item.groups.map((group) => (
                            <div key={group.label}>
                              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                {group.label}
                              </p>
                              <div className="space-y-1">
                                {group.items.map((child) => {
                                  const ChildIcon = child.icon;
                                  const active = pathname === child.href;

                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      onClick={() => setOpen(false)}
                                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                                        active
                                          ? "bg-orange-500 text-white"
                                          : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                                      }`}
                                    >
                                      <ChildIcon size={16} />
                                      <span className="text-xs">{child.name}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
                    active
                      ? "bg-[#F97316] text-white"
                      : "text-gray-700 hover:bg-[#F97316]/10 hover:text-[#F97316]"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-xs uppercase tracking-[0.18em]">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pb-4">
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] py-3 text-sm text-white transition hover:bg-[#e06610]"
          >
            <Download size={16} />
            Reports
          </button>

          <div className="mt-8 space-y-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSupportMenuOpen((v) => !v)}
                className="flex items-center gap-3 text-gray-600 hover:text-[#F97316]"
              >
                <CircleHelp size={17} />
                <span className="text-xs uppercase tracking-[0.18em]">Support</span>
              </button>

              {supportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSupportMenuOpen(false)}
                  />
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    <SupportMenuItem icon={BookOpen} label="Documentation" />
                    <SupportMenuItem icon={MessageCircle} label="Contact Engineering" />
                    <SupportMenuItem icon={Activity} label="System Status" />
                    <SupportMenuItem icon={Sparkles} label="What's New" />
                  </div>
                </>
              )}
            </div>

            <button className="flex items-center gap-3 text-red-500 hover:text-red-600">
              <LogOut size={17} />
              <span className="text-xs uppercase tracking-[0.18em]">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Export Reports modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            {exportDone ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Check size={20} className="text-emerald-600" />
                </span>
                <p className="text-sm font-medium text-slate-800">Report ready</p>
                <p className="mt-1 text-xs text-slate-500">Your download will start automatically.</p>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Reports</h3>

                <div className="space-y-4">
                  <ExportField label="Report Type" icon={FileType}>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="export-input"
                    >
                      <option>Revenue Report</option>
                      <option>Business Performance Report</option>
                      <option>Order Summary Report</option>
                      <option>User Growth Report</option>
                      <option>Commission & Payout Report</option>
                      <option>Refund & Cancellation Report</option>
                    </select>
                  </ExportField>

                  <ExportField label="Date Range" icon={Calendar}>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="export-input"
                    >
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>Last 90 Days</option>
                      <option>Custom Range</option>
                    </select>
                  </ExportField>

                  <ExportField label="Format">
                    <div className="flex gap-2">
                      {["PDF", "CSV", "Excel"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFormat(f)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            format === f
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </ExportField>

                  <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
                    <span className="text-xs font-medium text-slate-600">
                      Schedule this report (email monthly)
                    </span>
                    <button
                      type="button"
                      onClick={() => setScheduleReport((v) => !v)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                        scheduleReport ? "bg-orange-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          scheduleReport ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setExportModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-70"
                  >
                    {isExporting && <Loader2 size={14} className="animate-spin" />}
                    {isExporting ? "Exporting..." : "Export"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .export-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          color: #334155;
          background: white;
        }
        .export-input:focus {
          outline: none;
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
        }
      `}</style>
    </>
  );
}

function SupportMenuItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-600"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function ExportField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        {Icon && <Icon size={13} className="text-slate-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}
