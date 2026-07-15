"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Moon,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  ShoppingBag,
  Star,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";

/* ─── Reusable Toggle ─────────────────────────────────────── */

function Toggle({
  enabled,
  onToggle,
  size = "md",
}: {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const translate = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex ${dims} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block ${knob} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? translate : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Input Field ─────────────────────────────────────────── */

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-800 shadow-sm transition-all duration-150 placeholder:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

/* ─── Channel Selection Card ─────────────────────────────── */

function ChannelCard({
  icon: Icon,
  label,
  desc,
  enabled,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 ${
        enabled
          ? "border-orange-500 bg-orange-50/50 shadow-sm shadow-orange-100/50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          enabled ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-gray-800">{label}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{desc}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} size="sm" />
    </button>
  );
}

/* ─── Notification Type Row ───────────────────────────────── */

function NotificationTypeRow({
  icon: Icon,
  label,
  desc,
  bgColor = "bg-gray-50",
  enabled,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  bgColor?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-gray-100 ${bgColor} px-4 py-3.5 transition-all duration-150`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <Icon className="h-4 w-4 text-gray-600" strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-gray-800">{label}</p>
            {enabled && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{desc}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */

export default function NotificationSettingsPage() {
  // Channel preferences
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: true,
  });

  // Notification types
  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    customerReviews: true,
    staffActivity: true,
    promotions: false,
    systemAlerts: true,
  });

  // Quiet hours
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: "22:00",
    end: "07:00",
  });

  // Contact info
  const [contactInfo, setContactInfo] = useState({
    email: "admin@restaurant.com",
    phone: "+1 (555) 012-3456",
  });

  const toggleChannel = (channel: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleQuietHours = () => {
    setQuietHours((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  // Count active notification types
  const activeCount = Object.values(notifications).filter(Boolean).length;
  const totalCount = Object.values(notifications).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1080px] px-8 py-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span>System</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-500">Notifications</span>
          </div>

          {/* ── Page Header ─────────────────────────────── */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
                <Bell className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Notification Preferences</h1>
                <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-gray-400">
                  Choose how and when you receive updates about your restaurant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
              <span className="text-[12px] font-semibold text-gray-600">
                {activeCount}/{totalCount} active
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-[12px] font-semibold text-gray-600">
                {Object.values(channels).filter(Boolean).length} channels
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* ── Notification Channels ──────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-[14px] font-bold text-gray-900">Notification Channels</h2>
                <p className="mt-1 text-[12px] text-gray-400">Choose how you want to receive notifications</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <ChannelCard
                  icon={Mail}
                  label="Email"
                  desc="Get updates in your inbox"
                  enabled={channels.email}
                  onToggle={() => toggleChannel("email")}
                />
                <ChannelCard
                  icon={MessageSquare}
                  label="SMS"
                  desc="Receive text messages"
                  enabled={channels.sms}
                  onToggle={() => toggleChannel("sms")}
                />
                <ChannelCard
                  icon={Smartphone}
                  label="Push"
                  desc="Real-time mobile alerts"
                  enabled={channels.push}
                  onToggle={() => toggleChannel("push")}
                />
              </div>
            </section>

            {/* ── Notification Types ────────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-bold text-gray-900">Notification Types</h2>
                  <p className="mt-1 text-[12px] text-gray-400">Select which events trigger notifications</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                  <span>{activeCount} active</span>
                  <button
                    onClick={() => {
                      const allActive = Object.values(notifications).every(Boolean);
                      const newState = Object.fromEntries(
                        Object.keys(notifications).map((key) => [key, !allActive])
                      );
                      setNotifications(newState as typeof notifications);
                    }}
                    className="rounded-lg px-3 py-1 text-orange-500 hover:bg-orange-50"
                  >
                    {Object.values(notifications).every(Boolean) ? "Disable All" : "Enable All"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NotificationTypeRow
                  icon={ShoppingBag}
                  label="New Orders"
                  desc="When a customer places a new order"
                  bgColor={notifications.newOrders ? "bg-orange-50/50" : "bg-gray-50"}
                  enabled={notifications.newOrders}
                  onToggle={() => toggleNotification("newOrders")}
                />
                <NotificationTypeRow
                  icon={Clock}
                  label="Order Updates"
                  desc="Status changes for existing orders"
                  bgColor={notifications.orderUpdates ? "bg-orange-50/50" : "bg-gray-50"}
                  enabled={notifications.orderUpdates}
                  onToggle={() => toggleNotification("orderUpdates")}
                />
                <NotificationTypeRow
                  icon={Star}
                  label="Customer Reviews"
                  desc="New reviews and ratings"
                  bgColor={notifications.customerReviews ? "bg-orange-50/50" : "bg-gray-50"}
                  enabled={notifications.customerReviews}
                  onToggle={() => toggleNotification("customerReviews")}
                />
                <NotificationTypeRow
                  icon={Users}
                  label="Staff Activity"
                  desc="Staff check-ins, performance, and updates"
                  bgColor={notifications.staffActivity ? "bg-orange-50/50" : "bg-gray-50"}
                  enabled={notifications.staffActivity}
                  onToggle={() => toggleNotification("staffActivity")}
                />
                <NotificationTypeRow
                  icon={Settings2}
                  label="Promotions & Marketing"
                  desc="Campaign results and marketing tips"
                  bgColor={notifications.promotions ? "bg-orange-50/50" : "bg-gray-50"}
                  enabled={notifications.promotions}
                  onToggle={() => toggleNotification("promotions")}
                />
                <NotificationTypeRow
                  icon={AlertCircle}
                  label="System Alerts"
                  desc="Critical platform updates and maintenance"
                  bgColor={notifications.systemAlerts ? "bg-orange-50/50" : "bg-gray-50"}
                  enabled={notifications.systemAlerts}
                  onToggle={() => toggleNotification("systemAlerts")}
                />
              </div>
            </section>

            {/* ── Quiet Hours & Contact ───────────────────── */}
            <div className="grid grid-cols-2 gap-6">
              {/* Quiet Hours */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <Moon className="h-4 w-4 text-gray-500" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">Quiet Hours</h2>
                      <p className="mt-1 text-[12px] leading-relaxed text-gray-400">
                        Mute non-critical notifications during off-hours
                      </p>
                    </div>
                  </div>
                  <Toggle enabled={quietHours.enabled} onToggle={toggleQuietHours} />
                </div>

                <div
                  className={`mt-5 grid grid-cols-2 gap-3 overflow-hidden transition-all duration-200 ${
                    quietHours.enabled ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <InputField
                    label="Start Time"
                    value={quietHours.start}
                    onChange={(val) => setQuietHours((prev) => ({ ...prev, start: val }))}
                    type="time"
                  />
                  <InputField
                    label="End Time"
                    value={quietHours.end}
                    onChange={(val) => setQuietHours((prev) => ({ ...prev, end: val }))}
                    type="time"
                  />
                </div>
              </section>

              {/* Contact Info */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-[14px] font-bold text-gray-900">Contact Details</h2>
                <p className="mt-1 text-[12px] text-gray-400">Where notifications will be delivered</p>
                <div className="mt-5 flex flex-col gap-4">
                  <InputField
                    label="Email Address"
                    value={contactInfo.email}
                    onChange={(val) => setContactInfo((prev) => ({ ...prev, email: val }))}
                    placeholder="admin@restaurant.com"
                    type="email"
                  />
                  <InputField
                    label="Phone Number"
                    value={contactInfo.phone}
                    onChange={(val) => setContactInfo((prev) => ({ ...prev, phone: val }))}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </div>
              </section>
            </div>

            {/* ── Actions ────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 pb-4 pt-2">
              <div className="text-[12px] text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  All changes saved automatically
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-all duration-150 hover:border-gray-300 hover:bg-gray-50"
                >
                  Reset to Defaults
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-orange-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition-all duration-150 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-200/60"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}