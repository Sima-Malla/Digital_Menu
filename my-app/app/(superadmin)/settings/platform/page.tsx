"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Palette,
  Scale,
  SlidersHorizontal,
  AlertTriangle,
  Check,
  ShoppingCart,
  Star,
  Loader2,
  X,
} from "lucide-react";
import {
  getPlatformSettings,
  updatePlatformSettingsAction,
  PlatformSettingsData,
}  from "@/app/actions/superadmin/platform-super";

type TabKey = "branding" | "regional" | "legal" | "rules";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "branding", label: "Branding", icon: Palette },
  { key: "regional", label: "Regional", icon: Globe },
  { key: "legal", label: "Legal", icon: Scale },
  { key: "rules", label: "Platform Rules", icon: SlidersHorizontal },
];

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("branding");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<PlatformSettingsData | null>(null);
  const [savedSettings, setSavedSettings] = useState<PlatformSettingsData | null>(null);

  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [newRegion, setNewRegion] = useState("");

  useEffect(() => {
    getPlatformSettings().then((data) => {
      setSettings(data);
      setSavedSettings(data);
      setLoading(false);
    });
  }, []);

  const hasUnsavedChanges =
    settings && savedSettings && JSON.stringify(settings) !== JSON.stringify(savedSettings);

  function update<K extends keyof PlatformSettingsData>(key: K, value: PlatformSettingsData[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError("");
    const res = await updatePlatformSettingsAction(settings);
    setSaving(false);

    if (res.success) {
      setSavedSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(res.message);
    }
  }

  function handleDiscard() {
    if (savedSettings) setSettings(savedSettings);
  }

  function handleAddRegion() {
    const region = newRegion.trim();
    if (!region || !settings) return;
    if (!settings.regions.includes(region)) {
      update("regions", [...settings.regions, region]);
    }
    setNewRegion("");
  }

  function handleRemoveRegion(region: string) {
    if (!settings) return;
    update(
      "regions",
      settings.regions.filter((r) => r !== region)
    );
  }

  function confirmMaintenanceToggle() {
    if (!settings) return;
    update("maintenanceMode", !settings.maintenanceMode);
    setShowMaintenanceConfirm(false);
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="text-sm text-slate-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Platform Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Branding, regional defaults, legal links, and platform-wide rules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Vertical sub-nav */}
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                    active
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === "branding" && (
              <Card title="Branding" description="How the platform identifies itself.">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Platform Name">
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => update("platformName", e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label="Primary Brand Color">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.brandColor}
                        onChange={(e) => update("brandColor", e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded-md border border-slate-200"
                      />
                      <input
                        type="text"
                        value={settings.brandColor}
                        onChange={(e) => update("brandColor", e.target.value)}
                        className="input"
                      />
                    </div>
                  </Field>
                </div>
              </Card>
            )}

            {activeTab === "regional" && (
              <Card title="Regional" description="Defaults applied across the platform unless overridden per business.">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Default Currency">
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) => update("defaultCurrency", e.target.value)}
                      className="input"
                    >
                      <option value="NPR">NPR — Nepalese Rupee</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="INR">INR — Indian Rupee</option>
                    </select>
                  </Field>
                  <Field label="Timezone">
                    <select
                      value={settings.timezone}
                      onChange={(e) => update("timezone", e.target.value)}
                      className="input"
                    >
                      <option value="Asia/Kathmandu">Asia/Kathmandu (UTC+5:45)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </Field>
                  <Field label="Supported Regions" full>
                    <div className="flex flex-wrap items-center gap-2">
                      {settings.regions.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-200"
                        >
                          {r}
                          <button
                            type="button"
                            onClick={() => handleRemoveRegion(r)}
                            className="text-orange-400 hover:text-orange-700"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddRegion();
                          }
                        }}
                        placeholder="+ Add region"
                        className="w-28 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-600 outline-none focus:border-orange-400"
                      />
                    </div>
                  </Field>
                </div>
              </Card>
            )}

            {activeTab === "legal" && (
              <Card title="Legal" description="Documents shown to users and businesses across the platform.">
                <div className="space-y-5">
                  <Field label="Terms of Service URL">
                    <input
                      type="url"
                      value={settings.termsUrl}
                      onChange={(e) => update("termsUrl", e.target.value)}
                      placeholder="https://..."
                      className="input"
                    />
                  </Field>
                  <Field label="Privacy Policy URL">
                    <input
                      type="url"
                      value={settings.privacyUrl}
                      onChange={(e) => update("privacyUrl", e.target.value)}
                      placeholder="https://..."
                      className="input"
                    />
                  </Field>
                </div>
              </Card>
            )}

            {activeTab === "rules" && (
              <>
                <Card
                  title="Commission & Order Limits"
                  icon={SlidersHorizontal}
                  description="Global defaults for commission and order limits."
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Default Commission (%)">
                      <input
                        type="number"
                        value={settings.defaultCommissionPct}
                        onChange={(e) => update("defaultCommissionPct", Number(e.target.value))}
                        className="input"
                      />
                    </Field>
                    <Field label="Minimum Order Value">
                      <input
                        type="number"
                        value={settings.minOrderValue}
                        onChange={(e) => update("minOrderValue", Number(e.target.value))}
                        className="input"
                      />
                    </Field>
                  </div>
                </Card>

                <Card title="Online Ordering" icon={ShoppingCart} description="Platform-wide defaults for how orders are placed.">
                  <div className="divide-y divide-slate-100">
                    <SettingRow label="Enable Online Ordering">
                      <Toggle checked={settings.onlineOrdering} onChange={() => update("onlineOrdering", !settings.onlineOrdering)} />
                    </SettingRow>
                    <SettingRow label="Allow Guest Orders" description="Let customers order without creating an account.">
                      <Toggle checked={settings.guestOrders} onChange={() => update("guestOrders", !settings.guestOrders)} />
                    </SettingRow>
                  </div>
                </Card>

                <Card title="Customer Reviews" icon={Star} description="Manage whether ratings and reviews appear across the platform.">
                  <div className="divide-y divide-slate-100">
                    <SettingRow label="Enable Customer Reviews">
                      <Toggle checked={settings.customerReviews} onChange={() => update("customerReviews", !settings.customerReviews)} />
                    </SettingRow>
                  </div>
                </Card>

                <Card
                  title="Maintenance Mode"
                  icon={AlertTriangle}
                  description="Temporarily takes the entire platform offline for all users and businesses."
                  tone="danger"
                >
                  <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Maintenance mode is {settings.maintenanceMode ? "ON" : "OFF"}
                        </p>
                        <p className="text-xs text-red-600">
                          Turning this on immediately blocks access for every user and business.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={settings.maintenanceMode}
                      onChange={() => setShowMaintenanceConfirm(true)}
                      danger
                    />
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
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
          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal for maintenance mode */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-semibold">
                {settings.maintenanceMode ? "Disable" : "Enable"} maintenance mode?
              </h3>
            </div>
            <p className="mb-5 text-sm text-slate-500">
              {settings.maintenanceMode
                ? "Users and businesses will regain access immediately."
                : "This will block all access to the platform for every user and business until turned off."}
            </p>
            <p className="mb-5 text-xs text-slate-400">
              This applies immediately along with your other pending changes when you click confirm — it does not wait for "Save Changes".
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMaintenanceConfirm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMaintenanceToggle}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, {settings.maintenanceMode ? "disable" : "enable"} it
              </button>
            </div>
          </div>
        </div>
      )}

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
  tone = "default",
  icon: Icon,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
  icon?: React.ElementType;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm sm:p-6 ${
        tone === "danger" ? "border-red-200" : "border-slate-200"
      }`}
    >
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
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
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
