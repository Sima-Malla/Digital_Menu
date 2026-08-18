"use client";

import { usePathname } from "next/navigation";
import GourmetHubSidebar from "@/components/staff/gourmethub-sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // यदि /slogin पेजमा छ भने Sidebar नदेखाउने (Standalone Page)
  if (pathname === "/slogin") {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  // बाँकी सबै Staff Dashboard Pages मा Sidebar देखाउने
  return (
    <div className="flex min-h-screen">
      <GourmetHubSidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}