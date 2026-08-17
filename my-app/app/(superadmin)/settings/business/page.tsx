"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
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
  Search,
} from "lucide-react";
import { getBusinessRules, saveBusinessRules, type BusinessRulesData } from "@/app/actions/business-rules";

interface Document {
  id: string;
  name: string;
  required: boolean;
}

interface Tier {
  id: string;
  name: string;
  commission: number;
}

export default function BusinessRulesPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business defaults
  const [autoApprove, setAutoApprove] = useState(false);
  const [requireVerification, setRequireVerification] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState("Pending");

  // Required documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docQuery, setDocQuery] = useState("");
  const [docFilter, setDocFilter] = useState<"all" | "required" | "optional">("all");

  // Commission tiers
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tierQuery, setTierQuery] = useState("");

  // Payout
  const [payoutFrequency, setPayoutFrequency] = useState("Weekly");
  const [payoutThreshold, setPayoutThreshold] = useState(1000);

  // Order rules
  const [minOrderValue, setMinOrderValue] = useState(150);

  const loadFromServer = () => {
    setLoading(true);
    return getBusinessRules().then((data: BusinessRulesData) => {
      setAutoApprove(data.autoApproveBusinesses);
      setRequireVerification(data.requireVerification);
      setDefaultStatus(data.defaultBusinessStatus);
      setDocuments(data.documents);
      setTiers(data.tiers);
      setPayoutFrequency(data.payoutFrequency);
      setPayoutThreshold(data.payoutThreshold);
      setMinOrderValue(data.minOrderValue);
      setLoading(false);
    });
  };

  // Load settings from the database on mount
  useEffect(() => {
    let cancelled = false;
    getBusinessRules().then((data: BusinessRulesData) => {
      if (cancelled) return;
      setAutoApprove(data.autoApproveBusinesses);
      setRequireVerification(data.requireVerification);
      setDefaultStatus(data.defaultBusinessStatus);
      setDocuments(data.documents);
      setTiers(data.tiers);
      setPayoutFrequency(data.payoutFrequency);
      setPayoutThreshold(data.payoutThreshold);
      setMinOrderValue(data.minOrderValue);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveBusinessRules({
        autoApproveBusinesses: autoApprove,
        requireVerification,
        defaultBusinessStatus: defaultStatus,
        payoutFrequency,
        payoutThreshold,
        minOrderValue,
        documents: documents.map((d) => ({ id: d.id, name: d.name, required: d.required })),
        tiers: tiers.map((t) => ({ id: t.id, name: t.name, commission: t.commission })),
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.message);
      }
    });
  }

  function handleDiscard() {
    setError(null);
    loadFromServer();
  }

  // ---- documents ---------------------------------------------------------
  function toggleDocument(id: string) {
    setDocuments((docs) => docs.map((d) => (d.id === id ? { ...d, required: !d.required } : d)));
  }

  function updateDocumentName(id: string, value: string) {
    setDocuments((docs) => docs.map((d) => (d.id === id ? { ...d, name: value } : d)));
  }

  function removeDocument(id: string) {
    setDocuments((docs) => docs.filter((d) => d.id !== id));
  }

  function addDocument() {
    setDocQuery("");
    setDocFilter("all");
    setDocuments((docs) => [...docs, { id: crypto.randomUUID(), name: "New Document", required: false }]);
  }

  const visibleDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesQuery = d.name.toLowerCase().includes(docQuery.trim().toLowerCase());
      const matchesFilter =
        docFilter === "all" || (docFilter === "required" ? d.required : !d.required);
      return matchesQuery && matchesFilter;
    });
  }, [documents, docQuery, docFilter]);

  // ---- tiers ---------------------------------------------------------
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
    setTierQuery("");
    setTiers((t) => [...t, { id: crypto.randomUUID(), name: "New Tier", commission: 10 }]);
  }

  const visibleTiers = useMemo(() => {
    return tiers.filter((t) => t.name.toLowerCase().includes(tierQuery.trim().toLowerCase()));
  }, [tiers, tierQuery]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading business rules…</p>
      </div>
    );
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

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

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
                  className="input w-full sm:w-36"
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
            {/* search + filter */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={docQuery}
                  onChange={(e) => setDocQuery(e.target.value)}
                  className="input pl-8"
                />
              </div>
              <select
                className="input sm:w-36"
                value={docFilter}
                onChange={(e) => setDocFilter(e.target.value as typeof docFilter)}
              >
                <option value="all">All</option>
                <option value="required">Required</option>
                <option value="optional">Optional</option>
              </select>
            </div>

            <div className="space-y-1">
              {visibleDocuments.length === 0 && (
                <p className="py-2 text-sm text-slate-400">
                  {documents.length === 0 ? "No documents required yet — add one below." : "No documents match."}
                </p>
              )}
              {visibleDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-2 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3"
                >
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => updateDocumentName(doc.id, e.target.value)}
                    className="input flex-1"
                  />
                  <div className="flex items-center gap-2 self-end sm:self-auto">
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
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      aria-label="Remove document"
                      className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
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
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tiers..."
                value={tierQuery}
                onChange={(e) => setTierQuery(e.target.value)}
                className="input pl-8"
              />
            </div>

            <div className="space-y-3">
              {visibleTiers.length === 0 && (
                <p className="py-2 text-sm text-slate-400">
                  {tiers.length === 0 ? "No tiers yet — add one below." : "No tiers match."}
                </p>
              )}
              {visibleTiers.map((tier) => (
                <div key={tier.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTierName(tier.id, e.target.value)}
                    className="input flex-1"
                  />
                  <div className="flex items-center gap-2">
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
                      type="button"
                      onClick={() => removeTier(tier.id)}
                      aria-label="Remove tier"
                      className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
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
              <Field label="Minimum Payout Threshold">
                <input
                  type="number"
                  value={payoutThreshold}
                  onChange={(e) => setPayoutThreshold(Number(e.target.value))}
                  className="input"
                />
              </Field>
              <Field label="" full>
                <p className="text-xs text-slate-400">
                  Earnings below the threshold roll over to the next payout cycle.
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
            <Field label="Minimum Order Value">
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="input max-w-xs"
              />
            </Field>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 lg:px-8">
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
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isPending}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-60 sm:flex-none"
            >
              {isPending ? "Saving…" : "Save Changes"}
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
    <div className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
      {label && <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>}
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
