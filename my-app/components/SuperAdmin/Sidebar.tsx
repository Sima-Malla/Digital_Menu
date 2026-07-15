"use client";

import Link from "next/link";
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
} from "lucide-react";

const menus = [
  {
    name: "Analytics",
    icon: BarChart3,
    href: "/superdashboard",
    active: true,
  },
  {
    name: "Businesses",
    icon: Building2,
    href: "#",
  },
  {
    name: "All Orders",
    icon: ClipboardList,
    href: "#",
  },
  {
    name: "Platform Users",
    icon: Users,
    href: "#",
  },
  {
    name: "System Logs",
    icon: Layers3,
    href: "#",
  },
  {
    name: "Global Settings",
    icon: Settings,
    href: "#",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] bg-white border-r border-orange-100 h-screen flex flex-col justify-between px-6 py-8">
      <div>

        <h1 className="mt-5 text-2xl font-bold">Bistro Central</h1>

        <p className="text-sm text-gray-500">Super Admin Console</p>

        <nav className="mt-10 space-y-2">
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  item.active
                    ? "bg-[#0A5C8D] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />

                <span className="uppercase tracking-[0.18em] text-xs">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <button className="w-full rounded-lg bg-[#B54A00] py-3 text-white flex items-center justify-center gap-2 text-sm">
          <Download size={16} />
          Export Reports
        </button>

        <div className="mt-8 space-y-5">
          <button className="flex items-center gap-3 text-gray-600">
            <CircleHelp size={17} />
            <span className="uppercase text-xs tracking-[0.18em]">
              Support
            </span>
          </button>

          <button className="flex items-center gap-3 text-red-500">
            <LogOut size={17} />
            <span className="uppercase text-xs tracking-[0.18em]">
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}