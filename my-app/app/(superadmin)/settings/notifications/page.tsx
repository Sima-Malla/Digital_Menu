"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Smartphone,
  BellRing,
  Timer,
  Pencil,
  Check,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Email templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    { id: "welcome", name: "Welcome Email", description: "Sent when a new business or user signs up.", enabled: true },
    { id: "order", name: "Order Confirmation", description: "Sent to the customer after an order is placed.", enabled: true },
    { id: "reset", name: "Password Reset", description: "Sent when a user requests a password reset.", enabled: true },
    { id: "suspend", name: "Account Suspended", description: "Sent to a business when their account is suspended.", enabled: true },
  ]);

  // SMS gateway
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsProvider, setSmsProvider] = useState("Sparrow SMS");
  const [senderId, setSenderId] = useState("BISTROCTRL");
  const [smsApiKey, setSmsApiKey] = useState("••••••••••••4F1A");

  // Push notifications
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushIos, setPushIos] = useState(true);
  const [pushAndroid, setPushAndroid] = useState(true);
  const [pushWeb, setPushWeb] = useState(false);

  // Admin alert thresholds
  const [errorSpikeThreshold, setErrorSpikeThreshold] = useState(50);
  const [refundRateThreshold, setRefundRateThreshold] = useState(10);
  const [failedPaymentThreshold, setFailedPaymentThreshold] = useState(15);
  const [alertViaEmail, setAlertViaEmail] = useState(true);
  const [alertViaSms, setAlertViaSms] = useState(false);
  const [alertViaPush, setAlertViaPush] = useState(true);

  // Frequency & quiet hours
  const [digestFrequency, setDigestFrequency] = useState("Immediate");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleTemplate(id: string) {
    setTemplates((ts) => ts.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
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
            Email templates, SMS/push channels, admin alert thresholds, and delivery frequency.
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Templates */}
          <Card title="Email Templates" icon={Mail} description="Automated emails sent to users and businesses.">
            <div className="divide-y divide-slate-100">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="pr-4">
                    <p className="text-sm font-medium text-slate-700">{t.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{t.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Pencil size={12} />
                      Edit
                    </button>
                    <Toggle checked={t.enabled} onChange={() => toggleTemplate(t.id)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SMS Gateway */}
          <Card title="SMS Gateway" icon={MessageSquare} description="Provider used to send SMS alerts and OTPs.">
            <div className="space-y-4">
              <SettingRow label="Enable SMS Notifications">
                <Toggle checked={smsEnabled} onChange={() => setSmsEnabled((v) => !v)} />
              </SettingRow>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Provider">
                  <select
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    disabled={!smsEnabled}
                    className="input disabled:opacity-50"
                  >
                    <option>Sparrow SMS</option>
                    <option>Twilio</option>
                    <option>NTC SMS Gateway</option>
                  </select>
                </Field>
                <Field label="Sender ID">
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    disabled={!smsEnabled}
                    className="input disabled:opacity-50"
                  />
                </Field>
                <Field label="API Key">
                  <input
                    type="password"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    disabled={!smsEnabled}
                    className="input disabled:opacity-50"
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* Push Notifications */}
          <Card title="Push Notifications" icon={Smartphone} description="In-app and mobile push alerts.">
            <div className="divide-y divide-slate-100">
              <SettingRow label="Enable Push Notifications">
                <Toggle checked={pushEnabled} onChange={() => setPushEnabled((v) => !v)} />
              </SettingRow>
              <SettingRow label="iOS">
                <Toggle
                  checked={pushIos}
                  onChange={() => setPushIos((v) => !v)}
                  disabled={!pushEnabled}
                />
              </SettingRow>
              <SettingRow label="Android">
                <Toggle
                  checked={pushAndroid}
                  onChange={() => setPushAndroid((v) => !v)}
                  disabled={!pushEnabled}
                />
              </SettingRow>
              <SettingRow label="Web">
                <Toggle
                  checked={pushWeb}
                  onChange={() => setPushWeb((v) => !v)}
                  disabled={!pushEnabled}
                />
              </SettingRow>
            </div>
          </Card>

          {/* Admin Alert Thresholds */}
          <Card
            title="Admin Alert Thresholds"
            icon={BellRing}
            description="Get notified automatically when platform metrics cross these limits."
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Error Spike (errors/hr)">
                  <input
                    type="number"
                    value={errorSpikeThreshold}
                    onChange={(e) => setErrorSpikeThreshold(Number(e.target.value))}
                    className="input"
                  />
                </Field>
                <Field label="High Refund Rate (%)">
                  <input
                    type="number"
                    value={refundRateThreshold}
                    onChange={(e) => setRefundRateThreshold(Number(e.target.value))}
                    className="input"
                  />
                </Field>
                <Field label="Failed Payments (%)">
                  <input
                    type="number"
                    value={failedPaymentThreshold}
                    onChange={(e) => setFailedPaymentThreshold(Number(e.target.value))}
                    className="input"
                  />
                </Field>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-slate-600">Notify Admins Via</p>
                <div className="flex flex-wrap gap-2">
                  <ChannelChip label="Email" active={alertViaEmail} onClick={() => setAlertViaEmail((v) => !v)} />
                  <ChannelChip label="SMS" active={alertViaSms} onClick={() => setAlertViaSms((v) => !v)} />
                  <ChannelChip label="Push" active={alertViaPush} onClick={() => setAlertViaPush((v) => !v)} />
                </div>
              </div>
            </div>
          </Card>

          {/* Frequency & Quiet Hours */}
          <Card
            title="Delivery Frequency"
            icon={Timer}
            description="Control how often notifications are batched and sent."
          >
            <div className="space-y-4">
              <Field label="Digest Frequency">
                <select
                  value={digestFrequency}
                  onChange={(e) => setDigestFrequency(e.target.value)}
                  className="input max-w-xs"
                >
                  <option>Immediate</option>
                  <option>Hourly Digest</option>
                  <option>Daily Digest</option>
                </select>
              </Field>

              <SettingRow
                label="Enable Quiet Hours"
                description="Non-urgent notifications are held until quiet hours end."
              >
                <Toggle checked={quietHoursEnabled} onChange={() => setQuietHoursEnabled((v) => !v)} />
              </SettingRow>

              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 sm:max-w-xs">
                  <Field label="From">
                    <input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label="To">
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="input"
                    />
                  </Field>
                </div>
              )}
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

function ChannelChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
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
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
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
