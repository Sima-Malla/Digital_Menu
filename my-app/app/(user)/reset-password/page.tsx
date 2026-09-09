"use client";

import { useActionState, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/app/actions/reset-password";

const dishImg = "/hotel1.png";

const initialState: ResetPasswordState = { success: false, message: "" };

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction, initialState);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token && !state.success) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
          <h3 className="font-bold text-lg text-amber-950">Invalid Reset Request</h3>
        </div>
        <p className="text-sm text-amber-800">
          No password reset token was provided in the link. Please check your email or request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div>
      {state.success ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-6 text-emerald-900 shadow-sm">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg text-emerald-950">
                  Password Reset Complete!
                </h3>
                <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
                  {state.message}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm hover:bg-orange-600 transition"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="token" value={token} />

          {state.message && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold text-neutral-800"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-semibold text-neutral-800"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Updating Password..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* ─── Left: image collage panel ─── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-black lg:block">
        <div className="grid h-full grid-cols-2 grid-rows-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative">
              <Image
                src={dishImg}
                alt="Fine dining dish"
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

        <div className="absolute left-10 top-10 max-w-md text-white">
          <h1 className="text-4xl font-extrabold tracking-tight">GourmetFlow</h1>
          <p className="mt-3 text-sm text-white/85">
            Streamlining the world&apos;s finest culinary supply chains with
            precision and passion.
          </p>
        </div>
      </div>

      {/* ─── Right: form panel ─── */}
      <div className="flex w-full flex-col justify-center bg-[#FAFAFA] px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h2 className="text-3xl font-extrabold text-neutral-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-neutral-500 mb-8">
            Please enter your new password below.
          </p>

          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-12 flex justify-center gap-6 text-xs text-neutral-400">
            <Link href="/privacy" className="hover:text-neutral-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
