"use client";

// app/(superadmin)/settings/security/page.tsx
import { useEffect, useState, useTransition } from "react";
import { KeyRound, ShieldCheck, Clock3, History, Check } from "lucide-react";
import { getSecuritySettings, updateSecuritySettings } from "@/app/actions/superadmin/security";

export default function SecuritySettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Password policy
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecialChar, setRequireSpecialChar] = useState(false);

  // 2FA
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [twoFAMethod, setTwoFAMethod] = useState("Authenticator App");

  // Session & login limits
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [autoBlockMinutes, setAutoBlockMinutes] = useState(15);

  // Audit log retention
  const [retentionPeriod, setRetentionPeriod] = useState("180 days");

  useEffect(() => {
    (async () => {
      const s = await getSecuritySettings();
      setMinLength(s.minLength);
      setRequireUppercase(s.requireUppercase);
      setRequireNumber(s.requireNumber);
      setRequireSpecialChar(s.requireSpecialChar);
      setEnforce2FA(s.enforce2FA);
      setTwoFAMethod(s.twoFAMethod);
      setSessionTimeout(s.sessionTimeoutMinutes);
      setMaxLoginAttempts(s.maxLoginAttempts);
      setAutoBlockMinutes(s.autoBlockMinutes);
      setRetentionPeriod(s.auditRetentionPeriod);
      setLoading(false);
    })();
  }, []);

  function handleSave() {
    startTransition(async () => {
      await updateSecuritySettings({
        minLength,
        requireUppercase,
        requireNumber,
        requireSpecialChar,
        enforce2FA,
        twoFAMethod: twoFAMethod as "Authenticator App" | "SMS" | "Email",
        sessionTimeoutMinutes: sessionTimeout,
        maxLoginAttempts,
        autoBlockMinutes,
        auditRetentionPeriod: retentionPeriod as "30 days" | "90 days" | "180 days" | "1 year" | "Indefinite",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading security settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Security</h1>
          <p className="mt-1 text-sm text-slate-500">
            Password policy, authentication, and audit settings for the platform.
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
            </div>
          </Card>

          {/* Two-Factor Authentication */}
          <Card title="Two-Factor Authentication" icon={ShieldCheck} description="Extra verification step for admin accounts.">
            <div className="divide-y divide-slate-100">
              <SettingRow label="Enforce 2FA for Admins" description="All admin accounts must set up 2FA to sign in.">
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
        </div>
      </div>

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
              disabled={isPending}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

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

function Card({ title, description, children, icon: Icon }: { title: string; description?: string; children: React.ReactNode; icon?: React.ElementType }) {
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

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
  danger = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? (danger ? "bg-red-600" : "bg-orange-600") : "bg-slate-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
