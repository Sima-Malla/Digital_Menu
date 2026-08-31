"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { signupAction, type SignupState } from "@/app/actions/signup";

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

  // Admin-only fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(businessTypes[0]);
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // User-only field
  const [userPhone, setUserPhone] = useState("");

  // Client-side validation state
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validateSingleField(name: string, val: string, currentRole: Role): string | null {
    const v = val.trim();
    if (name === "fullName") {
      if (!v) return "Full name is required.";
      if (v.length < 2) return "Full name must be at least 2 characters.";
      if (v.length > 80) return "Full name is too long.";
    }

    if (name === "email") {
      if (!v) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    }

    if (name === "password") {
      if (!val) return "Password is required.";
      if (val.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(val)) return "Password must include at least one uppercase letter.";
      if (!/[0-9]/.test(val)) return "Password must include at least one number.";
      if (!/[^A-Za-z0-9]/.test(val)) return "Password must include at least one special character (e.g. !@#$%).";
    }

    if (currentRole === "admin") {
      if (name === "businessName") {
        if (!v) return "Business name is required.";
        if (v.length < 2) return "Business name must be at least 2 characters.";
      }
      if (name === "businessAddress") {
        if (!v) return "Business address is required.";
        if (v.length < 5) return "Enter a full address (at least 5 characters).";
      }
      if (name === "businessPhone") {
        if (!v) return "Business phone number is required.";
        if (!/^\+?[0-9()\-.\s]{7,20}$/.test(v)) return "Enter a valid phone number.";
      }
    }

    if (currentRole === "user") {
      if (name === "phone") {
        if (!v) return "Phone number is required.";
        if (!/^\+?[0-9()\-.\s]{7,20}$/.test(v)) return "Enter a valid phone number.";
      }
    }

    return null;
  }

  function handleBlur(fieldName: string, value: string) {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const err = validateSingleField(fieldName, value, role);
    setClientErrors((prev) => {
      const next = { ...prev };
      if (err) next[fieldName] = err;
      else delete next[fieldName];
      return next;
    });
  }

  function handleChange(fieldName: string, value: string) {
    if (touched[fieldName]) {
      const err = validateSingleField(fieldName, value, role);
      setClientErrors((prev) => {
        const next = { ...prev };
        if (err) next[fieldName] = err;
        else delete next[fieldName];
        return next;
      });
    }
  }

  function validateAllFields(): boolean {
    const newErrors: Record<string, string> = {};

    const fnErr = validateSingleField("fullName", fullName, role);
    if (fnErr) newErrors.fullName = fnErr;

    const emErr = validateSingleField("email", email, role);
    if (emErr) newErrors.email = emErr;

    const pwErr = validateSingleField("password", password, role);
    if (pwErr) newErrors.password = pwErr;

    if (role === "admin") {
      const bnErr = validateSingleField("businessName", businessName, role);
      if (bnErr) newErrors.businessName = bnErr;

      const baErr = validateSingleField("businessAddress", businessAddress, role);
      if (baErr) newErrors.businessAddress = baErr;

      const bpErr = validateSingleField("businessPhone", businessPhone, role);
      if (bpErr) newErrors.businessPhone = bpErr;
    }

    if (role === "user") {
      const phErr = validateSingleField("phone", userPhone, role);
      if (phErr) newErrors.phone = phErr;
    }

    setClientErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      businessName: true,
      businessAddress: true,
      businessPhone: true,
      phone: true,
    });

    return Object.keys(newErrors).length === 0;
  }

  function handleRoleChange(newRole: Role) {
    setRole(newRole);
    setClientErrors({});
    setTouched({});
  }

  // Combine server & client error messages
  const serverFieldErrors = state.fieldErrors ?? {};
  const getFieldError = (name: string) => clientErrors[name] || serverFieldErrors[name];

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
          <img
            src="/logo.png"
            alt="MenuTap"
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
                  onClick={() => handleRoleChange(r.id)}
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

          <form
            action={(formData) => {
              if (validateAllFields()) {
                formAction(formData);
              }
            }}
            className="mt-7 space-y-5"
          >
            {/* Shared fields */}
            <input type="hidden" name="role" value={role} />

            <Field label="Full Name" error={getFieldError("fullName")}>
              <input
                name="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  handleChange("fullName", e.target.value);
                }}
                onBlur={(e) => handleBlur("fullName", e.target.value)}
                placeholder="John Doe"
                className={inputCls(getFieldError("fullName"))}
              />
            </Field>

            <Field label="Email Address" error={getFieldError("email")}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleChange("email", e.target.value);
                }}
                onBlur={(e) => handleBlur("email", e.target.value)}
                placeholder="john@example.com"
                className={inputCls(getFieldError("email"))}
              />
            </Field>

            <Field
              label="Password"
              error={getFieldError("password")}
              hint={!getFieldError("password") ? "At least 8 characters, with 1 uppercase letter, 1 number & 1 special character." : undefined}
            >
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleChange("password", e.target.value);
                }}
                onBlur={(e) => handleBlur("password", e.target.value)}
                placeholder="••••••••"
                className={inputCls(getFieldError("password"))}
              />
            </Field>

            {/* Admin-only fields */}
            {role === "admin" && (
              <>
                <Field label="Business Name" error={getFieldError("businessName")}>
                  <input
                    name="businessName"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      handleChange("businessName", e.target.value);
                    }}
                    onBlur={(e) => handleBlur("businessName", e.target.value)}
                    placeholder="The Golden Spoon"
                    className={inputCls(getFieldError("businessName"))}
                  />
                </Field>

                <Field label="Business Type" error={getFieldError("businessType")}>
                  <select
                    name="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className={inputCls(getFieldError("businessType"))}
                  >
                    {businessTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Business Address" error={getFieldError("businessAddress")}>
                  <input
                    name="businessAddress"
                    value={businessAddress}
                    onChange={(e) => {
                      setBusinessAddress(e.target.value);
                      handleChange("businessAddress", e.target.value);
                    }}
                    onBlur={(e) => handleBlur("businessAddress", e.target.value)}
                    placeholder="123 Culinary Ave, Suite 4"
                    className={inputCls(getFieldError("businessAddress"))}
                  />
                </Field>

                <Field label="Business Phone" error={getFieldError("businessPhone")}>
                  <input
                    type="tel"
                    name="businessPhone"
                    value={businessPhone}
                    onChange={(e) => {
                      setBusinessPhone(e.target.value);
                      handleChange("businessPhone", e.target.value);
                    }}
                    onBlur={(e) => handleBlur("businessPhone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls(getFieldError("businessPhone"))}
                  />
                </Field>

                <p className="text-xs text-neutral-400">
                  New businesses are reviewed and approved by a Super Admin before going live.
                </p>
              </>
            )}

            {/* User-only field */}
            {role === "user" && (
              <Field
                label="Phone Number"
                error={getFieldError("phone")}
                hint={!getFieldError("phone") ? "Used for order updates and to look up your past orders." : undefined}
              >
                <input
                  type="tel"
                  name="phone"
                  value={userPhone}
                  onChange={(e) => {
                    setUserPhone(e.target.value);
                    handleChange("phone", e.target.value);
                  }}
                  onBlur={(e) => handleBlur("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls(getFieldError("phone"))}
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