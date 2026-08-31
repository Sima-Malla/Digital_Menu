"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, Building2, Ban, Trash2, HelpCircle, AlertCircle } from "lucide-react";
import {
  getSuperAdminLiveNotificationsAction,
  markSuperAdminNotificationReadAction,
  clearAllSuperAdminNotificationsAction,
} from "@/app/actions/superadmin/notifications";

type SuperAdminNotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15); // B5

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    // Audio context may be blocked by browser autoplay policies until user gesture
  }
}

function getSuperAdminNotificationIcon(type: string) {
  switch (type) {
    case "business_added":
      return <Building2 className="h-4 w-4 text-green-600" />;
    case "business_suspended":
      return <Ban className="h-4 w-4 text-red-600" />;
    case "business_deleted":
      return <Trash2 className="h-4 w-4 text-orange-600" />;
    case "support_report":
      return <HelpCircle className="h-4 w-4 text-purple-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-blue-600" />;
  }
}

export default function SuperAdminNotificationBell({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SuperAdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCountRef = useRef(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await getSuperAdminLiveNotificationsAction();
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        const newUnread = res.unreadCount;

        if (newUnread > prevUnreadCountRef.current && prevUnreadCountRef.current >= 0) {
          playChimeSound();
        }
        prevUnreadCountRef.current = newUnread;
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error("Failed to fetch SuperAdmin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 5 seconds for faster real-time notifications
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    await markSuperAdminNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleClearAll = async () => {
    await clearAllSuperAdminNotificationsAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600 focus:outline-none"
        title="SuperAdmin Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Platform Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No SuperAdmin notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkRead(item.id)}
                  className={`group flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                    item.isRead
                      ? "border-gray-100 bg-white opacity-75 hover:bg-gray-50"
                      : "border-orange-100 bg-orange-50/40 hover:bg-orange-50"
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100">
                    {getSuperAdminNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[12px] font-bold text-gray-900 truncate">{item.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-600 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
