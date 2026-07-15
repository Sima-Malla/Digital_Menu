"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import SettingsSidebar from "@/components/HotelAdmin/settingSidebar";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState } from "react";

/* ─── Payment Brand SVG Icons ─────────────────────────────── */

function VisaIcon({ className = "h-8 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="6" fill="#1A1F71" />
      <path d="M19.2 21.6H16.8L18.4 11.2H20.8L19.2 21.6Z" fill="white" />
      <path
        d="M28 11.4C27.4 11.2 26.4 10.9 25.2 10.9C22.8 10.9 21.1 12.2 21.1 13.9C21.1 15.2 22.3 15.9 23.2 16.3C24.1 16.7 24.4 17 24.4 17.4C24.4 18 23.6 18.3 22.9 18.3C21.9 18.3 21.3 18.1 20.5 17.8L20.2 17.7L19.9 19.8C20.6 20.1 21.9 20.4 23.2 20.4C25.8 20.4 27.5 19.1 27.5 17.3C27.5 16.3 26.9 15.5 25.5 14.8C24.7 14.4 24.2 14.1 24.2 13.7C24.2 13.3 24.7 12.9 25.5 12.9C26.3 12.9 26.9 13.1 27.4 13.3L27.6 13.4L28 11.4Z"
        fill="white"
      />
      <path
        d="M33.6 11.2H31.7C31.1 11.2 30.7 11.4 30.5 11.9L27 21.6H29.6L30.1 20.1H33.2L33.5 21.6H35.8L33.6 11.2ZM30.8 18.1C31 17.5 31.8 15.2 31.8 15.2C31.8 15.2 32 14.6 32.2 14.2L32.4 15.1C32.4 15.1 32.9 17.5 33 18.1H30.8Z"
        fill="white"
      />
      <path
        d="M14.5 11.2L12.1 18.5L11.8 17.1C11.3 15.4 9.7 13.5 7.9 12.6L10.1 21.6H12.7L17.1 11.2H14.5Z"
        fill="white"
      />
      <path
        d="M9.8 11.2H6L6 11.4C8.9 12.1 10.9 13.9 11.8 17.1L11 11.9C10.9 11.4 10.5 11.2 9.8 11.2Z"
        fill="#F9A533"
      />
    </svg>
  );
}

