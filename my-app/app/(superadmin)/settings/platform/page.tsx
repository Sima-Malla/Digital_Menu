"use client";

import { useState } from "react";
import {
  Globe,
  Palette,
  Scale,
  SlidersHorizontal,
  Upload,
  AlertTriangle,
  Check,
  QrCode,
  ShoppingCart,
  Star,
} from "lucide-react";

type TabKey = "branding" | "regional" | "legal" | "rules";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "branding", label: "Branding", icon: Palette },
  { key: "regional", label: "Regional", icon: Globe },
  { key: "legal", label: "Legal", icon: Scale },
  { key: "rules", label: "Platform Rules", icon: SlidersHorizontal },
];

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("branding");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const [autoGenerateQR, setAutoGenerateQR] = useState(true);
  const [onlineOrdering, setOnlineOrdering] = useState(true);
  const [guestOrders, setGuestOrders] = useState(true);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [customerReviews, setCustomerReviews] = useState(true);
  const [reviewApproval, setReviewApproval] = useState(true);
  const [showAverageRating, setShowAverageRating] = useState(true);

  function handleSave() {
    // wire this up to your API call
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                      defaultValue="Bistro Central"
                      className="input"
                    />
                  </Field>
                  <Field label="Tagline">
                    <input
                      type="text"
                      placeholder="A short line about your platform"
                      className="input"
                    />
                  </Field>
                  <Field label="Logo">
                    <UploadBox label="PNG or SVG, up to 2MB" />
                  </Field>
                  <Field label="Favicon">
                    <UploadBox label="32x32 PNG or ICO" />
                  </Field>
                  <Field label="Primary Brand Color">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        defaultValue="#F97316"
                        className="h-10 w-14 cursor-pointer rounded-md border border-slate-200"
                      />
                      <input type="text" defaultValue="#F97316" className="input" />
                    </div>
                  </Field>
                </div>
              </Card>
            )}

            {activeTab === "regional" && (
              <Card title="Regional" description="Defaults applied across the platform unless overridden per business.">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Default Currency">
                    <select className="input">
                      <option>NPR — Nepalese Rupee</option>
                      <option>USD — US Dollar</option>
                      <option>INR — Indian Rupee</option>
                    </select>
                  </Field>
                  <Field label="Timezone">
                    <select className="input">
                      <option>Asia/Kathmandu (UTC+5:45)</option>
                      <option>Asia/Kolkata (UTC+5:30)</option>
                      <option>UTC</option>
                    </select>
                  </Field>
                  <Field label="Default Language">
                    <select className="input">
                      <option>English</option>
                      <option>Nepali</option>
                    </select>
                  </Field>
                  <Field label="Date Format">
                    <select className="input">
                      <option>DD MMM YYYY (22 Jul 2026)</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </Field>
                  <Field label="Supported Regions" full>
                    <div className="flex flex-wrap gap-2">
                      {["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Chitwan"].map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-200"
                        >
                          {r}
                        </span>
                      ))}
                      <button className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50">
                        + Add region
                      </button>
                    </div>
                  </Field>
                </div>
              </Card>
            )}

            {activeTab === "legal" && (
              <Card title="Legal" description="Documents shown to users and businesses across the platform.">
                <div className="space-y-5">
                  <Field label="Terms of Service URL">
                    <input type="url" placeholder="https://..." className="input" />
                  </Field>
                  <Field label="Privacy Policy URL">
                    <input type="url" placeholder="https://..." className="input" />
                  </Field>
                  <Field label="Refund & Cancellation Policy URL">
                    <input type="url" placeholder="https://..." className="input" />
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
                      <input type="number" defaultValue={12} className="input" />
                    </Field>
                    <Field label="Minimum Order Value">
                      <input type="number" defaultValue={200} className="input" />
                    </Field>
                  </div>
                </Card>

                <Card title="QR Code Settings" icon={QrCode} description="Control how QR codes are generated and shared for businesses.">
                  <div className="divide-y divide-slate-100">
                    <SettingRow
                      label="Auto Generate QR Codes"
                      description="Generate a QR code automatically when a business is created."
                    >
                      <Toggle checked={autoGenerateQR} onChange={() => setAutoGenerateQR((v) => !v)} />
                    </SettingRow>
                    <SettingRow label="QR Code Download Format">
                      <select className="input w-32">
                        <option>PNG</option>
                        <option>SVG</option>
                        <option>PDF</option>
                      </select>
                    </SettingRow>
                    <SettingRow label="QR Code Size">
                      <select className="input w-32">
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </SettingRow>
                  </div>
                </Card>

                <Card title="Online Ordering" icon={ShoppingCart} description="Platform-wide defaults for how orders are placed and accepted.">
                  <div className="divide-y divide-slate-100">
                    <SettingRow label="Enable Online Ordering">
                      <Toggle checked={onlineOrdering} onChange={() => setOnlineOrdering((v) => !v)} />
                    </SettingRow>
                    <SettingRow label="Allow Guest Orders" description="Let customers order without creating an account.">
                      <Toggle checked={guestOrders} onChange={() => setGuestOrders((v) => !v)} />
                    </SettingRow>
                    <SettingRow label="Auto Accept Orders" description="Skip manual confirmation and accept orders as soon as they arrive.">
                      <Toggle checked={autoAcceptOrders} onChange={() => setAutoAcceptOrders((v) => !v)} />
                    </SettingRow>
                  </div>
                </Card>

                <Card title="Customer Reviews" icon={Star} description="Manage how ratings and reviews appear across the platform.">
                  <div className="divide-y divide-slate-100">
                    <SettingRow label="Enable Customer Reviews">
                      <Toggle checked={customerReviews} onChange={() => setCustomerReviews((v) => !v)} />
                    </SettingRow>
                    <SettingRow label="Require Review Approval" description="Reviews stay hidden until an admin approves them.">
                      <Toggle checked={reviewApproval} onChange={() => setReviewApproval((v) => !v)} />
                    </SettingRow>
                    <SettingRow label="Show Average Rating">
                      <Toggle checked={showAverageRating} onChange={() => setShowAverageRating((v) => !v)} />
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
                          Maintenance mode is {maintenanceMode ? "ON" : "OFF"}
                        </p>
                        <p className="text-xs text-red-600">
                          Turning this on immediately blocks access for every user and business.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={maintenanceMode}
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

      {/* Confirm modal for maintenance mode */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-semibold">
                {maintenanceMode ? "Disable" : "Enable"} maintenance mode?
              </h3>
            </div>
            <p className="mb-5 text-sm text-slate-500">
              {maintenanceMode
                ? "Users and businesses will regain access immediately."
                : "This will block all access to the platform for every user and business until turned off."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMaintenanceConfirm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMaintenanceMode((v) => !v);
                  setShowMaintenanceConfirm(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, {maintenanceMode ? "disable" : "enable"} it
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

function UploadBox({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center hover:bg-slate-50">
      <Upload className="h-5 w-5 text-slate-400" />
      <span className="text-xs text-slate-500">{label}</span>
      <input type="file" className="hidden" />
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  danger = false,
}: {
  checked: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? (danger ? "bg-red-600" : "bg-orange-600") : "bg-slate-300"
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
