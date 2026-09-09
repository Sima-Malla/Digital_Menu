"use client";

import { usePathname } from "next/navigation";
import GourmetHubSidebar from "@/components/staff/gourmethub-sidebar";
import TopBar from "@/components/admin/TopBar";

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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <GourmetHubSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar businessName={businessName} profileImage={profileImage} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}