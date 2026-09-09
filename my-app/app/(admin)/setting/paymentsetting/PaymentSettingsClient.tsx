"use client";

import { useState, useTransition } from "react";
import {
  CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2, Clock,
} from "lucide-react";

import {
  togglePaymentMethodAction,
  saveGatewayAction,
  testGatewayConnectionAction,
  updatePaymentSettingsAction,
} from "@/app/actions/admin/payment-setting";
import type { PaymentSettingsData } from "@/lib/queries/payment-setting";

/* ─── Toggle Switch ───────────────────────────────────────── */

function Toggle({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Gateway badge (text-based — avoids reproducing brand marks) ── */

function GatewayBadge({ gatewayKey }: { gatewayKey: string }) {
  const styles: Record<string, string> = {
    esewa: "bg-emerald-600",
    fonepay: "bg-blue-600",
  };
  const label: Record<string, string> = { esewa: "eS", fonepay: "FP" };
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${styles[gatewayKey] ?? "bg-gray-500"}`}>
      {label[gatewayKey] ?? gatewayKey.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function PaymentSettingsClient({ initialData }: { initialData: PaymentSettingsData }) {
  const [methods, setMethods] = useState(initialData.methods);
  const [gateways, setGateways] = useState(initialData.gateways);
  const [settings, setSettings] = useState(initialData.settings);
  const [keyDrafts, setKeyDrafts] = useState<Record<string, { apiKey: string; secretKey: string }>>({});
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fireToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };
  const fireError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
  };

  const handleToggleMethod = (methodKey: string) => {
    const next = !methods.find((m) => m.methodKey === methodKey)?.enabled;
    setMethods((prev) => prev.map((m) => (m.methodKey === methodKey ? { ...m, enabled: next } : m)));
    startTransition(async () => {
      const res = await togglePaymentMethodAction(methodKey, next);
      if (!res.success) {
        setMethods((prev) => prev.map((m) => (m.methodKey === methodKey ? { ...m, enabled: !next } : m)));
        fireError(res.message ?? "Couldn't update that method.");
      }
    });
  };

  const handleToggleGateway = (gatewayKey: string) => {
    const next = !gateways.find((g) => g.gatewayKey === gatewayKey)?.enabled;
    setGateways((prev) => prev.map((g) => (g.gatewayKey === gatewayKey ? { ...g, enabled: next } : g)));
    startTransition(async () => {
      const res = await saveGatewayAction({ gatewayKey, enabled: next });
      if (!res.success) {
        setGateways((prev) => prev.map((g) => (g.gatewayKey === gatewayKey ? { ...g, enabled: !next } : g)));
        fireError(res.message ?? "Couldn't update that gateway.");
      }
    });
  };

  const handleSaveKeys = (gatewayKey: string) => {
    const draft = keyDrafts[gatewayKey];
    if (!draft) return;
    startTransition(async () => {
      const res = await saveGatewayAction({
        gatewayKey,
        enabled: gateways.find((g) => g.gatewayKey === gatewayKey)?.enabled ?? false,
        apiKey: draft.apiKey,
        secretKey: draft.secretKey,
      });
      if (res.success) {
        setGateways((prev) =>
          prev.map((g) =>
            g.gatewayKey === gatewayKey
              ? { ...g, hasApiKey: Boolean(draft.apiKey), hasSecretKey: Boolean(draft.secretKey), lastTestOk: null }
              : g
          )
        );
        setKeyDrafts((prev) => ({ ...prev, [gatewayKey]: { apiKey: "", secretKey: "" } }));
        fireToast(`${gatewayKey === "esewa" ? "eSewa" : "FonePay"} credentials saved.`);
      } else {
        fireError(res.message ?? "Couldn't save credentials.");
      }
    });
  };

  const handleTestConnection = (gatewayKey: string) => {
    startTransition(async () => {
      const res = await testGatewayConnectionAction(gatewayKey);
      setGateways((prev) =>
        prev.map((g) => (g.gatewayKey === gatewayKey ? { ...g, lastTestOk: res.success } : g))
      );
      if (res.success) fireToast("Connection verified.");
      else fireError(res.message ?? "Connection test failed.");
    });
  };

  const handleSaveSettings = () => {
    startTransition(async () => {
      const res = await updatePaymentSettingsAction(settings);
      if (res.success) fireToast("Payout settings saved.");
      else fireError(res.message ?? "Couldn't save payout settings.");
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1080px] px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
                <CreditCard className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Payment Settings</h1>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Configure how you accept payments and manage payouts
                </p>
              </div>
            </div>
          </div>

          {toast && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-[13px] font-medium text-green-700">{toast}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-[13px] font-medium text-red-700">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {/* Payment Methods */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">Payment Methods</h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Turn on the ways customers can pay at this business
              </p>
              <div className="flex flex-col gap-3">
                {methods.map((method) => (
                  <div
                    key={method.methodKey}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5"
                  >
                    <p className="text-[13px] font-semibold text-gray-800">{method.name}</p>
                    <Toggle enabled={method.enabled} onToggle={() => handleToggleMethod(method.methodKey)} disabled={isPending} />
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Gateways */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">Payment Gateways</h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Connect eSewa and FonePay to accept digital wallet payments
              </p>
              <div className="flex flex-col gap-4">
                {gateways.map((gateway) => {
                  const draft = keyDrafts[gateway.gatewayKey] ?? { apiKey: "", secretKey: "" };
                  const missingKeys = !gateway.hasApiKey || !gateway.hasSecretKey;
                  return (
                    <div key={gateway.gatewayKey} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <GatewayBadge gatewayKey={gateway.gatewayKey} />
                          <div>
                            <p className="text-[13px] font-semibold text-gray-800">{gateway.name}</p>
                            {gateway.lastTestOk === true && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                            )}
                            {gateway.lastTestOk === false && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500">
                                <XCircle className="h-3 w-3" /> Connection failed
                              </span>
                            )}
                            {gateway.lastTestOk === null && (
                              <span className="text-[11px] text-gray-400">Not tested yet</span>
                            )}
                          </div>
                        </div>
                        <Toggle
                          enabled={gateway.enabled}
                          onToggle={() => handleToggleGateway(gateway.gatewayKey)}
                          disabled={isPending}
                        />
                      </div>

                      {gateway.enabled && missingKeys && (
                        <p className="mt-3 text-[11px] font-medium text-amber-600">
                          Add your API key and secret key below to activate this gateway.
                        </p>
                      )}

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder={gateway.hasApiKey ? "Merchant / Public key •••• saved" : "Merchant / Public key"}
                          value={draft.apiKey}
                          onChange={(e) =>
                            setKeyDrafts((prev) => ({
                              ...prev,
                              [gateway.gatewayKey]: { ...draft, apiKey: e.target.value },
                            }))
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
                        />
                        <input
                          type="password"
                          placeholder={gateway.hasSecretKey ? "Secret key •••• saved" : "Secret key"}
                          value={draft.secretKey}
                          onChange={(e) =>
                            setKeyDrafts((prev) => ({
                              ...prev,
                              [gateway.gatewayKey]: { ...draft, secretKey: e.target.value },
                            }))
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isPending || (!draft.apiKey && !draft.secretKey)}
                          onClick={() => handleSaveKeys(gateway.gatewayKey)}
                          className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Save Keys
                        </button>
                        <button
                          type="button"
                          disabled={isPending || missingKeys}
                          onClick={() => handleTestConnection(gateway.gatewayKey)}
                          className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Test Connection
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Payout & Fee Settings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">Payout & Fee Settings</h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                How transaction fees and refunds are handled
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Transaction Fee (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={settings.transactionFee}
                      onChange={(e) => setSettings((s) => ({ ...s, transactionFee: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Refund Window (days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.refundWindowDays}
                      onChange={(e) => setSettings((s) => ({ ...s, refundWindowDays: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Who Pays the Transaction Fee?
                  </label>
                  <div className="flex gap-1.5">
                    {(["Business", "Customer"] as const).map((bearer) => (
                      <button
                        key={bearer}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, feeBearer: bearer }))}
                        className={`flex-1 rounded-lg py-2 text-[11px] font-semibold transition ${
                          settings.feeBearer === bearer
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {bearer}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">Automatic Refunds</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Refund eligible orders automatically within the window above
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.autoRefund}
                    onToggle={() =>
                      setSettings((s) => ({
                        ...s,
                        autoRefund: !s.autoRefund,
                        // Mutually exclusive with manual approval — see note below.
                        manualApproval: !s.autoRefund ? false : s.manualApproval,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">Manual Approval for Refunds</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Require an admin to approve refunds before they're issued
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.manualApproval}
                    onToggle={() =>
                      setSettings((s) => ({
                        ...s,
                        manualApproval: !s.manualApproval,
                        // Mutually exclusive with auto-refund — see note below.
                        autoRefund: !s.manualApproval ? false : s.autoRefund,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition-all duration-150 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Payout Settings
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}