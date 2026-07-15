// components/SettingsSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Bell,
  Users,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

const settingsItems = [
  { label: "General Settings", href: "/setting/generalsetting", icon: SlidersHorizontal },
  { label: "Payment Settings", href: "/setting/paymentsetting", icon: CreditCard },
  { label: "Notifications", href: "/setting/notifications", icon: Bell },
  { label: "Team & Roles", href: "/setting/team", icon: Users },
  { label: "Security", href: "/setting/security", icon: ShieldCheck },
];

export default function SettingsSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
      {/* ── Header (click to toggle dropdown) ───────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-5 text-left"
      >
        <div>
          <h2 className="text-base font-bold text-gray-900">Settings</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Manage your account preferences
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* ── Nav list (collapsible) ───────────────────────── */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-0.5 p-3">
            {settingsItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-600" />
                  )}

                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Footer hint ──────────────────────────────────── */}
      <div className="mt-auto border-t border-gray-100 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-gray-400">
          Need help? Visit our{" "}
          <button className="font-semibold text-orange-500 underline-offset-2 hover:underline">
            Help Center
          </button>
        </p>
      </div>
    </aside>
  );
}