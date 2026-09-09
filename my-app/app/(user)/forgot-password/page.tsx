"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "@/app/actions/forgot-password";

const dishImg = "/hotel1.png";

const initialState: ForgotPasswordState = { success: false, message: "" };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordState,
    FormData
  >(forgotPasswordAction, initialState);

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
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-orange-600 mb-8 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <KeyRound className="h-6 w-6" />
          </div>

          <h2 className="text-3xl font-extrabold text-neutral-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            No worries! Enter your account email address below and we&apos;ll send you instructions to reset your password.
          </p>

          {state.success ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-950">
                      Reset Link Prepared
                    </h3>
                    <p className="mt-1 text-sm text-emerald-800">
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>

              {state.resetUrl && (
                <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-5 space-y-3">
                  <span className="inline-block rounded bg-orange-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-orange-800">
                    Dev / Preview Mode
                  </span>
                  <p className="text-xs text-orange-950 leading-relaxed">
                    Since live SMTP is optional in dev, you can use the direct reset link below to complete your password reset immediately:
                  </p>
                  <Link
                    href={state.resetUrl}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700 transition"
                  >
                    Proceed to Reset Password
                  </Link>
                </div>
              )}

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-orange-600 hover:underline"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="mt-8 space-y-5">
              {!state.success && state.message && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {state.message}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-neutral-800"
                >
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="alex@gourmetflow.com"
                    className="w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>
          )}

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
