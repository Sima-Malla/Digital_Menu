"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import { useState } from "react";
import {
  ChevronRight,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Lock,
  Mail,
  Laptop,
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  KeyRound,
} from "lucide-react";

function StatusBadge({ status }: { status: "active" | "warning" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {status === "active" ? "Active" : "Not Configured"}
    </span>
  );
}

export default function SecurityPage() {
  // MFA State
  const [authenticator, setAuthenticator] = useState(false);
  const [smsRecovery, setSmsRecovery] = useState(false);
  
  // Password States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Recovery Email
  const [recoveryEmail, setRecoveryEmail] = useState("admin-ops@gourmet-hq.com");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Chrome on macOS",
      location: "London, UK",
      ip: "192.168.1.104",
      time: "Active now",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone 15 Pro",
      location: "Manchester, UK",
      ip: "82.14.92.11",
      time: "2 hours ago",
      current: false,
    },
    {
      id: 3,
      device: "Edge on Windows",
      location: "London, UK",
      ip: "192.168.1.5",
      time: "May 24, 11:20 AM",
      current: false,
    },
  ]);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Handlers
  const revokeSession = (id: number) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const revokeAllSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current));
  };

  const saveSettings = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleUpdatePassword = () => {
    // Handle password update logic
    console.log("Password updated");
  };

  const handleChangeEmail = () => {
    setIsEditingEmail(false);
    // Handle email change logic
    console.log("Email changed to:", recoveryEmail);
  };

  const handleGenerateCodes = () => {
    // Handle backup code generation
    console.log("New backup codes generated");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FC]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
            <span>Settings</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-700">Security & Access</span>
          </div>

          {/* ── Header ───────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-[30px] font-bold text-gray-900">
              Security & Access
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Protect your restaurant operations and manage administrator
              credentials.
            </p>
          </div>

          {/* ── Toast Message ────────────────────────────── */}
          {showToast && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-[13px] font-medium text-green-700">
                Security settings updated successfully.
              </span>
            </div>
          )}

          {/* ── Main Layout ──────────────────────────────── */}
          <div className="grid grid-cols-[1fr_320px] gap-6">
            {/* ── LEFT COLUMN ────────────────────────────── */}
            <div className="space-y-6">
              {/* ── MFA Section ──────────────────────────── */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                        <ShieldCheck className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">
                          Multi-Factor Authentication
                        </h2>
                        <p className="text-sm text-gray-500">
                          Secure your account with an additional verification step.
                        </p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status="warning" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* Authenticator App */}
                  <button
                    onClick={() => setAuthenticator(!authenticator)}
                    className={`rounded-xl border p-5 text-left transition ${
                      authenticator
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <Smartphone className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="mt-4 font-semibold">Authenticator App</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Google Authenticator, Microsoft Authenticator or Authy.
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-medium">Enabled</span>
                      <div
                        className={`h-6 w-11 rounded-full transition ${
                          authenticator ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-full bg-white transition ${
                            authenticator ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* SMS Recovery */}
                  <button
                    onClick={() => setSmsRecovery(!smsRecovery)}
                    className={`rounded-xl border p-5 text-left transition ${
                      smsRecovery
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <MessageSquare className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="mt-4 font-semibold">SMS Recovery</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Receive backup verification codes via SMS.
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-medium">Enabled</span>
                      <div
                        className={`h-6 w-11 rounded-full transition ${
                          smsRecovery ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-full bg-white transition ${
                            smsRecovery ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                </div>

                <button className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                  Setup MFA
                </button>
              </div>

              {/* ── Password Management ──────────────────── */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Password Management
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your administrator password regularly.
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_290px] gap-8 p-6">
                  {/* Left - Password Fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-orange-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showCurrent ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 12 characters"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-orange-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showNew ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-orange-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showConfirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdatePassword}
                      className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      Update Password
                    </button>
                  </div>

                  {/* Right - Security Requirements */}
                  <div className="rounded-2xl bg-[#F8F9FC] p-5">
                    <h3 className="font-semibold text-gray-900">
                      Security Requirements
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your password should satisfy all rules below.
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm">Minimum 12 characters</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm">
                          Uppercase & lowercase letters
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                        </div>
                        <span className="text-sm text-gray-600">
                          At least one number
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                        </div>
                        <span className="text-sm text-gray-600">
                          One special character
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-orange-700">
                            Password Strength
                          </p>
                          <p className="mt-1 text-sm text-orange-600">
                            Strong passwords help keep your account secure from
                            unauthorized access.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Account Recovery ────────────────────────── */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Account Recovery</h2>
                
                <div className="mt-6 space-y-6">
                  {/* Recovery Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Recovery Email
                    </label>
                    <div className="flex items-center gap-3">
                      {isEditingEmail ? (
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1 py-2.5 text-sm text-gray-600">
                          {recoveryEmail}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (isEditingEmail) {
                            handleChangeEmail();
                          } else {
                            setIsEditingEmail(true);
                          }
                        }}
                        className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        {isEditingEmail ? "SAVE" : "CHANGE EMAIL"}
                      </button>
                      {isEditingEmail && (
                        <button
                          onClick={() => {
                            setIsEditingEmail(false);
                            setRecoveryEmail("admin-ops@gourmet-hq.com");
                          }}
                          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Backup Codes */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Backup Codes
                    </label>
                    <p className="text-sm text-gray-500">
                      Generate emergency codes for when you lose access to your MFA device.
                    </p>
                    <button
                      onClick={handleGenerateCodes}
                      className="mt-3 flex items-center gap-2 rounded-xl border border-orange-500 px-5 py-2.5 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      GENERATE NEW CODES
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ──────────────────────────────── */}
            <div className="space-y-6">
              {/* ── Security History ─────────────────────── */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Security History</h2>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Successful Login</p>
                      <p className="text-sm text-gray-500">
                        Today • Chrome • London
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-full bg-red-100 p-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">Failed Login Attempt</p>
                      <p className="text-sm text-gray-500">
                        Yesterday • Unknown Device
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Password Updated</p>
                      <p className="text-sm text-gray-500">
                        May 24 • 11:20 AM
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-full bg-yellow-100 p-2">
                      <Mail className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Recovery Email Changed</p>
                      <p className="text-sm text-gray-500">
                        May 15 • 9:42 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Active Sessions ──────────────────────── */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Active Sessions</h2>

                <div className="mt-6 space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`rounded-xl border p-4 ${
                        session.current
                          ? "border-orange-200 bg-orange-50"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-gray-100 p-2">
                            <Laptop className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {session.device}
                              {session.current && (
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {session.location} • {session.ip}
                            </p>
                            <p className="text-xs text-gray-400">
                              {session.time}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-700"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {sessions.filter((s) => !s.current).length > 0 && (
                  <button
                    onClick={revokeAllSessions}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Revoke All Other Sessions
                  </button>
                )}
              </div>

              {/* ── Need Assistance ──────────────────────── */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Need Assistance?
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-blue-700">
                      If you suspect unauthorized access or are unable to recover
                      your account, contact Gourmet Admin Support immediately.
                    </p>
                    <button className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Save Button ───────────────────────────────── */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Save Security Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}