"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Users,
  Layers3,
  Settings,
  Download,
  CircleHelp,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const menus = [
  {
    name: "Dashboard",
    icon: BarChart3,
    href: "/superdashboard",
  },
  {
    name: "Businesses",
    icon: Building2,
    href: "/business",
  },
  {
    name: "All Orders",
    icon: ClipboardList,
    href: "/order",
  },
  {
    name: "Platform Users",
    icon: Users,
    href: "/platform-users",
  },
  {
    name: "System Logs",
    icon: Layers3,
    href: "/system-logs",
  },
  {
    name: "Global Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
        <h1 className="text-xl font-bold">Bistro Central</h1>

        <button onClick={() => setOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-orange-100
          flex flex-col justify-between
          px-6 py-8
          overflow-y-auto
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h2 className="text-xl font-bold">Menu</h2>

            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          <div className="mt-5">
            <h1 className="text-3xl font-bold">Bistro Central</h1>

            <p className="text-sm text-gray-500">
              Super Admin Console
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    active
                      ? "bg-[#0A5C8D] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />

                  <span className="text-xs uppercase tracking-[0.18em]">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pb-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B54A00] py-3 text-sm text-white">
            <Download size={16} />
            Export Reports
          </button>

          <div className="mt-8 space-y-5">
            <button className="flex items-center gap-3 text-gray-600">
              <CircleHelp size={17} />

              <span className="text-xs uppercase tracking-[0.18em]">
                Support
              </span>
            </button>

            <button className="flex items-center gap-3 text-red-500">
              <LogOut size={17} />

              <span className="text-xs uppercase tracking-[0.18em]">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}