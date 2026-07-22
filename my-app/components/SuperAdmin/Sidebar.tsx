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
  ChevronDown,
  Globe,
  ShieldCheck,
  Store,
  CreditCard,
  Bell,
  Server,
  KeyRound,
  Wallet,
} from "lucide-react";

type ChildMenu = {
  name: string;
  icon: React.ElementType;
  href: string;
};

type ChildGroup = {
  label: string;
  items: ChildMenu[];
};

type MenuItem =
  | {
      name: string;
      icon: React.ElementType;
      href: string;
      groups?: never;
    }
  | {
      name: string;
      icon: React.ElementType;
      groups: ChildGroup[];
      href?: never;
    };

const menus: MenuItem[] = [
  { name: "Dashboard", icon: BarChart3, href: "/superdashboard" },
  { name: "Businesses", icon: Building2, href: "/business" },
  { name: "All Orders", icon: ClipboardList, href: "/order" },
  { name: "Platform Users", icon: Users, href: "/users" },
  { name: "System Logs", icon: Layers3, href: "/system_logs" },
  {
    name: "Global Settings",
    icon: Settings,
    groups: [
      {
        label: "Configuration",
        items: [
          { name: "Platform", icon: Globe, href: "/settings/platform" },
          { name: "Business Policies", icon: Store, href: "/settings/business" },
          { name: "Payment", icon: Wallet, href: "/settings/payment" },
          { name: "Subscription", icon: CreditCard, href: "/settings/subscriptions" },
        ],
      },
      {
        label: "Access & Operations",
        items: [
          { name: "Security", icon: ShieldCheck, href: "/settings/security" },
          { name: "Roles & Permissions", icon: KeyRound, href: "/settings/roles" },
          { name: "Notifications", icon: Bell, href: "/settings/notifications" },
          { name: "System", icon: Server, href: "/settings/system" },
        ],
      },
    ],
  },
];

function hasGroups(item: MenuItem): item is Extract<MenuItem, { groups: ChildGroup[] }> {
  return "groups" in item;
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-expand "Global Settings" if the user is currently on one of its child routes.
  const settingsItem = menus.find(hasGroups);
  const startsOpen =
    !!settingsItem &&
    settingsItem.groups.some((group) => group.items.some((child) => pathname === child.href));

  const [settingsOpen, setSettingsOpen] = useState(startsOpen);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
        <h1 className="text-xl font-bold">Bistro Central</h1>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col justify-between
          overflow-y-auto border-r border-orange-100 bg-white px-5 py-8 sm:px-6
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:w-64 lg:translate-x-0
        `}
      >
        <div>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h2 className="text-xl font-bold">Menu</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
              <X />
            </button>
          </div>

          <div className="mt-2 lg:mt-5">
            <h1 className="text-2xl font-bold sm:text-3xl">Bistro Central</h1>
            <p className="text-sm text-gray-500">Super Admin Console</p>
          </div>

          <nav className="mt-8 space-y-1.5 lg:mt-10">
            {menus.map((item) => {
              const Icon = item.icon;

              if (hasGroups(item)) {
                const isChildActive = item.groups.some((group) =>
                  group.items.some((child) => pathname === child.href)
                );

                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      aria-expanded={settingsOpen}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
                        isChildActive
                          ? "bg-[#F97316] text-white"
                          : "text-gray-700 hover:bg-[#F97316]/10 hover:text-[#F97316]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="text-xs uppercase tracking-[0.18em]">{item.name}</span>
                      </div>

                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-300 ease-in-out ${
                          settingsOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Animated collapse: grid-rows trick lets us transition to/from "auto" height */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        settingsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-6 mt-2 space-y-3 border-l border-orange-100 pl-4">
                          {item.groups.map((group) => (
                            <div key={group.label}>
                              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                {group.label}
                              </p>
                              <div className="space-y-1">
                                {group.items.map((child) => {
                                  const ChildIcon = child.icon;
                                  const active = pathname === child.href;

                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      onClick={() => setOpen(false)}
                                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                                        active
                                          ? "bg-orange-500 text-white"
                                          : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                                      }`}
                                    >
                                      <ChildIcon size={16} />
                                      <span className="text-xs">{child.name}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
                    active
                      ? "bg-[#F97316] text-white"
                      : "text-gray-700 hover:bg-[#F97316]/10 hover:text-[#F97316]"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-xs uppercase tracking-[0.18em]">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pb-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] py-3 text-sm text-white transition hover:bg-[#e06610]">
            <Download size={16} />
            Export Reports
          </button>

          <div className="mt-8 space-y-5">
            <button className="flex items-center gap-3 text-gray-600 hover:text-[#F97316]">
              <CircleHelp size={17} />
              <span className="text-xs uppercase tracking-[0.18em]">Support</span>
            </button>

            <button className="flex items-center gap-3 text-red-500 hover:text-red-600">
              <LogOut size={17} />
              <span className="text-xs uppercase tracking-[0.18em]">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
