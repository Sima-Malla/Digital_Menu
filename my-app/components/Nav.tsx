"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ShoppingCart, User, Menu, X, LayoutDashboard } from "lucide-react";
import type { SessionPayload } from "@/lib/session";

const NAV_LINKS = [
  { label: "Explore", href: "/Home", active: true },
  { label: "Business", href: "/Business" },
  { label: "Rewards", href: "/rewards" },
];

export default function Nav({
  onMenuToggle,
  menuOpen = false,
  session,
}: {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  session: SessionPayload | null;
}) {
  const isLoggedIn = !!session;
  const isAdmin = session?.role === "admin"; // adjust this to match your SessionPayload shape

  return (
    <header className="sticky top-0 z-40 border-b border-[#B87333]/15 bg-[#F3EAD9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3.5 lg:px-10">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="text-[#5C4A3D] transition hover:text-[#7A2E22]"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/" className="inline-flex shrink-0 items-center">
          <Image src="/logo.png" alt="MenuTap" width={120} height={30} priority className="h-9 w-auto object-contain" />
        </Link>

        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-[#B87333]/25 bg-white/70 px-4 py-2 lg:flex">
          <Search className="h-4 w-4 shrink-0 text-[#B87333]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search Nepali flavors..."
            className="w-full bg-transparent text-[13px] text-[#2A211D] outline-none placeholder:text-[#8A7B6E]"
          />
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative text-[13px] font-semibold uppercase tracking-wide transition ${
                link.active ? "text-[#7A2E22]" : "text-[#5C4A3D] hover:text-[#7A2E22]"
              }`}
            >
              {link.label}
              {link.active && <span className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-[#E3A73B]" />}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              className="relative flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#5C4A3D] transition hover:text-[#7A2E22]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2} />
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button aria-label="Set location" className="text-[#5C4A3D] transition hover:text-[#7A2E22]">
            <MapPin className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
          <button aria-label="Cart" className="relative text-[#5C4A3D] transition hover:text-[#7A2E22]">
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#E3A73B] text-[8px] font-bold text-[#2A211D]">
              2
            </span>
          </button>

          {isLoggedIn ? (
            <Link
              href="/account"
              aria-label="Account"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B87333]/30 text-[#5C4A3D] transition hover:border-[#7A2E22] hover:text-[#7A2E22]"
            >
              <User className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center bg-[#D4AF37] gap-1.5 rounded-full border border-[#B87333]/30 px-3 py-1.5 text-[12px] font-semibold text-[#5C4A3D] transition hover:border-[#7A2E22] hover:text-[#7A2E22]"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-[#B87333]/15 bg-[#F3EAD9] px-6 py-4 md:hidden">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-[#B87333]/25 bg-white/70 px-4 py-2.5">
            <Search className="h-4 w-4 text-[#B87333]" />
            <input
              type="text"
              placeholder="Search Nepali flavors..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#8A7B6E]"
            />
          </div>
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[14px] font-semibold uppercase tracking-wide ${
                  link.active ? "text-[#7A2E22]" : "text-[#5C4A3D]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-[14px] font-semibold uppercase tracking-wide text-[#5C4A3D]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2} />
                Admin Dashboard
              </Link>
            )}

            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className="text-[14px] font-semibold uppercase tracking-wide text-[#5C4A3D]"
            >
              {isLoggedIn ? "Account" : "Login"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}