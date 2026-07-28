"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { completeOnboardingAction, type OnboardingState } from "@/app/actions/onboarding";

const initialState: OnboardingState = { success: false, message: "" };

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(
    completeOnboardingAction,
    initialState
  );

  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F5] px-6">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-neutral-900">Credentials Updated</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Your new email and password have been saved. You&apos;ll be redirected to the
            login page to sign in with your new credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F5] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Welcome to MenuTap</h2>
            <p className="text-sm text-neutral-500">
              Set up your own credentials to secure your account.
            </p>
          </div>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          {!state.success && state.message && !Object.keys(errors).length && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Important:</strong> After saving, you&apos;ll be logged out and must sign
            in again with your new email and password. Your temporary credentials will no
            longer work.
          </div>

          <Field label="New Email Address" error={errors.email}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your-email@example.com"
              className={inputCls(errors.email)}
            />
          </Field>

          <Field
            label="New Password"
            error={errors.password}
            hint={!errors.password ? "Min 8 characters, 1 uppercase, 1 number, 1 special character" : undefined}
          >
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputCls(errors.password)}
            />
          </Field>

          <Field label="Confirm Password" error={errors.confirmPassword}>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputCls(errors.confirmPassword)}
            />
          </Field>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-orange-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Saving…" : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Shared bits ─────────────────────────────────────────── */
function inputCls(error?: string) {
  return `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:ring-1 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-400"
      : "border-neutral-200 focus:border-orange-400 focus:ring-orange-400"
  }`;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}