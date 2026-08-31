"use client";

import { usePathname } from "next/navigation";
import GourmetHubSidebar from "@/components/staff/gourmethub-sidebar";
import TopBar from "@/components/staff/TopBar";

export default function StaffLayoutClient({
  businessName,
  profileImage,
  children,
}: {
  businessName: string;
  profileImage: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/slogin") {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    // flex-col: stacks TopBar ABOVE the sidebar+content row, full width
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopBar businessName={businessName} profileImage={profileImage} />

      {/* This inner row is where sidebar + main actually sit side-by-side */}
      <div className="flex flex-1 min-h-0">
        <GourmetHubSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}