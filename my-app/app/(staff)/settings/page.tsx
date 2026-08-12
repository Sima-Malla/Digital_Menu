"use client";
import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import {
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
} from "@/app/actions/staff-settings";

// Keyed by `position` (job title — "Chef", "Waiter", "Manager", "Host", etc.),
// NOT by `role` (which is the permission level: owner/manager/staff).
const POSITION_NOTIFICATIONS: Record<string, { key: string; label: string }[]> = {
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

const DEFAULT_NOTIFICATIONS = [
  { key: "newTableOrder", label: "New Order" },
  { key: "orderReady", label: "Order Ready" },
];

export default function StaffSettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{
    fullName: string;
    position: string;
    role: string;
    phone: string;
    email: string;
  } | null>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [soundOn, setSoundOn] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const data = await getStaffProfile();
      if (data) {
        setStaff(data);
        setFullName(data.fullName);
        setPhone(data.phone);

        const keys = POSITION_NOTIFICATIONS[data.position] ?? DEFAULT_NOTIFICATIONS;
        setNotifPrefs(Object.fromEntries(keys.map((n) => [n.key, true])));
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleNotif(key: string) {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    const res = await updateStaffProfile({ fullName, phone });
    setSavingProfile(false);

    if (res.success) {
      setStaff((prev) => (prev ? { ...prev, fullName, phone } : prev));
      setEditingProfile(false);
    } else {
      alert(res.message || "Failed to save profile.");
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    setChangingPassword(true);

    const res = await changeStaffPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setChangingPassword(false);

    if (res.success) {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    } else {
      setPasswordError(res.message ?? "Failed to change password.");
    }
  }

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

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${t.page}`}>
        <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${t.page}`}>
        <p className={t.subtext}>Unable to load profile. Please log in again.</p>
      </div>
    );
  }

  const notificationKeys = POSITION_NOTIFICATIONS[staff.position] ?? DEFAULT_NOTIFICATIONS;

  return (
    <div className={`min-h-screen ${t.page} pb-16 transition-colors duration-200`}>
      <main className="max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-6">
          <h1 className={`text-2xl font-extrabold sm:text-3xl ${t.heading}`}>Settings</h1>
          <p className={`mt-1 text-sm ${t.subtext}`}>Manage your account and notification preferences.</p>
        </div>

        <div className="flex flex-col gap-5">
          <Section title="My Profile" t={t}>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
                <Image src="/vegmomo.jpg" alt={staff.fullName} fill className="object-cover" />
              </div>
              {editingProfile && (
                <label
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-xs font-semibold hover:border-orange-300 ${
                    dark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Change Photo
                  <input type="file" accept="image/png, image/jpeg" className="hidden" disabled />
                </label>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Field label="Name" t={t} className="sm:w-[47%]">
                {editingProfile ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`input ${t.inputBg}`}
                  />
                ) : (
                  <p className={`text-sm font-semibold ${t.text}`}>{staff.fullName}</p>
                )}
              </Field>

              <Field label="Position" t={t} className="sm:w-[47%]">
                <p className={`text-sm font-semibold ${t.text}`}>{staff.position}</p>
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
                  <p className={`text-sm font-semibold ${t.text}`}>{phone || "—"}</p>
                )}
              </Field>

              <Field label="Email" t={t} className="w-full">
                <p className={`text-sm font-semibold ${t.text}`}>{staff.email}</p>
                <p className={`mt-0.5 text-[11px] ${t.subtext}`}>Read-only. Contact admin to update your email.</p>
              </Field>
            </div>

            <button
              onClick={() => (editingProfile ? handleSaveProfile() : setEditingProfile(true))}
              disabled={savingProfile}
              className="mt-5 flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
            >
              {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingProfile ? "Save Profile" : "Edit Profile"}
            </button>
          </Section>

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
              disabled={changingPassword}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
            >
              {changingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Change Password
            </button>
          </Section>

          <Section title="Notifications" description={`Alerts relevant to your position: ${staff.position}`} t={t}>
            <div className="flex flex-col">
              {notificationKeys.map((n) => (
                <div key={n.key} className="flex items-center justify-between py-2.5">
                  <p className={`text-sm ${t.body}`}>{n.label}</p>
                  <SwitchToggle checked={notifPrefs[n.key] ?? true} onChange={() => toggleNotif(n.key)} />
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
            <p className={`mt-3 text-[11px] italic ${t.subtext}`}>
              Note: notification preferences aren&apos;t saved to the server yet — they reset on refresh.
            </p>
          </Section>

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

function Section({ title, description, children, t }: { title: string; description?: string; children: React.ReactNode; t: ThemeTokens }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${t.card}`}>
      <h2 className={`text-base font-bold ${t.heading}`}>{title}</h2>
      {description && <p className={`mt-0.5 text-xs ${t.subtext}`}>{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children, t, className = "" }: { label: string; children: React.ReactNode; t: ThemeTokens; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${t.label}`}>{label}</label>
      {children}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, t }: { label: string; value: string; onChange: (v: string) => void; show: boolean; t: ThemeTokens }) {
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
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-orange-500" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function ThemeOption({ icon: Icon, label, active, dark, onClick }: { icon: React.ElementType; label: string; active: boolean; dark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-colors duration-200 ${
        active ? "border-orange-400 bg-orange-50 text-orange-600" : dark ? "border-gray-800 text-gray-400 hover:bg-gray-800" : "border-gray-100 text-gray-500 hover:bg-gray-50"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
