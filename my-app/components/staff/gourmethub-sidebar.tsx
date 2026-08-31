"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  UtensilsCrossed,
  ClipboardList,
  ListOrdered,
  Settings,
  ShoppingCart,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import {
  getStaffSidebarSummaryAction,
  logoutAction,
} from "@/app/actions/staff/sidebar";
import {
  type StaffSidebarSummary,
} from "@/lib/staff/sidebar";
import NotificationBell from "@/components/NotificationBell";

const menus = [
  { name: "Dashboard", icon: LayoutGrid, href: "/staffdashboard" },
  { name: "Menu", icon: UtensilsCrossed, href: "/menu-editor" },
  { name: "Live Orders", icon: ClipboardList, href: "/live-orders" },
  { name: "Orders", icon: ListOrdered, href: "/sorder" },
  { name: "Point of Sale", icon: ShoppingCart, href: "/pos" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function GourmetHubSidebar() {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState<StaffSidebarSummary | null>(null);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    getStaffSidebarSummaryAction().then((result) => {
      if (active) {
        setStaff(result);
      }
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

  const staffName = staff?.fullName ?? "Loading...";
  const businessName = staff?.businessName ?? "Loading...";
  const profileImage = staff?.logoUrl || "/logo.png";

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
        <Link href="/" className="inline-flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="MenuTap"
            width={120}
            height={30}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 max-w-[80vw]
          flex-col border-r border-slate-100 bg-white px-5 py-6
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:shrink-0
        `}
      >
        {/* Mobile header */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="MenuTap"
              width={120}
              height={30}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        {/* Desktop logo */}
        <Link
          href="/"
          className="hidden shrink-0 items-center lg:inline-flex"
        >
          <Image
            src="/logo.png"
            alt="MenuTap"
            width={120}
            height={30}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Staff Profile & Notifications */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={profileImage}
              alt={staffName}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-800">
                {staffName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {businessName}
              </p>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1">
          {menus.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />

            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
