"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { signupAction, type SignupState } from "@/app/actions/signup";

/* ─── ER-driven role config ──────────────────────────────────────────
   Staff  -> Staff_Name, Email, Password, Business_Id (via Invite_Code), Role(enum)
   Admin  -> Business_Admin.Name/Email/Password + new Business record
             (Business_Name, Business_Type, Address, Phone) pending
             Super Admin approval ("Approves" relationship)
   User   -> Customer.Name, Phone, Email, Password — the diner-facing
             role from the ER diagram, not tied to any single business

   Super Admin is intentionally NOT offered here: it's a platform-operator
   role, not a self-serve one. The first Super Admin should come from a
   DB seed/CLI script, and any additional ones should be invited from an
   internal Super Admin panel — never from this public signup page.
--------------------------------------------------------------------- */

type Role = "admin" | "user";

const roleTabs: { id: Role; label: string; icon: React.ElementType }[] = [
  { id: "admin", label: "Admin", icon: Building2 },
  { id: "user", label: "User", icon: ShieldCheck },
];

const businessTypes = ["Restaurant", "Hotel", "Cafe", "Bar / Lounge", "Cloud Kitchen"];

const heroImg =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&q=80";

const initialState: SignupState = { success: true, message: "" };

export default function SignupPage() {
  const [role, setRole] = useState<Role>("user");
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(signupAction, initialState);

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Admin-only (creates the Business record)
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(businessTypes[0]);
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // User-only (maps to the Customer entity)
  const [userPhone, setUserPhone] = useState("");

  const errors = state.fieldErrors ?? {};

  return (
    <div className="flex min-h-screen">
      {/* ─── Left: image collage panel ─── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-black lg:sticky lg:top-0 lg:block lg:h-screen">
        <div className="grid h-full grid-cols-2 grid-rows-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative">
              <Image src={heroImg} alt="Kitchen team plating a dish" fill className="object-cover" priority={i === 0} />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />

        <Link href="/" className="absolute left-8 top-8 z-10 inline-flex items-center rounded-lg bg-white shadow">
          <Image
            src="/logo.png"
            alt="MenuTap"
            width={120}
            height={30}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <div className="absolute bottom-10 left-8 right-8 text-white">
          <h1 className="text-4xl font-extrabold leading-tight">
            Empowering the future of hospitality.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/85">
            Join over 5,000+ businesses using MenuTap to streamline operations,
            manage talent, and deliver unforgettable dining experiences.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["JD", "AM", "RK"].map((initials) => (
                <div
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-orange-500 text-[10px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-xs font-medium text-white/80">Joined by 120+ teams this week</span>
          </div>
        </div>
      </div>

      {/* ─── Right: form panel ─── */}
      <div className="flex w-full flex-col justify-center bg-[#FFF8F5] px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Select your role to get started with MenuTap
          </p>

          {/* Role tabs */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {roleTabs.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition ${
                    active
                      ? "border-orange-500 bg-orange-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-bold text-neutral-800">{r.label}</span>
                </button>
              );
            })}
          </div>

          {!state.success && state.message && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          <form action={formAction} className="mt-7 space-y-5">
            {/* Shared fields */}
            <input type="hidden" name="role" value={role} />

            <Field label="Full Name" error={errors.fullName}>
              <input
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={inputCls(errors.fullName)}
              />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={inputCls(errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password} hint={!errors.password ? "At least 8 characters, with a letter and a number." : undefined}>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls(errors.password)}
              />
            </Field>

            {/* Admin-only fields — these create the Business record */}
            {role === "admin" && (
              <>
                <Field label="Business Name" error={errors.businessName}>
                  <input
                    name="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="The Golden Spoon"
                    className={inputCls(errors.businessName)}
                  />
                </Field>

                <Field label="Business Type" error={errors.businessType}>
                  <select
                    name="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className={inputCls(errors.businessType)}
                  >
                    {businessTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Business Address" error={errors.businessAddress}>
                  <input
                    name="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="123 Culinary Ave, Suite 4"
                    className={inputCls(errors.businessAddress)}
                  />
                </Field>

                <Field label="Business Phone" error={errors.businessPhone}>
                  <input
                    type="tel"
                    name="businessPhone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls(errors.businessPhone)}
                  />
                </Field>

                <p className="text-xs text-neutral-400">
                  New businesses are reviewed and approved by a Super Admin before going live.
                </p>
              </>
            )}

            {/* User-only field — maps to the Customer entity */}
            {role === "user" && (
              <Field
                label="Phone Number"
                error={errors.phone}
                hint={!errors.phone ? "Used for order updates and to look up your past orders." : undefined}
              >
                <input
                  type="tel"
                  name="phone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls(errors.phone)}
                />
              </Field>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-orange-600 hover:underline">
              Log in
            </Link>
          </p>

          <div className="mt-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
              Trusted by
            </p>
            <div className="mt-3 flex items-center justify-center gap-8 text-neutral-400">
              <span className="text-sm font-semibold italic">CuisinePro</span>
              <span className="text-sm font-semibold italic">GrandLuxe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared bits ─────────────────────────────────────────── */
function inputCls(error?: string) {
  return `w-full rounded-lg border bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:ring-1 ${
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
      <label className="mb-1.5 block text-sm font-semibold text-neutral-800">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}