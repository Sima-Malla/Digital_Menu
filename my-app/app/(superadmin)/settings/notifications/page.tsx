"use client";

import { useEffect, useState } from "react";
import { Mail, BellRing, Check, Loader2 } from "lucide-react";
import {
  getNotificationTemplates,
  toggleTemplateAction,
  getNotificationSettings,
  updateNotificationSettingsAction,
  EmailTemplate,
  NotificationSettingsData,
} from "@/app/actions/superadmin/notifications";

export default function NotificationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettingsData | null>(null);
  const [savedSettings, setSavedSettings] = useState<NotificationSettingsData | null>(null);

  useEffect(() => {
    (async () => {
      const [tpls, settingsData] = await Promise.all([
        getNotificationTemplates(),
        getNotificationSettings(),
      ]);
      setTemplates(tpls);
      setSettings(settingsData);
      setSavedSettings(settingsData);
      setLoading(false);
    })();
  }, []);

  const hasUnsavedChanges =
    settings && savedSettings && JSON.stringify(settings) !== JSON.stringify(savedSettings);

  function update<K extends keyof NotificationSettingsData>(key: K, value: NotificationSettingsData[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function toggleTemplate(templateKey: string) {
    const current = templates.find((t) => t.templateKey === templateKey);
    if (!current) return;
    const nextEnabled = !current.enabled;
    setTemplates((ts) => ts.map((t) => (t.templateKey === templateKey ? { ...t, enabled: nextEnabled } : t)));
    const res = await toggleTemplateAction(templateKey, nextEnabled);
    if (!res.success) {
      // revert on failure
      setTemplates((ts) => ts.map((t) => (t.templateKey === templateKey ? { ...t, enabled: !nextEnabled } : t)));
      setError(res.message ?? "Could not update template.");
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError("");
    const res = await updateNotificationSettingsAction(settings);
    setSaving(false);

    if (res.success) {
      setSavedSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(res.message ?? "Could not save settings.");
    }
  }

  function handleDiscard() {
    if (savedSettings) setSettings(savedSettings);
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="text-sm text-slate-500">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Email templates and admin alert thresholds.
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Templates */}
          <Card title="Email Templates" icon={Mail} description="Automated emails sent to users and businesses.">
            <div className="divide-y divide-slate-100">
              {templates.map((t) => (
                <SettingRow key={t.id} label={t.name} description={t.description}>
                  <Toggle checked={t.enabled} onChange={() => toggleTemplate(t.templateKey)} />
                </SettingRow>
              ))}
            </div>
          </Card>

          {/* Admin Alerts */}
          <Card
            title="Admin Alerts"
            icon={BellRing}
            description="Get notified automatically when platform metrics cross these limits."
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Failed Payments (%)">
                  <input
                    type="number"
                    value={settings.failedPaymentThreshold}
                    onChange={(e) => update("failedPaymentThreshold", Number(e.target.value))}
                    className="input"
                  />
                </Field>
                <Field label="High Refund Rate (%)">
                  <input
                    type="number"
                    value={settings.refundRateThreshold}
                    onChange={(e) => update("refundRateThreshold", Number(e.target.value))}
                    className="input"
                  />
                </Field>
                <Field label="System Errors (errors/hr)">
                  <input
                    type="number"
                    value={settings.errorSpikeThreshold}
                    onChange={(e) => update("errorSpikeThreshold", Number(e.target.value))}
                    className="input"
                  />
                </Field>
              </div>

              <SettingRow label="Notify via Email">
                <Toggle checked={settings.alertViaEmail} onChange={() => update("alertViaEmail", !settings.alertViaEmail)} />
              </SettingRow>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 lg:px-8">
          <p className="min-w-0 truncate text-xs text-slate-400">
            {error ? (
              <span className="text-red-600">{error}</span>
            ) : saved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Check size={14} /> Changes saved
              </span>
            ) : hasUnsavedChanges ? (
              "Unsaved changes are not applied until you save."
            ) : (
              "All changes saved."
            )}
          </p>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || saving}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 sm:flex-none"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="flex-1 rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50 sm:flex-none"
            >
              {saving ? "Saving..." : "Save Changes"}
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

// Overflow fix: text side gets min-w-0 so a long name/description can wrap
// or truncate instead of pushing the toggle off the row on small screens;
// the toggle keeps shrink-0 so it never gets squeezed.
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
      <div className="min-w-0 flex-1 pr-4">
        <p className="break-words text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="mt-0.5 break-words text-xs text-slate-400">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
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
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      style={{ position: "relative", overflow: "hidden" }}
      className={`h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-orange-600" : "bg-slate-300"
      }`}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
        className="h-5 w-5 rounded-full bg-white shadow transition-transform"
      />
    </button>
  );
}
