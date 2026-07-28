"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/login";

const dishImg = "/hotel1.png";

const initialState: LoginState = { success: true, message: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = () => {
    // Redirect to your OAuth entry point; the server resolves/creates the
    // account, determines its role, and redirects back into the right dashboard.
    window.location.href = "/api/auth/google";
  };

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

        <div className="absolute bottom-10 left-10 right-10 rounded-xl bg-orange-900/60 p-6 text-white backdrop-blur-sm">
          <UtensilsCrossed className="h-5 w-5 text-orange-300" />
          <p className="mt-3 italic leading-relaxed">
            &quot;The most intuitive management platform I&apos;ve used in
            twenty years of fine dining operations.&quot;
          </p>
          <p className="mt-3 text-sm font-semibold text-orange-200">
            — Julian Thorne, Executive Chef
          </p>
        </div>
      </div>

      {/* ─── Right: form panel ─── */}
      <div className="flex w-full flex-col justify-center bg-[#FAFAFA] px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-neutral-900">Welcome back</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your credentials to access your dashboard.
          </p>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            <GoogleIcon className="h-5 w-5" />
            Login with Google
          </button>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-semibold tracking-wide text-neutral-400">
              OR EMAIL
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          {!state.success && state.message && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-neutral-800">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  placeholder="alex@gourmetflow.com"
                  className="w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-neutral-800">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-orange-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600">
              <input type="checkbox" name="remember" className="h-4 w-4 rounded accent-orange-600" />
              Remember this device for 30 days
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            New to GourmetFlow?{" "}
            <Link href="/signup" className="font-semibold text-orange-600 hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-10 flex justify-center gap-6 text-xs text-neutral-400">
            <Link href="/privacy" className="hover:text-neutral-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-600">
              Terms of Service
            </Link>
            <Link href="/help" className="hover:text-neutral-600">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Google "G" icon ────────────────────────────────────── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}