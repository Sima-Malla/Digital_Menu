"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Clock3,
  Network,
  History,
  Terminal,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

interface ApiKey {
  id: string;
  label: string;
  key: string;
  created: string;
  lastUsed: string;
}

interface AllowedIp {
  id: string;
  address: string;
  label: string;
}

export default function SecuritySettingsPage() {
  const [saved, setSaved] = useState(false);

  // Password policy
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecialChar, setRequireSpecialChar] = useState(false);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);

  // 2FA
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [twoFAMethod, setTwoFAMethod] = useState("Authenticator App");

  // Session & login limits
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [autoBlockMinutes, setAutoBlockMinutes] = useState(15);

  // IP whitelist
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState<AllowedIp[]>([
    { id: "1", address: "192.168.1.22", label: "Office - Kathmandu" },
  ]);

  // Audit log retention
  const [retentionPeriod, setRetentionPeriod] = useState("90 days");

  // API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: "1", label: "Production Server", key: "sk_live_••••••••••••8F2A", created: "01 Jun 2026", lastUsed: "2h ago" },
    { id: "2", label: "Staging", key: "sk_test_••••••••••••11C3", created: "12 Mar 2026", lastUsed: "5d ago" },
  ]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addIp() {
    setAllowedIps((ips) => [...ips, { id: crypto.randomUUID(), address: "", label: "" }]);
  }

  function updateIp(id: string, field: "address" | "label", value: string) {
    setAllowedIps((ips) => ips.map((ip) => (ip.id === id ? { ...ip, [field]: value } : ip)));
  }

  function removeIp(id: string) {
    setAllowedIps((ips) => ips.filter((ip) => ip.id !== id));
  }

  function toggleReveal(id: string) {
    setRevealedKeys((r) => ({ ...r, [id]: !r[id] }));
  }

  function copyKey(id: string, key: string) {
    navigator.clipboard?.writeText(key).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function revokeKey(id: string) {
    setApiKeys((keys) => keys.filter((k) => k.id !== id));
  }

  function generateKey() {
    setApiKeys((keys) => [
      ...keys,
      {
        id: crypto.randomUUID(),
        label: "New API Key",
        key: `sk_live_••••••••••••${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        created: "Just now",
        lastUsed: "Never",
      },
    ]);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Security
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Password policy, authentication, access control, and audit settings for the platform.
          </p>
        </div>

        <div className="space-y-6">
          {/* Password Policy */}
          <Card title="Password Policy" icon={KeyRound} description="Rules enforced when any admin or user sets a password.">
            <div className="space-y-1 divide-y divide-slate-100">
              <SettingRow label="Minimum Length">
                <input
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
              <SettingRow label="Require Uppercase Letter">
                <Toggle checked={requireUppercase} onChange={() => setRequireUppercase((v) => !v)} />
              </SettingRow>
              <SettingRow label="Require Number">
                <Toggle checked={requireNumber} onChange={() => setRequireNumber((v) => !v)} />
              </SettingRow>
              <SettingRow label="Require Special Character">
                <Toggle checked={requireSpecialChar} onChange={() => setRequireSpecialChar((v) => !v)} />
              </SettingRow>
              <SettingRow
                label="Password Expiry (days)"
                description="Force a password reset after this many days. 0 disables expiry."
              >
                <input
                  type="number"
                  value={passwordExpiryDays}
                  onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
            </div>
          </Card>

          {/* Two-Factor Authentication */}
          <Card title="Two-Factor Authentication" icon={ShieldCheck} description="Extra verification step for admin accounts.">
            <div className="divide-y divide-slate-100">
              <SettingRow
                label="Enforce 2FA for Admins"
                description="All admin accounts must set up 2FA to sign in."
              >
                <Toggle checked={enforce2FA} onChange={() => setEnforce2FA((v) => !v)} />
              </SettingRow>
              <SettingRow label="Preferred Method">
                <select
                  value={twoFAMethod}
                  onChange={(e) => setTwoFAMethod(e.target.value)}
                  disabled={!enforce2FA}
                  className="input w-48 disabled:opacity-50"
                >
                  <option>Authenticator App</option>
                  <option>SMS</option>
                  <option>Email</option>
                </select>
              </SettingRow>
            </div>
          </Card>

          {/* Session & Login Limits */}
          <Card title="Session & Login Limits" icon={Clock3} description="Controls how long sessions last and how failed logins are handled.">
            <div className="divide-y divide-slate-100">
              <SettingRow label="Session Timeout (minutes)">
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
              <SettingRow label="Max Failed Login Attempts">
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
              <SettingRow
                label="Auto-block Duration (minutes)"
                description="How long an account stays blocked after exceeding failed attempts."
              >
                <input
                  type="number"
                  value={autoBlockMinutes}
                  onChange={(e) => setAutoBlockMinutes(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
            </div>
          </Card>

          {/* IP Whitelisting */}
          <Card title="IP Whitelisting" icon={Network} description="Restrict admin login to specific IP addresses.">
            <div className="space-y-4">
              <SettingRow label="Enable IP Whitelisting">
                <Toggle checked={ipWhitelistEnabled} onChange={() => setIpWhitelistEnabled((v) => !v)} />
              </SettingRow>

              {ipWhitelistEnabled && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  {allowedIps.map((ip) => (
                    <div key={ip.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ip.address}
                        onChange={(e) => updateIp(ip.id, "address", e.target.value)}
                        placeholder="192.168.1.1"
                        className="input flex-1 font-mono text-xs"
                      />
                      <input
                        type="text"
                        value={ip.label}
                        onChange={(e) => updateIp(ip.id, "label", e.target.value)}
                        placeholder="Label (e.g. Office)"
                        className="input flex-1"
                      />
                      <button
                        onClick={() => removeIp(ip.id)}
                        aria-label="Remove IP"
                        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addIp}
                    className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    <Plus size={15} />
                    Add IP address
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Audit Log Retention */}
          <Card title="Audit Log Retention" icon={History} description="How long system and security logs are kept before archiving.">
            <Field label="Retention Period">
              <select
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="input max-w-xs"
              >
                <option>30 days</option>
                <option>90 days</option>
                <option>180 days</option>
                <option>1 year</option>
                <option>Indefinite</option>
              </select>
            </Field>
          </Card>

          {/* API Key Management */}
          <Card title="API Key Management" icon={Terminal} description="Keys used by external services to access the platform API.">
            <div className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{k.label}</p>
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Revoke
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-md bg-white px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
                      {revealedKeys[k.id] ? k.key.replace(/•/g, "x") : k.key}
                    </code>
                    <button
                      onClick={() => toggleReveal(k.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                      aria-label="Toggle key visibility"
                    >
                      {revealedKeys[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => copyKey(k.id, k.key)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                      aria-label="Copy key"
                    >
                      {copiedId === k.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Created {k.created} · Last used {k.lastUsed}
                  </p>
                </div>
              ))}

              <button
                onClick={generateKey}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                <Plus size={15} />
                Generate new API key
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Check size={14} /> Changes saved
              </span>
            ) : (
              "Unsaved changes are not applied until you save."
            )}
          </p>
          <div className="flex gap-3">
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Discard
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Shared input styling */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #334155;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Card({
  title,
  description,
  children,
  icon: Icon,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-orange-500" />}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-orange-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
