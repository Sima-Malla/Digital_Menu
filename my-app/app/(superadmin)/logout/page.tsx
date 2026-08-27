"use client";

import { useState } from "react";
import { LogOut, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/logout";

export default function SuperAdminLogoutPage() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <LogOut className="h-7 w-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Log Out of Super Admin
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Are you sure you want to end your current session? You will need to log in again to access the admin console.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Yes, Log Out
              </>
            )}
          </button>

          <Link
            href="/superdashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-orange-500" />
          <span>Secure Super Admin Console</span>
        </div>
      </div>
    </div>
  );
}
