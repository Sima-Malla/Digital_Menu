"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, Clock3, History, Check, AlertTriangle } from "lucide-react";
import { getSecuritySettings, updateSecuritySettings } from "@/app/actions/superadmin/security";

export default function SecuritySettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 2FA
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [twoFAMethod, setTwoFAMethod] = useState("Authenticator App");

  // Session & login limits
  const [sessionTimeout, setSessionTimeout] = useState<number>(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState<number>(5);
  const [autoBlockMinutes, setAutoBlockMinutes] = useState<number>(15);

  // Audit log retention
  const [retentionPeriod, setRetentionPeriod] = useState("180 days");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const s = await getSecuritySettings();
      setEnforce2FA(s.enforce2FA);
      setTwoFAMethod(s.twoFAMethod);
      setSessionTimeout(s.sessionTimeoutMinutes);
      setMaxLoginAttempts(s.maxLoginAttempts);
      setAutoBlockMinutes(s.autoBlockMinutes);
      setRetentionPeriod(s.auditRetentionPeriod);
      setLoading(false);
    })();
  }, []);

  function validateInput(field?: string) {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "sessionTimeout") {
      if (isNaN(sessionTimeout) || sessionTimeout < 1 || sessionTimeout > 1440) {
        errs.sessionTimeout = "Must be 1–1440 mins";
      } else {
        delete errs.sessionTimeout;
      }
    }

    if (!field || field === "maxLoginAttempts") {
      if (isNaN(maxLoginAttempts) || maxLoginAttempts < 1 || maxLoginAttempts > 20) {
        errs.maxLoginAttempts = "Must be 1–20 attempts";
      } else {
        delete errs.maxLoginAttempts;
      }
    }

    if (!field || field === "autoBlockMinutes") {
      if (isNaN(autoBlockMinutes) || autoBlockMinutes < 1 || autoBlockMinutes > 1440) {
        errs.autoBlockMinutes = "Must be 1–1440 mins";
      } else {
        delete errs.autoBlockMinutes;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    setServerError(null);
    if (!validateInput()) {
      return;
    }

    startTransition(async () => {
      const res = await updateSecuritySettings({
        enforce2FA,
        twoFAMethod: twoFAMethod as "Authenticator App" | "SMS" | "Email",
        sessionTimeoutMinutes: sessionTimeout,
        maxLoginAttempts,
        autoBlockMinutes,
        auditRetentionPeriod: retentionPeriod as "30 days" | "90 days" | "180 days" | "1 year" | "Indefinite",
      });

      if (res.error) {
        setServerError("Failed to save security settings. Please check your inputs.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading security settings...
      </div>
    );
  }

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Security</h1>
          <p className="mt-1 text-sm text-slate-500">
            Two-factor authentication, session limits, and audit settings for the platform.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} />
            {serverError}
          </div>
        )}

        <div className="space-y-6">
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
                <div className="text-right">
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={sessionTimeout}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSessionTimeout(val);
                      validateInput("sessionTimeout");
                    }}
                    className={`input w-28 ${errors.sessionTimeout ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                  />
                  {errors.sessionTimeout && (
                    <p className="mt-1 text-xs font-medium text-red-600">{errors.sessionTimeout}</p>
                  )}
                </div>
              </SettingRow>

              <SettingRow label="Max Failed Login Attempts">
                <div className="text-right">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={maxLoginAttempts}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxLoginAttempts(val);
                      validateInput("maxLoginAttempts");
                    }}
                    className={`input w-28 ${errors.maxLoginAttempts ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                  />
                  {errors.maxLoginAttempts && (
                    <p className="mt-1 text-xs font-medium text-red-600">{errors.maxLoginAttempts}</p>
                  )}
                </div>
              </SettingRow>

              <SettingRow
                label="Auto-block Duration (minutes)"
                description="How long an account stays blocked after exceeding failed attempts."
              >
                <div className="text-right">
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={autoBlockMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAutoBlockMinutes(val);
                      validateInput("autoBlockMinutes");
                    }}
                    className={`input w-28 ${errors.autoBlockMinutes ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                  />
                  {errors.autoBlockMinutes && (
                    <p className="mt-1 text-xs font-medium text-red-600">{errors.autoBlockMinutes}</p>
                  )}
                </div>
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
            ) : hasValidationErrors ? (
              <span className="text-red-600 font-medium">Please fix validation errors before saving.</span>
            ) : (
              "Unsaved changes are not applied until you save."
            )}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || hasValidationErrors}
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
