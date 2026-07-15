// components/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Radio,
  Table2,
  BarChart3,
  Settings,
  ChevronDown,
  CreditCard,
  Bell,
  Users,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

/* ─── Nav data ───────────────────────────────────────────── */
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Menu Manager", href: "/menueditor", icon: UtensilsCrossed },
  { label: "Live Orders", href: "/orders", icon: Radio, badge: 4 },
  { label: "Floor Plan", href: "/floorplan", icon: Table2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const settingsSubItems = [
  { label: "General Settings", href: "/setting/generalsetting", icon: SlidersHorizontal },
  { label: "Payment Settings", href: "/setting/paymentsetting", icon: CreditCard },
  { label: "Notifications", href: "/setting/notifications", icon: Bell },
  { label: "Team & Roles", href: "/setting/team", icon: Users },
  { label: "Security", href: "/setting/security", icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isOnSettingsRoute = pathname.startsWith("/setting");

  // Tracks whether the user has manually toggled the dropdown.
  // Starts in sync with the current route (open if you're on a settings page).
  const [isSettingsOpen, setIsSettingsOpen] = useState(isOnSettingsRoute);

  // Keep it open automatically if navigation lands on a settings route
  // (e.g. clicking a settings link elsewhere in the app).
  useEffect(() => {
    if (isOnSettingsRoute) {
      setIsSettingsOpen(true);
    }
  }, [isOnSettingsRoute]);

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6 lg:flex">
      <div>
        {/* ── Logo / Brand ──────────────────────────────── */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
            <Image
              src="/hotel.png"
              alt="Admin"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-orange-600">
              GourmetFlow
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Grand Plaza Heights
            </p>
          </div>
        </div>

        {/* ── Primary nav ───────────────────────────────── */}
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* ── Settings (collapsible) ──────────────────── */}
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-expanded={isSettingsOpen}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isSettingsOpen
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="h-4 w-4" />
                Settings
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isSettingsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Sub-items */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSettingsOpen
                  ? "mt-1 max-h-80 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-0.5 pl-4">
                {settingsSubItems.map((sub) => {
                  const isActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                        isActive
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <sub.icon className="h-3.5 w-3.5" />
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}