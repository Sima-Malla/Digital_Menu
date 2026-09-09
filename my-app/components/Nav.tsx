"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, User, Menu, X, LayoutDashboard, LogOut, HelpCircle, Info } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { logoutAction } from "@/app/actions/logout";
import SavedRoomsDrawer from "@/components/SavedRoomsDrawer";
import { useSaved } from "@/components/SavedContext";
import type { PublicBusinessListing } from "@/lib/queries/businesses";

const NAV_LINKS = [
  { label: "Explore", href: "/Home" },
  { label: "Business", href: "/Kitchens" },
  { label: "User Guide", href: "/UserGuidance" },
  { label: "About Us", href: "/aboutus" },
];

export default function Nav({
  onMenuToggle,
  menuOpen = false,
  session = null,
  allBusinesses = [],
}: {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  session?: SessionPayload | null;
  allBusinesses?: PublicBusinessListing[];
}) {
  const isLoggedIn = !!session;
  const isAdmin = session?.role === "admin";
  const pathname = usePathname();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  const { favoriteIds, toggleFavorite } = useSaved();
  const savedBusinesses = allBusinesses.filter((b) => favoriteIds.includes(b.id));

  // Active when the path matches exactly, or is nested under this link
  // (e.g. "/Kitchens/123" should still highlight "Business").
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#B87333]/15 bg-[#F3EAD9]/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-3.5 lg:px-10">
          {/* ── Left: hamburger (mobile only) + logo ───────────── */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              aria-label="Toggle menu"
              className="text-[#5C4A3D] transition hover:text-[#7A2E22] md:hidden"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="inline-flex shrink-0 items-center">
              <img src="/logo.png" alt="MenuTap" className="h-9 w-auto object-contain" />
            </Link>
          </div>

          {/* ── Center: nav links, truly centered via grid ─────── */}
          <nav className="hidden items-center justify-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
            
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 pb-1.5 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                    active ? "text-[#7A2E22]" : "text-[#5C4A3D] hover:text-[#7A2E22]"
                  }`}
                >
                 
                  {link.label}
                  <span
                    className={`absolute -bottom-0 left-0 h-[2px] w-full rounded-full bg-[#E3A73B] transition-opacity duration-200 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={`relative flex items-center gap-1.5 pb-1.5 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                  isActive("/admin") ? "text-[#7A2E22]" : "text-[#5C4A3D] hover:text-[#7A2E22]"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2} />
                Admin
                <span
                  className={`absolute -bottom-0 left-0 h-[2px] w-full rounded-full bg-[#E3A73B] transition-opacity duration-200 ${
                    isActive("/admin") ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            )}
          </nav>

          {/* ── Right: actions ──────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              aria-label="Saved Businesses"
              title="View saved businesses"
              className="hidden p-1 transition-transform hover:scale-110 md:block"
            >
              <Heart
                className={`h-5 w-5 drop-shadow-sm transition-colors ${
                  savedBusinesses.length > 0 ? "fill-red-500 text-red-500" : "fill-white text-[#5C4A3D]"
                }`}
                strokeWidth={1.8}
              />
            </button>

            {isLoggedIn ? (
              <div className="group relative hidden md:block">
                <Link
                  href="/login"
                  aria-label="Account"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B87333]/30 text-[#5C4A3D] transition hover:border-[#7A2E22] hover:text-[#7A2E22]"
                >
                  <User className="h-4 w-4" strokeWidth={1.8} />
                </Link>

                <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-[#B87333]/15 bg-white p-1 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <Link
                    href="/account"
                    className="block rounded-lg px-3 py-2 text-left text-xs font-medium text-[#5C4A3D] transition hover:bg-[#F3EAD9]"
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#7A2E22] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full border border-[#B87333]/30 bg-[#D4AF37] px-3 py-1.5 text-[12px] font-semibold text-[#5C4A3D] transition hover:border-[#7A2E22] hover:text-[#7A2E22] md:flex"
              >
                Login
              </Link>
            )}

            {/* Mobile: keep the heart + account/login reachable without the desktop-only classes above */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => setIsSavedDrawerOpen(true)}
                aria-label="Saved Businesses"
                className="p-1"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    savedBusinesses.length > 0 ? "fill-red-500 text-red-500" : "fill-white text-[#5C4A3D]"
                  }`}
                  strokeWidth={1.8}
                />
              </button>
              <Link
                href={isLoggedIn ? "/account" : "/login"}
                aria-label={isLoggedIn ? "Account" : "Login"}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B87333]/30 text-[#5C4A3D]"
              >
                <User className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Mobile dropdown menu ──────────────────────────────── */}
        {menuOpen && (
          <div className="border-t border-[#B87333]/15 bg-[#F3EAD9] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[14px] font-semibold uppercase tracking-wide ${
                    isActive(link.href) ? "text-[#7A2E22]" : "text-[#5C4A3D]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 text-[14px] font-semibold uppercase tracking-wide ${
                    isActive("/admin") ? "text-[#7A2E22]" : "text-[#5C4A3D]"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2} />
                  Admin Dashboard
                </Link>
              )}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1.5 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7A2E22] disabled:opacity-60"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <SavedRoomsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedBusinesses={savedBusinesses}
        onRemovePlace={(id) => toggleFavorite(id)}
      />
    </>
  );
}