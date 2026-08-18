// app/actions/sidebar.ts
"use server";

import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/session";
import { getBusinessSummary, type BusinessSummary } from "@/lib/business";

export async function getSidebarBusinessAction(): Promise<BusinessSummary | null> {
  const session = await getSession();
  if (!session?.businessId) return null;

  return getBusinessSummary(BigInt(session.businessId));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}