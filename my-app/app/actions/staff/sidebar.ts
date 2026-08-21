// app/actions/staffSidebar.ts

"use server";

import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/session";
import {
  getStaffSidebarSummary,
  type StaffSidebarSummary,
} from "@/lib/staff/sidebar";

export async function getStaffSidebarSummaryAction(): Promise<StaffSidebarSummary | null> {
  const session = await getSession();

  if (!session?.userId || session.role === "superadmin") {
    return null;
  }

  return getStaffSidebarSummary(BigInt(session.userId));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}