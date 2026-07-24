"use client";
import { useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Eye,
  EyeOff,
  Check,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from "lucide-react";

type StaffRole = "Waiter" | "Chef" | "Manager";

/* ─── Mock signed-in staff (replace with real auth/session data) ───────── */
const currentStaff = {
  name: "Jyoti Kunwar",
  staffId: "STF-0142",
  role: "Waiter" as StaffRole,
  phone: "98XXXXXXXX",
  email: "jyoti@email.com",
  photo: "/vegmomo.jpg",
};

/* ─── Role-specific notification sets ───────────────────────────────── */
const ROLE_NOTIFICATIONS: Record<StaffRole, { key: string; label: string }[]> = {
  Chef: [
    { key: "newKitchenOrder", label: "New Kitchen Order" },
    { key: "delayedOrder", label: "Delayed Order" },
    { key: "orderReady", label: "Order Ready" },
  ],
  Waiter: [
    { key: "newTableOrder", label: "New Table Order" },
    { key: "orderReady", label: "Order Ready" },
    { key: "roomService", label: "Room Service" },
  ],
  Manager: [
    { key: "newTableOrder", label: "New Table / Room Order" },
    { key: "delayedOrder", label: "Delayed Order" },
    { key: "orderReady", label: "Order Ready" },
    { key: "dailyReport", label: "Daily Report Summary" },
  ],
};

export default function StaffSettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dark = theme === "dark";

  const [editingProfile, setEditingProfile] = useState(false);
  const [phone, setPhone] = useState(currentStaff.phone);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [onDuty, setOnDuty] = useState(true);

  const notificationKeys = ROLE_NOTIFICATIONS[currentStaff.role];
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationKeys.map((n) => [n.key, true]))
  );
  const [soundOn, setSoundOn] = useState(true);

  function toggleNotif(key: string) {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function handleChangePassword() {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    // Wire this up to your real change-password API call.
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 2000);
  }

  /* ─── Theme-aware class tokens ─────────────────────────── */
  const t = {
    page: dark ? "bg-gray-950" : "bg-gray-50",
    card: dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100",
    heading: dark ? "text-white" : "text-gray-900",
    subtext: dark ? "text-gray-400" : "text-gray-400",
    label: dark ? "text-gray-500" : "text-gray-400",
    text: dark ? "text-gray-200" : "text-gray-800",
    body: dark ? "text-gray-300" : "text-gray-700",
    inputBg: dark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-700",
    divider: dark ? "border-gray-800" : "border-gray-50",
  };

  return (
    <div className={`min-h-screen ${t.page} pb-16 transition-colors duration-200`}>
      <main className="max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-6">
          <h1 className={`text-2xl font-extrabold sm:text-3xl ${t.heading}`}>Settings</h1>
          <p className={`mt-1 text-sm ${t.subtext}`}>Manage your account and notification preferences.</p>
        </div>

        <div className="flex flex-col gap-5">
          {/* My Profile */}
          <Section title="My Profile" t={t}>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
                <Image src={currentStaff.photo} alt={currentStaff.name} fill className="object-cover" />
              </div>
              {editingProfile && (
                <label
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-xs font-semibold hover:border-orange-300 ${
                    dark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Change Photo
                  <input type="file" accept="image/png, image/jpeg" className="hidden" />
                </label>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Field label="Name" t={t} className="sm:w-[47%]">
                {editingProfile ? (
                  <input type="text" defaultValue={currentStaff.name} className={`input ${t.inputBg}`} />
                ) : (
                  <p className={`text-sm font-semibold ${t.text}`}>{currentStaff.name}</p>
                )}
              </Field>

              <Field label="Staff ID" t={t} className="sm:w-[47%]">
                <p className={`text-sm font-semibold ${t.text}`}>{currentStaff.staffId}</p>
              </Field>

              <Field label="Role" t={t} className="sm:w-[47%]">
                <p className={`text-sm font-semibold ${t.text}`}>{currentStaff.role}</p>
                <p className={`mt-0.5 text-[11px] ${t.subtext}`}>Set by your manager. Contact admin to change.</p>
              </Field>

              <Field label="Phone" t={t} className="sm:w-[47%]">
                {editingProfile ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`input ${t.inputBg}`}
                  />
                ) : (
                  <p className={`text-sm font-semibold ${t.text}`}>{phone}</p>
                )}
              </Field>

              <Field label="Email" t={t} className="w-full">
                <p className={`text-sm font-semibold ${t.text}`}>{currentStaff.email}</p>
                <p className={`mt-0.5 text-[11px] ${t.subtext}`}>Read-only. Contact admin to update your email.</p>
              </Field>
            </div>

            <button
              onClick={() => setEditingProfile((v) => !v)}
              className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600"
            >
              {editingProfile ? "Save Profile" : "Edit Profile"}
            </button>
          </Section>

          {/* Security */}
          <Section title="Security" t={t}>
            <div className="flex flex-col gap-3">
              <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showPasswords} t={t} />
              <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showPasswords} t={t} />
              <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showPasswords} t={t} />

              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold hover:text-orange-500 ${t.subtext}`}
              >
                {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            {passwordError && <p className="mt-3 text-xs font-medium text-rose-500">{passwordError}</p>}
            {passwordSaved && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                <Check className="h-3.5 w-3.5" /> Password changed successfully
              </p>
            )}

            <button
              onClick={handleChangePassword}
              className="mt-4 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600"
            >
              Change Password
            </button>
          </Section>

          {/* Duty Status */}
          <Section title="Duty Status" t={t}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${onDuty ? "bg-emerald-500" : "bg-gray-400"}`} />
                <p className={`text-sm font-semibold ${t.text}`}>{onDuty ? "On Duty" : "Off Duty"}</p>
              </div>
              <SwitchToggle checked={onDuty} onChange={() => setOnDuty((v) => !v)} />
            </div>
            <p className={`mt-2 text-[11px] ${t.subtext}`}>
              Set yourself off-duty when your shift ends so new orders aren't assigned to you.
            </p>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" description={`Alerts relevant to your role: ${currentStaff.role}`} t={t}>
            <div className="flex flex-col">
              {notificationKeys.map((n) => (
                <div key={n.key} className="flex items-center justify-between py-2.5">
                  <p className={`text-sm ${t.body}`}>{n.label}</p>
                  <SwitchToggle checked={notifPrefs[n.key]} onChange={() => toggleNotif(n.key)} />
                </div>
              ))}

              <div className={`flex items-center justify-between border-t py-2.5 pt-3.5 ${t.divider}`}>
                <p className={`flex items-center gap-1.5 text-sm ${t.body}`}>
                  {soundOn ? <Volume2 className={`h-4 w-4 ${t.subtext}`} /> : <VolumeX className={`h-4 w-4 ${t.subtext}`} />}
                  Sound Notification
                </p>
                <SwitchToggle checked={soundOn} onChange={() => setSoundOn((v) => !v)} />
              </div>
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance" description="Optional — choose how the app looks on your device." t={t}>
            <div className="flex gap-3">
              <ThemeOption icon={Sun} label="Light" active={theme === "light"} dark={dark} onClick={() => setTheme("light")} />
              <ThemeOption icon={Moon} label="Dark" active={theme === "dark"} dark={dark} onClick={() => setTheme("dark")} />
            </div>
          </Section>
        </div>
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border-width: 1px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #fdba74;
        }
      `}</style>
    </div>
  );
}

/* ─── Theme token type ───────────────────────────────────── */
type ThemeTokens = {
  page: string;
  card: string;
  heading: string;
  subtext: string;
  label: string;
  text: string;
  body: string;
  inputBg: string;
  divider: string;
};

/* ─── Sub-components ─────────────────────────────────────── */
function Section({
  title,
  description,
  children,
  t,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  t: ThemeTokens;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${t.card}`}>
      <h2 className={`text-base font-bold ${t.heading}`}>{title}</h2>
      {description && <p className={`mt-0.5 text-xs ${t.subtext}`}>{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  t,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  t: ThemeTokens;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${t.label}`}>{label}</label>
      {children}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  t,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  t: ThemeTokens;
}) {
  return (
    <div className="flex flex-col">
      <label className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${t.label}`}>{label}</label>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className={`input ${t.inputBg}`}
      />
    </div>
  );
}

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-orange-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  active,
  dark,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  dark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-colors duration-200 ${
        active
          ? "border-orange-400 bg-orange-50 text-orange-600"
          : dark
          ? "border-gray-800 text-gray-400 hover:bg-gray-800"
          : "border-gray-100 text-gray-500 hover:bg-gray-50"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
