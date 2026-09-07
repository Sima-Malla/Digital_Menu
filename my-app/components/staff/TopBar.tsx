"use client";

import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

export default function TopBar({
  businessName,
}: {
  businessName: string;
  profileImage: string;
}) {
  return (
    <header className="relative flex h-16 items-center justify-between bg-white px-6 shadow-sm">
      {/* Left: Logo */}
      <Link href="/" className="inline-flex shrink-0 items-center">
        <img src="/logo.png" alt="MenuTap" className="h-9 w-auto object-contain" />
      </Link>

      {/* Center: Business Name */}
      <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-extrabold uppercase tracking-widest text-orange-500">
        {businessName.toUpperCase()}
      </span>

      {/* Right: Notification */}
      <NotificationBell />
    </header>
  );
}