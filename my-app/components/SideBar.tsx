"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  UserSquare2,
  Folder,
  Contact,
  Settings,
  type LucideIcon,
} from "lucide-react";

export const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/Home", icon: Home },
  { label: "Menu", href: "/Menu", icon: UserSquare2 },
  { label: "About Us", href: "/aboutus", icon: Folder },
  { label: "User Guide", href: "/userguide", icon: Contact },
];

const settingsItem = { label: "Settings", href: "/settings" };
const settingsSubItems = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Preferences", href: "/settings/preferences" },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // lock page scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar drawer — hidden off-canvas until isOpen */}
      <aside
        id="primary-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#12141d] px-4 py-6 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div>
       

          {/* Nav */}
          <nav className="mt-10 flex flex-col gap-1" aria-label="Primary">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/10 text-[#e8821a]"
                      : "text-white/85 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={2}
                    className={active ? "text-[#e8821a]" : "text-white/70"}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings, pinned to bottom — hover reveals a flyout with sub-pages */}
        <div className="group relative">
          <Link
            href={settingsItem.href}
            onClick={onClose}
            aria-current={pathname === settingsItem.href ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === settingsItem.href
                ? "bg-white/10 text-[#e8821a]"
                : "text-white/85 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings size={18} className="text-white/70" />
            {settingsItem.label}
          </Link>

          {/* Flyout sub-pages */}
          <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-white/10 bg-[#1a1d29] p-1.5 opacity-0 shadow-xl transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
            {settingsSubItems.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onClose}
                className="block rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}