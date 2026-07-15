"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  Bell,
  Store,
  ShieldCheck,
  Plug,
  Mail,
  MessageSquare,
  Smartphone,
  Moon,
  ChevronRight,
  MapPin,
  Phone,
  Lock,
  LogIn,
  Laptop,
  Trash2,
  CreditCard,
  Truck,
  FileSpreadsheet,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

/* ─── Reusable Toggle ─────────────────────────────────────── */

function Toggle({
  enabled,
  onToggle,
  size = "md",
}: {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const translate = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex ${dims} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block ${knob} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? translate : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Input field ─────────────────────────────────────────── */

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-800 shadow-sm transition-all duration-150 placeholder:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

/* ─── Shared section card ────────────────────────────────── */

function SettingRow({
  icon: Icon,
  label,
  desc,
  enabled,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <Icon className="h-4 w-4 text-gray-500" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">{label}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{desc}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

/* ─── Data: Notifications tab ────────────────────────────── */

type Channel = "email" | "sms" | "push";

type AlertRow = {
  key: string;
  label: string;
  desc: string;
  highlight?: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
};

const initialAlerts: AlertRow[] = [
  {
    key: "newOrder",
    label: "New Order Alerts",
    desc: "Instant triggers when a customer places a new order.",
    highlight: true,
    email: true,
    sms: true,
    push: true,
  },
  {
    key: "marketing",
    label: "Marketing Updates",
    desc: "Campaign results, promotional tips, and seasonal trends.",
    email: true,
    sms: false,
    push: false,
  },
  {
    key: "staffPerf",
    label: "Staff Performance Reports",
    desc: "Weekly summaries of order speed, ratings, and attendance.",
    email: true,
    sms: false,
    push: true,
  },
  {
    key: "sysMaintenance",
    label: "System Maintenance",
    desc: "Critical notifications regarding platform uptime and updates.",
    email: true,
    sms: true,
    push: true,
  },
];

const channelMeta: { key: Channel; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "push", label: "Push", icon: Smartphone },
];

/* ─── Notifications panel ────────────────────────────────── */

function NotificationsPanel() {
  const [alerts, setAlerts] = useState<AlertRow[]>(initialAlerts);
  const [notifEmail, setNotifEmail] = useState("admin@gourmetflow.com");
  const [smsPhone, setSmsPhone] = useState("+1 (555) 012-3456");
  const [nightMode, setNightMode] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  const toggleChannel = (rowKey: string, channel: Channel) => {
    setAlerts((prev) =>
      prev.map((row) => (row.key === rowKey ? { ...row, [channel]: !row[channel] } : row))
    );
  };

  const enabledCount = (channel: Channel) => alerts.filter((row) => row[channel]).length;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="grid grid-cols-[1fr_repeat(3,64px)] items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-6 py-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Alert Type
          </span>
          {channelMeta.map((c) => (
            <div key={c.key} className="flex flex-col items-center gap-1">
              <c.icon className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {alerts.map((row) => (
          <div
            key={row.key}
            className={`grid grid-cols-[1fr_repeat(3,64px)] items-center gap-2 border-b border-gray-50 px-6 py-4 last:border-0 ${
              row.highlight ? "bg-orange-50/50" : ""
            }`}
          >
            <div className="pr-4">
              <p className="text-[13px] font-semibold text-gray-800">{row.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{row.desc}</p>
            </div>
            {channelMeta.map((c) => (
              <div key={c.key} className="flex justify-center">
                <Toggle enabled={row[c.key]} onToggle={() => toggleChannel(row.key, c.key)} />
              </div>
            ))}
          </div>
        ))}

        <div className="flex items-center justify-end gap-5 border-t border-gray-100 bg-gray-50/60 px-6 py-2.5">
          {channelMeta.map((c) => (
            <span key={c.key} className="w-16 text-center text-[10px] font-semibold text-gray-400">
              {enabledCount(c.key)}/{alerts.length} on
            </span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-[14px] font-bold text-gray-900">Contact Endpoints</h2>
          <p className="mt-1 text-[12px] text-gray-400">Where email and SMS alerts are delivered</p>
          <div className="mt-5 flex flex-col gap-4">
            <InputField
              label="Notification Email"
              value={notifEmail}
              onChange={setNotifEmail}
              placeholder="admin@example.com"
              type="email"
            />
            <InputField
              label="SMS Phone Number"
              value={smsPhone}
              onChange={setSmsPhone}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <Moon className="h-4 w-4 text-gray-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-gray-900">Quiet Hours</h2>
                <p className="mt-1 max-w-[220px] text-[12px] leading-relaxed text-gray-400">
                  Mute non-critical notifications during specific times to prevent staff fatigue.
                </p>
              </div>
            </div>
            <Toggle enabled={nightMode} onToggle={() => setNightMode(!nightMode)} />
          </div>

          <div
            className={`mt-5 grid grid-cols-2 gap-3 overflow-hidden transition-all duration-200 ${
              nightMode ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <InputField label="Starts" value={quietStart} onChange={setQuietStart} type="time" />
            <InputField label="Ends" value={quietEnd} onChange={setQuietEnd} type="time" />
          </div>
        </section>
      </div>
    </>
  );
}

/* ─── Store Info panel ───────────────────────────────────── */

function StoreInfoPanel() {
  const [storeName, setStoreName] = useState("GourmetFlow Kitchen");
  const [address, setAddress] = useState("48 Main Street, Butwal, Lumbini Province");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [temporarilyClosed, setTemporarilyClosed] = useState(false);
  const [closureReason, setClosureReason] = useState("");

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-[14px] font-bold text-gray-900">Store Information</h2>
      <p className="mt-1 text-[12px] text-gray-400">
        Basic details customers and staff see across the platform
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <InputField
          label="Store Name"
          value={storeName}
          onChange={setStoreName}
          placeholder="Enter store name"
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Business Address"
            value={address}
            onChange={setAddress}
            placeholder="Street, city, region"
          />
          <InputField
            label="Contact Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+1 (555) 000-0000"
            type="tel"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <MapPin className="h-4 w-4 text-gray-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">Temporarily Closed</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
              Hide the store from ordering apps until you reopen
            </p>
          </div>
        </div>
        <Toggle enabled={temporarilyClosed} onToggle={() => setTemporarilyClosed(!temporarilyClosed)} />
      </div>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          temporarilyClosed ? "mt-4 max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <InputField
          label="Closure Reason (shown to customers)"
          value={closureReason}
          onChange={setClosureReason}
          placeholder="e.g. Closed for renovations, back Monday"
        />
      </div>

      <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-gray-400">
        <Phone className="h-3.5 w-3.5" />
        Contact details also appear on customer receipts and the storefront footer.
      </div>
    </section>
  );
}

/* ─── Security panel ──────────────────────────────────────── */

type SessionItem = { device: string; location: string; lastActive: string };

const initialSessions: SessionItem[] = [
  { device: "MacBook Pro — Chrome", location: "Butwal, NP", lastActive: "Active now" },
  { device: "iPhone 15 — GourmetFlow App", location: "Butwal, NP", lastActive: "2 hours ago" },
  { device: "Front Desk POS — Edge", location: "Store Terminal", lastActive: "Yesterday" },
];

function SecurityPanel() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [sessions, setSessions] = useState(initialSessions);

  const revokeSession = (device: string) => {
    setSessions((prev) => prev.filter((s) => s.device !== device));
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-[14px] font-bold text-gray-900">Access &amp; Authentication</h2>
        <p className="mt-1 text-[12px] text-gray-400">
          Protect staff accounts and the admin dashboard
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <SettingRow
            icon={Lock}
            label="Require Two-Factor Authentication"
            desc="Staff must verify with a code in addition to their password."
            enabled={twoFactor}
            onToggle={() => setTwoFactor(!twoFactor)}
          />
          <SettingRow
            icon={LogIn}
            label="Alert on New Device Login"
            desc="Notify the owner whenever the account signs in from an unrecognized device."
            enabled={loginAlerts}
            onToggle={() => setLoginAlerts(!loginAlerts)}
          />
          <SettingRow
            icon={Smartphone}
            label="Auto-Lock POS After Inactivity"
            desc="Lock the terminal screen after 5 minutes of no activity."
            enabled={autoLock}
            onToggle={() => setAutoLock(!autoLock)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-[14px] font-bold text-gray-900">Active Sessions</h2>
        <p className="mt-1 text-[12px] text-gray-400">
          Devices currently signed in to this account
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {sessions.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-[12px] text-gray-400">
              No other active sessions
            </p>
          )}
          {sessions.map((s) => (
            <div
              key={s.device}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <Laptop className="h-4 w-4 text-gray-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{s.device}</p>
                  <p className="text-[11px] text-gray-400">
                    {s.location} · {s.lastActive}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => revokeSession(s.device)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-red-500 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Revoke
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Integrations panel ─────────────────────────────────── */

type Integration = {
  key: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  connected: boolean;
};

const initialIntegrations: Integration[] = [
  {
    key: "stripe",
    name: "Stripe Payments",
    desc: "Process card payments and manage payouts.",
    icon: CreditCard,
    connected: true,
  },
  {
    key: "ubereats",
    name: "Uber Eats",
    desc: "Sync menu and receive delivery orders.",
    icon: Truck,
    connected: true,
  },
  {
    key: "doordash",
    name: "DoorDash",
    desc: "Sync menu and receive delivery orders.",
    icon: Truck,
    connected: false,
  },
  {
    key: "quickbooks",
    name: "QuickBooks",
    desc: "Export daily sales and tax reports automatically.",
    icon: FileSpreadsheet,
    connected: false,
  },
  {
    key: "slack",
    name: "Slack Alerts",
    desc: "Post order and system alerts to a Slack channel.",
    icon: MessageCircle,
    connected: true,
  },
];

function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const toggleIntegration = (key: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.key === key ? { ...i, connected: !i.connected } : i))
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-[14px] font-bold text-gray-900">Connected Apps</h2>
      <p className="mt-1 text-[12px] text-gray-400">
        Link third-party services to extend what GourmetFlow can do
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {integrations.map((i) => (
          <div
            key={i.key}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <i.icon className="h-4 w-4 text-gray-500" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-gray-800">{i.name}</p>
                  {i.connected && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-gray-400">{i.desc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleIntegration(i.key)}
              className={`rounded-lg px-3.5 py-2 text-[12px] font-semibold transition ${
                i.connected
                  ? "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  : "bg-orange-500 text-white shadow-sm shadow-orange-200/60 hover:bg-orange-600"
              }`}
            >
              {i.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Category nav data ──────────────────────────────────── */

const categories = [
  { label: "Store Info", icon: Store },
  { label: "Security", icon: ShieldCheck },
  { label: "Notifications", icon: Bell },
  { label: "Integrations", icon: Plug },
];

const categoryCopy: Record<string, { title: string; desc: string; icon: React.ElementType }> = {
  "Store Info": {
    title: "Store Information",
    desc: "Keep your restaurant's public details accurate across ordering apps and receipts.",
    icon: Store,
  },
  Security: {
    title: "Security Settings",
    desc: "Control how staff sign in and keep the admin dashboard protected.",
    icon: ShieldCheck,
  },
  Notifications: {
    title: "Notification Settings",
    desc: "Configure how and when your team receives updates. High-priority alerts ensure real-time responsiveness for your kitchen and staff.",
    icon: Bell,
  },
  Integrations: {
    title: "Integrations",
    desc: "Connect payment processors, delivery platforms, and other tools you rely on.",
    icon: Plug,
  },
};

/* ─── Page ────────────────────────────────────────────────── */

export default function NotificationSettingsPage() {
  const [activeCategory, setActiveCategory] = useState("Notifications");
  const copy = categoryCopy[activeCategory];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1080px] px-8 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span>System</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-500">{activeCategory}</span>
          </div>

          {/* ── Page Header ─────────────────────────────── */}
          <div className="mb-8 flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
              <copy.icon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{copy.title}</h1>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-gray-400">
                {copy.desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] gap-5">
            {/* ── Category nav ───────────────────────────── */}
            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3">
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                System Category
              </p>
              <nav className="flex flex-col gap-0.5">
                {categories.map((cat) => {
                  const isActive = cat.label === activeCategory;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setActiveCategory(cat.label)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                        isActive
                          ? "bg-orange-500 text-white shadow-sm shadow-orange-200/60"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <cat.icon className="h-4 w-4 shrink-0" />
                      {cat.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* ── Content (swaps per category, no navigation) ── */}
            <div className="flex flex-col gap-5">
              {activeCategory === "Store Info" && <StoreInfoPanel />}
              {activeCategory === "Security" && <SecurityPanel />}
              {activeCategory === "Notifications" && <NotificationsPanel />}
              {activeCategory === "Integrations" && <IntegrationsPanel />}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pb-10 pt-1">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-all duration-150 hover:border-gray-300 hover:bg-gray-50"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-orange-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition-all duration-150 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-200/60"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}