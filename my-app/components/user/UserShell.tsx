"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Sidebar from "@/components/SideBar";
import { SavedProvider } from "@/components/SavedContext";
import type { SessionPayload } from "@/lib/session";
import type { PublicBusinessListing } from "@/lib/queries/businesses";

export default function UserShell({
  children,
  session,
  allBusinesses = [],
}: {
  children: React.ReactNode;
  session: SessionPayload | null;
  allBusinesses?: PublicBusinessListing[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  let businessId: string | undefined;
  if (pathname?.startsWith("/Menu/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[1] === "Menu" && segments[2]) {
      businessId = segments[2];
    }
  }

  return (
    <SavedProvider>
      <Nav
        session={session}
        allBusinesses={allBusinesses}
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((value) => !value)}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        businessId={businessId}
      />
      {children}
    </SavedProvider>
  );
}
