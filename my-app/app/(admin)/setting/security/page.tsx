"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  Mail,
  KeyRound,
  MapPin,
  Laptop,
  Trash2,
  Plus,
  X,
  Check,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";

/* ─── Reusable Toggle ─────────────────────────────────────── */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Section header ──────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  desc,
  action,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">{title}</h2>
          {desc && <p className="mt-0.5 text-[12px] text-gray-400">{desc}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── Data ────────────────────────────────────────────────── */

type Requirement = { id: string; label: string; enabled: boolean };

const initialRequirements: Requirement[] = [
  { id: "special", label: "Require Special Characters (!@#$%)", enabled: true },
  { id: "numeric", label: "Require Numeric Values (0-9)", enabled: true },
  { id: "reuse", label: "Prohibit Common Word Reuse", enabled: true },
];

type IpEntry = { id: string; name: string; ip: string; status: "Active" | "Inactive" };

const initialIps: IpEntry[] = [
  { id: "1", name: "Corporate HQ · Manhattan", ip: "192.168.1.45", status: "Active" },
  { id: "2", name: "Back Office · Soho", ip: "104.22.184.21", status: "Active" },
];

type SessionEntry = {
  id: string;
  device: string;
  os: string;
  location: string;
  lastActive: string;
  current?: boolean;
};

const initialSessions: SessionEntry[] = [
  { id: "1", device: "MacBook Pro 14\" · Chrome", os: "macOS Ventura", location: "New York, USA", lastActive: "Current Session", current: true },
  { id: "2", device: "iPhone 14 Pro · Mobile App", os: "iOS 16.4", location: "Jersey City, USA", lastActive: "2 hours ago" },
  { id: "3", device: "iPad Air · Safari", os: "iPadOS 16.1", location: "New York, USA", lastActive: "Yesterday, 4:15 PM" },
];

function generateBackupCodes() {
  return Array.from({ length: 8 }, () =>
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function security() {
  // Password policy
  const [minLength, setMinLength] = useState("12 Characters");
  const [rotationInterval, setRotationInterval] = useState("Every 90 Days");
  const [requirements, setRequirements] = useState(initialRequirements);

  // MFA
  const [authenticatorEnabled, setAuthenticatorEnabled] = useState(true);
  const [emailOtpEnabled, setEmailOtpEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // IP whitelisting
  const [ips, setIps] = useState(initialIps);
  const [showAddIp, setShowAddIp] = useState(false);
  const [newIpName, setNewIpName] = useState("");
  const [newIpAddress, setNewIpAddress] = useState("");

  // Sessions
  const [sessions, setSessions] = useState(initialSessions);
  const [inactivityTimeout, setInactivityTimeout] = useState("30 Minutes");

  // Save feedback
  const [savedFlash, setSavedFlash] = useState(false);

  const toggleRequirement = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const revealBackupCodes = () => {
    if (!showBackupCodes) setBackupCodes(generateBackupCodes());
    setShowBackupCodes((v) => !v);
  };

  const addIp = () => {
    if (!newIpName.trim() || !newIpAddress.trim()) return;
    setIps((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newIpName.trim(), ip: newIpAddress.trim(), status: "Active" },
    ]);
    setNewIpName("");
    setNewIpAddress("");
    setShowAddIp(false);
  };

  const removeIp = (id: string) => setIps((prev) => prev.filter((i) => i.id !== id));

  const revokeSession = (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id));
  const revokeAllOthers = () => setSessions((prev) => prev.filter((s) => s.current));

  const resetChanges = () => {
    setMinLength("12 Characters");
    setRotationInterval("Every 90 Days");
    setRequirements(initialRequirements);
    setAuthenticatorEnabled(true);
    setEmailOtpEnabled(false);
    setShowBackupCodes(false);
    setIps(initialIps);
    setSessions(initialSessions);
    setInactivityTimeout("30 Minutes");
  };

  const saveSettings = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1080px] px-8 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-500">Security &amp; Access</span>
          </div>

          {/* ── Page Header ─────────────────────────────── */}
          <div className="mb-8 flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Security &amp; Access</h1>
              <p className="mt-1 text-[13px] text-gray-400">
                Manage authentication, network access, and session controls.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_360px] gap-5">
            {/* ── Password Policy ─────────────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <SectionHeader
                icon={Lock}
                iconBg="bg-orange-500"
                iconColor="text-white"
                title="Password Policy"
              />

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Minimum Length
                  </label>
                  <select
                    value={minLength}
                    onChange={(e) => setMinLength(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {["8 Characters", "10 Characters", "12 Characters", "14 Characters", "16 Characters"].map(
                      (v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Rotation Interval
                  </label>
                  <select
                    value={rotationInterval}
                    onChange={(e) => setRotationInterval(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {["Every 30 Days", "Every 60 Days", "Every 90 Days", "Every 180 Days", "Never"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Strength Requirements
              </p>
              <div className="flex flex-col gap-2">
                {requirements.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRequirement(r.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      r.enabled
                        ? "border-orange-100 bg-orange-50/60"
                        : "border-gray-100 bg-gray-50/60"
                    }`}
                  >
                    <span className="text-[13px] font-medium text-gray-700">{r.label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md ${
                        r.enabled ? "bg-orange-500" : "border border-gray-300 bg-white"
                      }`}
                    >
                      {r.enabled && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── MFA ───────────────────────────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 px-4 py-3.5">
                <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Enforced
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white">AUTHENTICATOR</p>
                    <p className="text-[10px] font-semibold text-blue-100">Multi-Factor (MFA)</p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[12px] leading-relaxed text-gray-400">
                Adding a layer of security by requiring a second verification step for all
                administrative accounts.
              </p>

              <div className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800">Authenticator App</p>
                      <p className="text-[10px] text-gray-400">Google/Microsoft Auth</p>
                    </div>
                  </div>
                  <Toggle
                    enabled={authenticatorEnabled}
                    onToggle={() => setAuthenticatorEnabled(!authenticatorEnabled)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[12px] font-semibold text-gray-500">Email OTP</p>
                      <p className="text-[10px] text-gray-400">Backup verification</p>
                    </div>
                  </div>
                  <Toggle enabled={emailOtpEnabled} onToggle={() => setEmailOtpEnabled(!emailOtpEnabled)} />
                </div>
              </div>

              <button
                type="button"
                onClick={revealBackupCodes}
                className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-orange-500 hover:underline"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {showBackupCodes ? "Hide Backup Codes" : "Configure Backup Codes"}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {showBackupCodes && (
                <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  {backupCodes.map((code) => (
                    <span
                      key={code}
                      className="rounded-lg bg-white px-2 py-1.5 text-center font-mono text-[11px] text-gray-600 shadow-sm"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── IP Whitelisting ─────────────────────────── */}
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6">
            <SectionHeader
              icon={MapPin}
              iconBg="bg-gray-800"
              iconColor="text-white"
              title="IP Whitelisting"
              desc="Limit administrative access to specific office locations."
              action={
                <button
                  type="button"
                  onClick={() => setShowAddIp((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm shadow-orange-200/60 hover:bg-orange-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add IP Address
                </button>
              }
            />

            {showAddIp && (
              <div className="mt-4 flex items-end gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Location Name
                  </label>
                  <input
                    value={newIpName}
                    onChange={(e) => setNewIpName(e.target.value)}
                    placeholder="e.g. Warehouse · Brooklyn"
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    IP Address
                  </label>
                  <input
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    placeholder="192.168.1.1"
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={addIp}
                  className="rounded-xl bg-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddIp(false)}
                  className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Location Name
                  </th>
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    IP Address
                  </th>
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="pb-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ips.map((ip) => (
                  <tr key={ip.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3.5 text-[13px] font-semibold text-gray-800">{ip.name}</td>
                    <td className="py-3.5 font-mono text-[12px] text-gray-500">{ip.ip}</td>
                    <td className="py-3.5">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {ip.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeIp(ip.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {ips.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[12px] text-gray-400">
                      No IP addresses whitelisted — access is open to any network.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* ── Active Sessions ──────────────────────────── */}
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6">
            <SectionHeader
              icon={Laptop}
              iconBg="bg-blue-500"
              iconColor="text-white"
              title="Active Sessions &amp; Auto-Logout"
              action={
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Inactivity Timeout:
                  </span>
                  <select
                    value={inactivityTimeout}
                    onChange={(e) => setInactivityTimeout(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {["15 Minutes", "30 Minutes", "60 Minutes", "2 Hours", "Never"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              }
            />

            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Device / Browser
                  </th>
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Location
                  </th>
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Last Active
                  </th>
                  <th className="pb-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-50 last:border-0 ${
                      s.current ? "bg-orange-50/40" : ""
                    }`}
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                          <Laptop className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800">{s.device}</p>
                          <p className="text-[11px] text-gray-400">{s.os}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-[12px] text-gray-500">{s.location}</td>
                    <td className="py-3.5">
                      <span
                        className={`text-[12px] font-semibold ${
                          s.current ? "text-orange-500" : "text-gray-500"
                        }`}
                      >
                        {s.lastActive}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {s.current ? (
                        <span className="text-[11px] font-semibold text-gray-300">Active</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => revokeSession(s.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={revokeAllOthers}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 hover:underline"
              >
                <LogOut className="h-3.5 w-3.5" />
                Revoke All Other Sessions
              </button>
            </div>
          </section>

          {/* ── Actions ──────────────────────────────────── */}
          <div className="mb-10 mt-6 flex items-center justify-end gap-3">
            {savedFlash && (
              <span className="mr-auto text-[12px] font-semibold text-green-600">
                Security settings saved.
              </span>
            )}
            <button
              type="button"
              onClick={resetChanges}
              className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-all duration-150 hover:border-gray-300 hover:bg-gray-50"
            >
              Cancel Changes
            </button>
            <button
              type="button"
              onClick={saveSettings}
              className="rounded-xl bg-orange-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition-all duration-150 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-200/60"
            >
              Save Security Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}