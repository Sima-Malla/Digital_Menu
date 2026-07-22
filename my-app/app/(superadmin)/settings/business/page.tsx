"use client";

import { useState } from "react";
import {
  Store,
  ClipboardCheck,
  Percent,
  Wallet,
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";

interface CommissionTier {
  id: string;
  name: string;
  commission: number;
}

interface RequiredDocument {
  id: string;
  name: string;
  required: boolean;
}

export default function BusinessRulesPage() {
  const [saved, setSaved] = useState(false);

  // Business defaults
  const [autoApprove, setAutoApprove] = useState(false);
  const [requireVerification, setRequireVerification] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState("Pending");

  // Required documents
  const [documents, setDocuments] = useState<RequiredDocument[]>([
    { id: "1", name: "Business Registration / License", required: true },
    { id: "2", name: "Tax Registration (PAN / VAT)", required: true },
    { id: "3", name: "Bank Account Details", required: true },
    { id: "4", name: "Owner Citizenship / ID", required: false },
  ]);

  // Commission tiers
  const [tiers, setTiers] = useState<CommissionTier[]>([
    { id: "1", name: "Standard", commission: 12 },
    { id: "2", name: "Premium Partner", commission: 8 },
    { id: "3", name: "New Business (first 3 months)", commission: 5 },
  ]);

  // Payout
  const [payoutFrequency, setPayoutFrequency] = useState("Weekly");
  const [payoutThreshold, setPayoutThreshold] = useState(1000);
  const [payoutMethod, setPayoutMethod] = useState("Bank Transfer");

  // Order rules
  const [minOrderValue, setMinOrderValue] = useState(150);
  const [allowPerBusinessOverride, setAllowPerBusinessOverride] = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleDocument(id: string) {
    setDocuments((docs) =>
      docs.map((d) => (d.id === id ? { ...d, required: !d.required } : d))
    );
  }

  function updateDocumentName(id: string, value: string) {
    setDocuments((docs) => docs.map((d) => (d.id === id ? { ...d, name: value } : d)));
  }

  function removeDocument(id: string) {
    setDocuments((docs) => docs.filter((d) => d.id !== id));
  }

  function addDocument() {
    setDocuments((docs) => [
      ...docs,
      { id: crypto.randomUUID(), name: "New Document", required: false },
    ]);
  }

  function updateTierCommission(id: string, value: number) {
    setTiers((t) => t.map((tier) => (tier.id === id ? { ...tier, commission: value } : tier)));
  }

  function updateTierName(id: string, value: string) {
    setTiers((t) => t.map((tier) => (tier.id === id ? { ...tier, name: value } : tier)));
  }

  function removeTier(id: string) {
    setTiers((t) => t.filter((tier) => tier.id !== id));
  }

  function addTier() {
    setTiers((t) => [
      ...t,
      { id: crypto.randomUUID(), name: "New Tier", commission: 10 },
    ]);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Business Rules
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Onboarding, verification, commission, and payout policies applied to businesses on the platform.
          </p>
        </div>

        <div className="space-y-6">
          {/* Business Defaults */}
          <Card
            title="Business Defaults"
            icon={Store}
            description="Applied automatically when a new business signs up."
          >
            <div className="divide-y divide-slate-100">
              <SettingRow
                label="Auto Approve Businesses"
                description="Skip manual review and activate new businesses immediately."
              >
                <Toggle checked={autoApprove} onChange={() => setAutoApprove((v) => !v)} />
              </SettingRow>
              <SettingRow
                label="Require Business Verification"
                description="Businesses must submit required documents before going live."
              >
                <Toggle checked={requireVerification} onChange={() => setRequireVerification((v) => !v)} />
              </SettingRow>
              <SettingRow label="Default Business Status">
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value)}
                  className="input w-36"
                >
                  <option>Pending</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </SettingRow>
            </div>
          </Card>

          {/* Onboarding & Documents */}
          <Card
            title="Onboarding & Verification"
            icon={ClipboardCheck}
            description="Documents a business must provide during onboarding."
          >
            <div className="space-y-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => updateDocumentName(doc.id, e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => toggleDocument(doc.id)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      doc.required
                        ? "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {doc.required ? "Required" : "Optional"}
                  </button>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    aria-label="Remove document"
                    className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={addDocument}
                className="mt-1 flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                <Plus size={15} />
                Add document
              </button>
            </div>
          </Card>

          {/* Commission Tiers */}
          <Card
            title="Commission Tiers"
            icon={Percent}
            description="Different commission rates per business tier. Assign a tier to a business from its profile."
          >
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTierName(tier.id, e.target.value)}
                    className="input flex-1"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      value={tier.commission}
                      onChange={(e) => updateTierCommission(tier.id, Number(e.target.value))}
                      className="input pr-7"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      %
                    </span>
                  </div>
                  <button
                    onClick={() => removeTier(tier.id)}
                    aria-label="Remove tier"
                    className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={addTier}
                className="mt-1 flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                <Plus size={15} />
                Add tier
              </button>
            </div>
          </Card>

          {/* Payout Schedule */}
          <Card
            title="Payout Schedule"
            icon={Wallet}
            description="How and when businesses receive their earnings."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Payout Frequency">
                <select
                  value={payoutFrequency}
                  onChange={(e) => setPayoutFrequency(e.target.value)}
                  className="input"
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Bi-Weekly</option>
                  <option>Monthly</option>
                </select>
              </Field>
              <Field label="Payout Method">
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="input"
                >
                  <option>Bank Transfer</option>
                  <option>eSewa</option>
                  <option>Khalti</option>
                </select>
              </Field>
              <Field label="Minimum Payout Threshold" full>
                <input
                  type="number"
                  value={payoutThreshold}
                  onChange={(e) => setPayoutThreshold(Number(e.target.value))}
                  className="input"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Earnings below this amount roll over to the next payout cycle.
                </p>
              </Field>
            </div>
          </Card>

          {/* Order Rules */}
          <Card
            title="Order Rules"
            icon={ShoppingBag}
            description="Minimum order value enforced across the platform."
          >
            <div className="space-y-4">
              <Field label="Minimum Order Value">
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="input max-w-xs"
                />
              </Field>
              <SettingRow
                label="Allow Per-Business Override"
                description="Let individual businesses set their own minimum order value."
              >
                <Toggle
                  checked={allowPerBusinessOverride}
                  onChange={() => setAllowPerBusinessOverride((v) => !v)}
                />
              </SettingRow>
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
