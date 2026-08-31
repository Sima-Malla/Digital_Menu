"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Eye,
  EyeOff,
  Check,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import {
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  getStaffNotificationPrefs,
  updateStaffNotificationPrefs,
} from "@/app/actions/staff/staff-settings";
import { getStaffSidebarSummaryAction } from "@/app/actions/staff/sidebar";

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
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{
    fullName: string;
    position: string;
    role: string;
    phone: string;
    email: string;
  } | null>(null);
  const [brand, setBrand] = useState<{ businessName: string; logoUrl: string | null } | null>(null);

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
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [data, summary, savedPrefs] = await Promise.all([
        getStaffProfile(),
        getStaffSidebarSummaryAction(),
        getStaffNotificationPrefs(),
      ]);

      if (data) {
        setStaff(data);
        setFullName(data.fullName);
        setPhone(data.phone);

        const keys = POSITION_NOTIFICATIONS[data.position] ?? DEFAULT_NOTIFICATIONS;
        const defaultMap = Object.fromEntries(keys.map((n) => [n.key, true]));

        if (savedPrefs) {
          setSoundOn(savedPrefs.soundOn);
          setNotifPrefs({ ...defaultMap, ...savedPrefs.notifPrefs });
        } else {
          setNotifPrefs(defaultMap);
        }
      }

      if (summary) {
        setBrand({
          businessName: summary.businessName,
          logoUrl: summary.logoUrl,
        });
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleSaveNotifications(updatedPrefs: Record<string, boolean>, updatedSound: boolean) {
    setSavingNotif(true);
    setNotifSaved(false);
    const res = await updateStaffNotificationPrefs({
      soundOn: updatedSound,
      notifPrefs: updatedPrefs,
    });
    setSavingNotif(false);

    if (res.success) {
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    }
  }

  function toggleNotif(key: string) {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    handleSaveNotifications(updated, soundOn);
  }

  function toggleSound() {
    const updatedSound = !soundOn;
    setSoundOn(updatedSound);
    handleSaveNotifications(notifPrefs, updatedSound);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Unable to load profile. Please log in again.</p>
      </div>
    );
  }

  const notificationKeys = POSITION_NOTIFICATIONS[staff.position] ?? DEFAULT_NOTIFICATIONS;
  const profileImage = brand?.logoUrl || "/logo.png";

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <main className="max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            {brand?.businessName ? `Manage ${brand.businessName} account settings.` : "Manage your account and notification preferences."}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <Section title="My Profile">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <Image src={profileImage} alt={brand?.businessName || staff.fullName} fill className="object-cover" />
              </div>
              {editingProfile && (
                <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-orange-300">
                  <UploadCloud className="h-3.5 w-3.5" />
                  Change Photo
                  <input type="file" accept="image/png, image/jpeg" className="hidden" disabled />
                </label>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Field label="Name" className="sm:w-[47%]">
                {editingProfile ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-orange-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{staff.fullName}</p>
                )}
              </Field>

              <Field label="Position" className="sm:w-[47%]">
                <p className="text-sm font-semibold text-slate-800">{staff.position}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Set by your manager. Contact admin to change.</p>
              </Field>

              <Field label="Phone" className="sm:w-[47%]">
                {editingProfile ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-orange-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{phone || "—"}</p>
                )}
              </Field>

              <Field label="Email" className="w-full">
                <p className="text-sm font-semibold text-slate-800">{staff.email}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Read-only. Contact admin to update your email.</p>
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

          <Section title="Security">
            <div className="flex flex-col gap-3">
              <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showPasswords} />
              <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showPasswords} />
              <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showPasswords} />

              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-500"
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

          <Section title="Notifications" description={`Alerts relevant to your position: ${staff.position}`}>
            <div className="flex flex-col">
              {notificationKeys.map((n) => (
                <div key={n.key} className="flex items-center justify-between py-2.5">
                  <p className="text-sm text-slate-700">{n.label}</p>
                  <SwitchToggle checked={notifPrefs[n.key] ?? true} onChange={() => toggleNotif(n.key)} />
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-slate-100 py-2.5 pt-3.5">
                <p className="flex items-center gap-1.5 text-sm text-slate-700">
                  {soundOn ? <Volume2 className="h-4 w-4 text-slate-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                  Sound Notification
                </p>
                <SwitchToggle checked={soundOn} onChange={toggleSound} />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {savingNotif && (
                <span className="flex items-center gap-1 text-xs text-orange-600">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving to server...
                </span>
              )}
              {notifSaved && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> Notification preferences saved to database
                </span>
              )}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function PasswordField({ label, value, onChange, show }: { label: string; value: string; onChange: (v: string) => void; show: boolean }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</label>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-orange-400"
      />
    </div>
  );
}

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-orange-500" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}
