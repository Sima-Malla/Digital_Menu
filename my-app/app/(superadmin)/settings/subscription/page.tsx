"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Layers,
  Clock,
  Receipt,
  ShieldAlert,
  Plus,
  Trash2,
  Check,
  Search,
} from "lucide-react";
import {
  getSubscriptionPlans,
  createPlan,
  updatePlan as updatePlanAction,
  deletePlan,
  setDefaultPlan,
  getSubscriptionSettings,
  updateSubscriptionSettings,
} from "@/app/actions/superadmin/subscription";

interface Plan {
  id: string;
  name: string;
  price: number;
  cycle: "Monthly" | "Yearly";
  isDefault: boolean;
}

type CycleFilter = "all" | "Monthly" | "Yearly";

export default function SubscriptionSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planSearch, setPlanSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("all");

  // Trial
  const [trialEnabled, setTrialEnabled] = useState(true);
  const [trialDays, setTrialDays] = useState(14);
  const [requireCardForTrial, setRequireCardForTrial] = useState(false);

  // Billing & invoicing
  const [taxRate, setTaxRate] = useState(13);
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(true);

  // Grace period
  const [gracePeriodDays, setGracePeriodDays] = useState(5);
  const [sendReminders, setSendReminders] = useState(true);
  const [autoSuspend, setAutoSuspend] = useState(true);

  useEffect(() => {
    (async () => {
      const [pls, settings] = await Promise.all([getSubscriptionPlans(), getSubscriptionSettings()]);
      setPlans(
        pls.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          price: Number(p.price),
          cycle: p.cycle as Plan["cycle"],
          isDefault: p.isDefault,
        }))
      );
      setTrialEnabled(settings.trialEnabled);
      setTrialDays(settings.trialDays);
      setRequireCardForTrial(settings.requireCardForTrial);
      setTaxRate(Number(settings.taxRate));
      setInvoicePrefix(settings.invoicePrefix);
      setAutoGenerateInvoice(settings.autoGenerateInvoice);
      setGracePeriodDays(settings.gracePeriodDays);
      setSendReminders(settings.sendReminders);
      setAutoSuspend(settings.autoSuspend);
      setLoading(false);
    })();
  }, []);

  const filteredPlans = useMemo(() => {
    const q = planSearch.trim().toLowerCase();
    return plans.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesCycle = cycleFilter === "all" || p.cycle === cycleFilter;
      return matchesSearch && matchesCycle;
    });
  }, [plans, planSearch, cycleFilter]);

  function updatePlanField<K extends keyof Plan>(id: string, field: K, value: Plan[K]) {
    setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function handleSetDefault(id: string) {
    setPlans((ps) => ps.map((p) => ({ ...p, isDefault: p.id === id })));
    startTransition(async () => {
      await setDefaultPlan(BigInt(id));
    });
  }

  function handleRemovePlan(id: string) {
    const removed = plans.find((p) => p.id === id);
    setPlans((ps) => ps.filter((p) => p.id !== id));
    startTransition(async () => {
      const res = await deletePlan(BigInt(id));
      if (res.error && removed) {
        // couldn't delete (e.g. it's the default plan) — restore it
        setPlans((ps) => [...ps, removed]);
      }
    });
  }

  function handleAddPlan() {
    startTransition(async () => {
      const res = await createPlan({ name: "New Plan", price: 0, cycle: "Monthly" });
      if (res.data) {
        setPlans((ps) => [...ps, { id: res.data!.id, name: "New Plan", price: 0, cycle: "Monthly", isDefault: false }]);
      }
    });
  }

  function handleSave() {
    startTransition(async () => {
      await updateSubscriptionSettings({
        trialEnabled,
        trialDays,
        requireCardForTrial,
        taxRate,
        invoicePrefix,
        autoGenerateInvoice,
        gracePeriodDays,
        sendReminders,
        autoSuspend,
      });

      for (const plan of plans) {
        await updatePlanAction(BigInt(plan.id), {
          name: plan.name,
          price: plan.price,
          cycle: plan.cycle,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading subscription settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Subscription
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan tiers, trial period, billing, and grace period for the platform's own subscription.
          </p>
        </div>

        <div className="space-y-6">
          {/* Plan Tiers */}
          <Card
            title="Plan Tiers"
            icon={Layers}
            description="Subscription plans available to businesses on the platform."
          >
            <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  placeholder="Search plans..."
                  className="input pl-8"
                />
              </div>
              <select
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value as CycleFilter)}
                className="input w-full sm:w-40"
              >
                <option value="all">All Cycles</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="hidden grid-cols-[1fr_120px_130px_90px_36px] gap-3 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:grid">
                <span>Plan Name</span>
                <span>Price</span>
                <span>Billing Cycle</span>
                <span>Default</span>
                <span />
              </div>

              {filteredPlans.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No plans match your search.</p>
              ) : (
                filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="grid grid-cols-1 items-center gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_120px_130px_90px_36px] sm:bg-transparent sm:p-0"
                  >
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updatePlanField(plan.id, "name", e.target.value)}
                      className="input"
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        NPR
                      </span>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => updatePlanField(plan.id, "price", Number(e.target.value))}
                        className="input pl-10"
                        style={{ paddingLeft: "2.5rem" }}
                      />
                    </div>
                    <select
                      value={plan.cycle}
                      onChange={(e) => updatePlanField(plan.id, "cycle", e.target.value as Plan["cycle"])}
                      className="input"
                    >
                      <option>Monthly</option>
                      <option>Yearly</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSetDefault(plan.id)}
                      className={`flex items-center justify-center rounded-lg py-2 text-xs font-medium transition-colors ${
                        plan.isDefault
                          ? "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200"
                          : "bg-white text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {plan.isDefault ? "Default" : "Set default"}
                    </button>
                    <button
                      onClick={() => handleRemovePlan(plan.id)}
                      aria-label="Remove plan"
                      className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 sm:justify-self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}

              <button
                onClick={handleAddPlan}
                disabled={isPending}
                className="mt-1 flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-60"
              >
                <Plus size={15} />
                Add plan
              </button>
            </div>
          </Card>

          {/* Trial Period */}
          <Card
            title="Trial Period"
            icon={Clock}
            description="Let new businesses try a paid plan before committing."
          >
            <div className="divide-y divide-slate-100">
              <SettingRow label="Enable Free Trial">
                <Toggle checked={trialEnabled} onChange={() => setTrialEnabled((v) => !v)} />
              </SettingRow>
              <SettingRow label="Trial Length (days)">
                <input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  disabled={!trialEnabled}
                  className="input w-24 disabled:opacity-50"
                />
              </SettingRow>
              <SettingRow
                label="Require Card to Start Trial"
                description="Businesses must add a payment method before the trial begins."
              >
                <Toggle
                  checked={requireCardForTrial}
                  onChange={() => setRequireCardForTrial((v) => !v)}
                />
              </SettingRow>
            </div>
          </Card>

          {/* Billing & Invoicing */}
          <Card
            title="Billing & Invoicing"
            icon={Receipt}
            description="Tax and invoice settings applied to subscription billing."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Tax Rate (%)">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="input"
                />
              </Field>
              <Field label="Invoice Number Prefix">
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="input"
                />
              </Field>
              <div className="sm:col-span-2">
                <SettingRow
                  label="Auto-generate Invoices"
                  description="Create and send an invoice automatically on every billing cycle."
                >
                  <Toggle
                    checked={autoGenerateInvoice}
                    onChange={() => setAutoGenerateInvoice((v) => !v)}
                  />
                </SettingRow>
              </div>
            </div>
          </Card>

          {/* Grace Period */}
          <Card
            title="Grace Period"
            icon={ShieldAlert}
            description="What happens when a business's subscription payment fails."
          >
            <div className="divide-y divide-slate-100">
              <SettingRow label="Grace Period (days)">
                <input
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
              <SettingRow
                label="Send Payment Reminders"
                description="Notify the business by email during the grace period."
              >
                <Toggle checked={sendReminders} onChange={() => setSendReminders((v) => !v)} />
              </SettingRow>
              <SettingRow
                label="Auto-suspend After Grace Period"
                description="Suspend the business account if payment still hasn't been made."
              >
                <Toggle checked={autoSuspend} onChange={() => setAutoSuspend((v) => !v)} />
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
              disabled={isPending}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
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
