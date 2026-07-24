"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  UtensilsCrossed,
  ClipboardList,
  ListOrdered,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

const menus = [
  { name: "Dashboard", icon: LayoutGrid, href: "/staffdashboard" },
  { name: "Menu ", icon: UtensilsCrossed, href: "/menu-editor" },
  { name: "Live Orders", icon: ClipboardList, href: "/live-orders" },
 
  { name: "Analytics", icon: BarChart3, href: "/aanalytics" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function GourmetHubSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
        <h1 className="text-lg font-bold text-orange-600">GourmetHub</h1>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={26} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 max-w-[80vw] flex-col
          border-r border-slate-100 bg-white px-5 py-6
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="text-lg font-bold text-orange-600">GourmetHub</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
            <X />
          </button>
        </div>

        <h1 className="hidden text-lg font-bold text-orange-600 lg:block">GourmetHub</h1>

        {/* Profile */}
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <img
            src="https://i.pravatar.cc/64?img=12"
            alt="Hotel Admin"
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800">Hotel Staff</p>
            <p className="text-xs text-slate-400">Grand Plaza Heights</p>
          </div>
        </div>

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
      </aside>
    </>
  );
}
