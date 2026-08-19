"use client";

import { usePathname } from "next/navigation";
import GourmetHubSidebar from "@/components/staff/gourmethub-sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/slogin") {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <GourmetHubSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
