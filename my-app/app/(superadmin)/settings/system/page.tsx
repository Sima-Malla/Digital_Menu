"use client";

import { useState } from "react";
import {
  DatabaseBackup,
  ScrollText,
  Gauge,
  RefreshCw,
  Plug,
  ServerCog,
  Check,
  Loader2,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function SystemSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Backup & Recovery
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [backupRetention, setBackupRetention] = useState("30 days");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState("22 Jul 2026, 03:00 AM");

  // System logs
  const [logRetention, setLogRetention] = useState("60 days");
  const [logVerbosity, setLogVerbosity] = useState("Info & above");
  const [autoArchive, setAutoArchive] = useState(true);

  // API rate limits
  const [rateLimit, setRateLimit] = useState(120);
  const [rateLimitWindow, setRateLimitWindow] = useState("per minute");
  const [blockOnExceed, setBlockOnExceed] = useState(true);

  // Cache
  const [cacheTtl, setCacheTtl] = useState(15);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "maps", name: "Google Maps", description: "Location search and delivery distance calculation.", enabled: true },
    { id: "storage", name: "Cloudinary", description: "Image and file storage for menus and business photos.", enabled: true },
    { id: "analytics", name: "Firebase Analytics", description: "Usage analytics across web and mobile apps.", enabled: false },
  ]);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function runBackupNow() {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackup("Just now");
    }, 1500);
  }

  function clearCache() {
    setIsClearingCache(true);
    setCacheCleared(false);
    setTimeout(() => {
      setIsClearingCache(false);
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    }, 1000);
  }

  function toggleIntegration(id: string) {
    setIntegrations((ints) => ints.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-2xl">
            System
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Backups, logs, rate limits, cache, integrations, and environment status.
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* Backup & Recovery */}
          <Card title="Backup &amp; Recovery" icon={DatabaseBackup} description="Automatic database backup schedule.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Backup Frequency">
                <select
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="input"
                >
                  <option>Every 6 Hours</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </Field>
              <Field label="Retention Period">
                <select
                  value={backupRetention}
                  onChange={(e) => setBackupRetention(e.target.value)}
                  className="input"
                >
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                </select>
              </Field>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Last backup: <span className="font-medium text-slate-700">{lastBackup}</span>
              </p>
              <button
                onClick={runBackupNow}
                disabled={isBackingUp}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-70"
              >
                {isBackingUp && <Loader2 size={13} className="animate-spin" />}
                {isBackingUp ? "Backing up..." : "Backup Now"}
              </button>
            </div>
          </Card>

          {/* System Logs */}
          <Card title="System Logs" icon={ScrollText} description="Application and error log behavior (separate from the security audit trail).">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Log Retention Period">
                  <select
                    value={logRetention}
                    onChange={(e) => setLogRetention(e.target.value)}
                    className="input"
                  >
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                  </select>
                </Field>
                <Field label="Log Verbosity">
                  <select
                    value={logVerbosity}
                    onChange={(e) => setLogVerbosity(e.target.value)}
                    className="input"
                  >
                    <option>Errors only</option>
                    <option>Warnings & above</option>
                    <option>Info & above</option>
                    <option>Debug (verbose)</option>
                  </select>
                </Field>
              </div>
              <SettingRow
                label="Auto-archive Old Logs"
                description="Move logs past the retention period to cold storage instead of deleting them."
              >
                <Toggle checked={autoArchive} onChange={() => setAutoArchive((v) => !v)} />
              </SettingRow>
            </div>
          </Card>

          {/* API Rate Limits */}
          <Card title="API Rate Limits" icon={Gauge} description="Protect the platform from abuse and traffic spikes.">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Requests Allowed">
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="input"
                  />
                </Field>
                <Field label="Time Window">
                  <select
                    value={rateLimitWindow}
                    onChange={(e) => setRateLimitWindow(e.target.value)}
                    className="input"
                  >
                    <option>per minute</option>
                    <option>per hour</option>
                  </select>
                </Field>
              </div>
              <SettingRow
                label="Block Requests When Exceeded"
                description="If off, extra requests are throttled instead of rejected."
              >
                <Toggle checked={blockOnExceed} onChange={() => setBlockOnExceed((v) => !v)} />
              </SettingRow>
            </div>
          </Card>

          {/* Cache Management */}
          <Card title="Cache Management" icon={RefreshCw} description="Controls cached responses across the platform.">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Field label="Cache TTL (minutes)">
                <input
                  type="number"
                  value={cacheTtl}
                  onChange={(e) => setCacheTtl(Number(e.target.value))}
                  className="input max-w-[160px]"
                />
              </Field>
              <div className="flex items-center gap-3">
                {cacheCleared && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <Check size={14} /> Cache cleared
                  </span>
                )}
                <button
                  onClick={clearCache}
                  disabled={isClearingCache}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-70"
                >
                  {isClearingCache && <Loader2 size={13} className="animate-spin" />}
                  {isClearingCache ? "Clearing..." : "Clear Cache"}
                </button>
              </div>
            </div>
          </Card>

          {/* Integrations */}
          <Card title="Third-Party Integrations" icon={Plug} description="External services connected to the platform.">
            <div className="divide-y divide-slate-100">
              {integrations.map((i) => (
                <SettingRow key={i.id} label={i.name} description={i.description}>
                  <Toggle checked={i.enabled} onChange={() => toggleIntegration(i.id)} />
                </SettingRow>
              ))}
            </div>
          </Card>

          {/* Environment Info (read-only) */}
          <Card title="Environment" icon={ServerCog} description="Current system status. Read-only.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow label="Platform Version" value="v3.4.1" />
              <InfoRow label="Environment" value="Production" badge="LIVE" />
              <InfoRow label="Server Uptime" value="27 days, 6 hrs" />
              <InfoRow label="Database Status" value="Optimal" badge="OK" />
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 lg:px-8">
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
            <button className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex-none">
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 sm:flex-none"
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-orange-500" />}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      <div className="mt-4 sm:mt-5">{children}</div>
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
    <div className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-4">
      <div className="pr-2 sm:pr-4">
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

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {value}
        {badge && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            {badge}
          </span>
        )}
      </span>
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