function MastercardIcon({ className = "h-8 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="6" fill="#1A1F71" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path
        d="M24 9.7C25.8 11 27 13.1 27 15.5C27 17.9 25.8 20 24 21.3C22.2 20 21 17.9 21 15.5C21 13.1 22.2 11 24 9.7Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function ApplePayIcon({ className = "h-8 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="6" fill="black" />
      <path
        d="M20.4 10.5C20.8 10 21.1 9.3 21 8.6C20.4 8.6 19.7 9 19.2 9.5C18.8 10 18.4 10.7 18.5 11.4C19.2 11.4 19.9 11 20.4 10.5Z"
        fill="white"
      />
      <path
        d="M23.8 18.8C23.8 20.6 26 21.3 26 21.3C26 21.3 25.5 23.2 24 23.2C23.2 23.2 22.7 22.8 22.1 22.8C21.5 22.8 20.8 23.3 20.1 23.3C18.6 23.3 17 21.9 17 19.4C17 16.9 18.9 15.3 20.5 15.3C21.2 15.3 21.8 15.8 22.3 15.8C22.8 15.8 23.5 15.2 24.4 15.3C24.8 15.3 26 15.4 26.8 16.6C26.7 16.7 24.8 17.7 24.8 19.9L23.8 18.8Z"
        fill="white"
      />
      <text
        x="29"
        y="20.5"
        fill="white"
        fontSize="7.5"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
        letterSpacing="0.5"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePayIcon({ className = "h-8 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="6" fill="#1A1F71" />
      <path d="M20 16C20 15.4 20.1 14.9 20.2 14.4H15.5V17.4H18.1C17.9 18.3 17.4 19 16.7 19.5V21.3H18.4C19.5 20.2 20 18.8 20 16Z" fill="#4285F4" />
      <path d="M15.5 22.6C17 22.6 18.2 22.1 19.1 21.3L17.4 19.5C16.9 19.9 16.3 20.1 15.5 20.1C14.1 20.1 12.9 19.1 12.5 17.8H10.7V19.6C11.6 21.4 13.4 22.6 15.5 22.6Z" fill="#34A853" />
      <path d="M12.5 17.8C12.3 17.2 12.2 16.6 12.2 16C12.2 15.4 12.3 14.8 12.5 14.2V12.4H10.7C10.1 13.5 9.7 14.7 9.7 16C9.7 17.3 10.1 18.5 10.7 19.6L12.5 17.8Z" fill="#FBBC05" />
      <path d="M15.5 11.9C16.4 11.9 17.2 12.2 17.8 12.8L19.3 11.3C18.2 10.3 17 9.7 15.5 9.7C13.4 9.7 11.6 10.9 10.7 12.7L12.5 14.5C12.9 13.2 14.1 12.2 15.5 11.9Z" fill="#EA4335" />
      <text
        x="22.5"
        y="20.5"
        fill="white"
        fontSize="7"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
        letterSpacing="0.3"
      >
        Pay
      </text>
    </svg>
  );
}

/* ─── Toggle Switch ───────────────────────────────────────── */

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
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

/* ─── Page ────────────────────────────────────────────────── */

export default function PaymentSettingsPage() {
  const [visa, setVisa] = useState(true);
  const [mastercard, setMastercard] = useState(true);
  const [applePay, setApplePay] = useState(true);
  const [googlePay, setGooglePay] = useState(false);
  const [autoPayout, setAutoPayout] = useState(true);
  const [serviceFee, setServiceFee] = useState(false);
  const [fraudProtection, setFraudProtection] = useState(true);

  const paymentMethods = [
    {
      name: "Visa Cards",
      desc: "Accept all Visa debit & credit cards",
      Icon: VisaIcon,
      enabled: visa,
      onToggle: () => setVisa(!visa),
    },
    {
      name: "Mastercard",
      desc: "Accept all Mastercard debit & credit cards",
      Icon: MastercardIcon,
      enabled: mastercard,
      onToggle: () => setMastercard(!mastercard),
    },
    {
      name: "Apple Pay",
      desc: "Accept contactless Apple Pay payments",
      Icon: ApplePayIcon,
      enabled: applePay,
      onToggle: () => setApplePay(!applePay),
    },
    {
      name: "Google Pay",
      desc: "Accept contactless Google Pay payments",
      Icon: GooglePayIcon,
      enabled: googlePay,
      onToggle: () => setGooglePay(!googlePay),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
     

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
                <CreditCard className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Payment Settings
                </h1>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Configure how you accept payments and manage payouts
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Accepted Payment Methods */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Accepted Payment Methods
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Toggle the payment methods you want to accept from customers
              </p>

              <div className="flex flex-col gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3.5">
                      <method.Icon className="h-8 w-12 shrink-0" />
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">
                          {method.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {method.desc}
                        </p>
                      </div>
                    </div>
                    <Toggle enabled={method.enabled} onToggle={method.onToggle} />
                  </div>
                ))}
              </div>
            </section>

            {/* Payout Account */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Payout Account
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Your earnings will be deposited to this bank account
              </p>

              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Bank Name
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-gray-800">
                      Chase Business Banking
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Account Number
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-gray-800 tracking-wider">
                      •••• •••• •••• 4492
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Status
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-500"
                        strokeWidth={2.5}
                      />
                      <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <button className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    Change Account
                  </button>
                </div>
              </div>
            </section>

            {/* Automatic Payouts */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-[14px] font-bold text-gray-900">
                    Automatic Payouts
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Automatically transfer your earnings every day at 12:00 PM
                  </p>
                </div>
                <Toggle
                  enabled={autoPayout}
                  onToggle={() => setAutoPayout(!autoPayout)}
                />
              </div>
              {autoPayout && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3.5 py-2.5">
                  <Clock
                    className="h-3.5 w-3.5 text-blue-500 shrink-0"
                    strokeWidth={2}
                  />
                  <p className="text-[11px] text-blue-600 font-medium">
                    Next payout scheduled for tomorrow at 12:00 PM
                  </p>
                </div>
              )}
            </section>

            {/* Service Fee + Fraud Protection */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[14px] font-bold text-gray-900">
                      Service Fee Pass-through
                    </h2>
                    <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
                      Pass payment processing fees to customers
                    </p>
                  </div>
                  <Toggle
                    enabled={serviceFee}
                    onToggle={() => setServiceFee(!serviceFee)}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold text-gray-900">
                        Fraud Protection
                      </h2>
                      {fraudProtection && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                          <ShieldCheck
                            className="h-2.5 w-2.5"
                            strokeWidth={2.5}
                          />
                          Shield Active
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
                      AI-powered fraud detection for transactions
                    </p>
                  </div>
                  <Toggle
                    enabled={fraudProtection}
                    onToggle={() => setFraudProtection(!fraudProtection)}
                  />
                </div>
              </section>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 pb-10">
              <button
                type="button"
                className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-gray-600 transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
              >
                Discard Changes
              </button>
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition-all duration-150 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-200/60"
              >
                Save Payment Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}