"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Percent,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from "lucide-react";

interface Gateway {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  secretKey: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

export default function PaymentSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Gateways
  const [gateways, setGateways] = useState<Gateway[]>([
    { id: "esewa", name: "eSewa", enabled: true, apiKey: "esewa_live_••••••3F2A", secretKey: "••••••••••••" },
    { id: "khalti", name: "Khalti", enabled: true, apiKey: "khalti_live_••••••91B0", secretKey: "••••••••••••" },
    { id: "stripe", name: "Stripe", enabled: false, apiKey: "", secretKey: "" },
  ]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, "success" | "failed">>({});

  // Supported payment methods
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: "cod", name: "Cash on Delivery", enabled: true },
    { id: "wallet", name: "Digital Wallet (eSewa / Khalti)", enabled: true },
    { id: "card", name: "Credit / Debit Card", enabled: false },
    { id: "bank", name: "Direct Bank Transfer", enabled: false },
  ]);

  // Transaction fees
  const [transactionFee, setTransactionFee] = useState(2.5);
  const [feeBearer, setFeeBearer] = useState("Business");

  // Refund policy
  const [autoRefund, setAutoRefund] = useState(true);
  const [refundWindow, setRefundWindow] = useState(7);
  const [manualApproval, setManualApproval] = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleGateway(id: string) {
    setGateways((gs) => gs.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));
  }

  function updateGatewayField(id: string, field: "apiKey" | "secretKey", value: string) {
    setGateways((gs) => gs.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  }

  function toggleReveal(id: string) {
    setRevealedKeys((r) => ({ ...r, [id]: !r[id] }));
  }

  function testConnection(id: string) {
    setTestingId(id);
    setTestResult((r) => {
      const next = { ...r };
      delete next[id];
      return next;
    });
    setTimeout(() => {
      setTestingId(null);
      setTestResult((r) => ({ ...r, [id]: "success" }));
    }, 1200);
  }

  function toggleMethod(id: string) {
    setMethods((ms) => ms.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Payment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Payment gateways, supported methods, transaction fees, and refund policy.
          </p>
        </div>

        <div className="space-y-6">
          {/* Payment Gateways */}
          <Card
            title="Payment Gateways"
            icon={CreditCard}
            description="Connect and configure the payment providers used across the platform."
          >
            <div className="space-y-5 divide-y divide-slate-100">
              {gateways.map((gw) => (
                <div key={gw.id} className="pt-5 first:pt-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          gw.enabled ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <p className="text-sm font-medium text-slate-800">{gw.name}</p>
                    </div>
                    <Toggle checked={gw.enabled} onChange={() => toggleGateway(gw.id)} />
                  </div>

                  {gw.enabled && (
                    <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                      <Field label="API Key">
                        <div className="relative">
                          <input
                            type={revealedKeys[gw.id] ? "text" : "password"}
                            value={gw.apiKey}
                            onChange={(e) => updateGatewayField(gw.id, "apiKey", e.target.value)}
                            placeholder="Enter API key"
                            className="input pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => toggleReveal(gw.id)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label="Toggle key visibility"
                          >
                            {revealedKeys[gw.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </Field>
                      <Field label="Secret Key">
                        <input
                          type="password"
                          value={gw.secretKey}
                          onChange={(e) => updateGatewayField(gw.id, "secretKey", e.target.value)}
                          placeholder="Enter secret key"
                          className="input"
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => testConnection(gw.id)}
                          disabled={testingId === gw.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {testingId === gw.id && <Loader2 size={13} className="animate-spin" />}
                          {testingId === gw.id ? "Testing..." : "Test Connection"}
                        </button>
                        {testResult[gw.id] === "success" && (
                          <span className="ml-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <Check size={13} /> Connected
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Supported Payment Methods */}
          <Card
            title="Supported Payment Methods"
            icon={Wallet}
            description="Choose which payment methods customers can use at checkout."
          >
            <div className="divide-y divide-slate-100">
              {methods.map((m) => (
                <SettingRow key={m.id} label={m.name}>
                  <Toggle checked={m.enabled} onChange={() => toggleMethod(m.id)} />
                </SettingRow>
              ))}
            </div>
          </Card>

          {/* Transaction Fees */}
          <Card
            title="Transaction Fees"
            icon={Percent}
            description="Fee applied on top of each transaction processed through the platform."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Transaction Fee (%)">
                <input
                  type="number"
                  step="0.1"
                  value={transactionFee}
                  onChange={(e) => setTransactionFee(Number(e.target.value))}
                  className="input"
                />
              </Field>
              <Field label="Fee Charged To">
                <select
                  value={feeBearer}
                  onChange={(e) => setFeeBearer(e.target.value)}
                  className="input"
                >
                  <option>Business</option>
                  <option>Customer</option>
                  <option>Split Equally</option>
                </select>
              </Field>
            </div>
          </Card>

          {/* Refund Policy */}
          <Card
            title="Refund Policy"
            icon={RotateCcw}
            description="Rules that govern how refunds are processed on the platform."
          >
            <div className="divide-y divide-slate-100">
              <SettingRow
                label="Enable Auto-Refunds"
                description="Automatically refund failed or cancelled orders without manual review."
              >
                <Toggle checked={autoRefund} onChange={() => setAutoRefund((v) => !v)} />
              </SettingRow>
              <SettingRow label="Refund Window (days)">
                <input
                  type="number"
                  value={refundWindow}
                  onChange={(e) => setRefundWindow(Number(e.target.value))}
                  className="input w-24"
                />
              </SettingRow>
              <SettingRow
                label="Require Manual Approval for Large Refunds"
                description="Refunds above a set threshold need admin approval before processing."
              >
                <Toggle checked={manualApproval} onChange={() => setManualApproval((v) => !v)} />
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
