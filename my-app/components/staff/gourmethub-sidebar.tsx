// components/StaffSidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Radio,
  LayoutGrid,
  Bell,
  LogOut,
  HelpCircle,
  Clock,
} from "lucide-react";
import { getStaffSidebarSummaryAction, logoutAction } from "@/app/actions/staff/sidebar";
import type { StaffSidebarSummary } from "@/lib/staff/sidebar";

/* ─── Nav data (staff-level only) ──────────────────────────── */
const navItems = [
  { label: "Dashboard", href: "/staffdashboard", icon: LayoutDashboard },
  { label: "Menu Manager", href: "/menueditor", icon: UtensilsCrossed },
  { label: "Live Orders", href: "/orders", icon: Radio, badge: 4 },
  { label: "Area Management", href: "/floorplan", icon: LayoutGrid },
  { label: "Notifications", href: "/setting/notifications", icon: Bell },
  { label: "Operating Hours", href: "/setting/operating-hours", icon: Clock },
];

const SUPPORT_HREF = "/support";

export default function StaffSidebar() {
  const pathname = usePathname();
  const isOnSupportRoute = pathname.startsWith(SUPPORT_HREF);

  const [staff, setStaff] = useState<StaffSidebarSummary | null>(null);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getStaffSidebarSummaryAction().then((result) => {
      if (active) setStaff(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  };

  const displayName = staff?.fullName ?? "Loading…";
  const position = staff?.position ?? "";
  const businessName = staff?.businessName ?? "";
  const logoSrc = staff?.logoUrl || "/hotel.png";

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6 lg:flex">
      <div>
        {/* ── Logo / Staff identity ──────────────────────── */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
            <Image
              src={logoSrc}
              alt={businessName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{displayName}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {position ? `${position} · ${businessName}` : businessName}
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
        </nav>
      </div>

      {/* ── Bottom: Support & Logout ────────────────────── */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex flex-col gap-1">
          <Link
            href={SUPPORT_HREF}
            aria-current={isOnSupportRoute ? "page" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isOnSupportRoute
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Support
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}