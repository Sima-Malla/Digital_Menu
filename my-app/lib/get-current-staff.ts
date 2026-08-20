// lib/get-current-staff.ts
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Call this at the top of any Server Component page, or inside any
 * Server Action, that needs to know who's logged in.
 *
 * Usage:
 *   const staff = await getCurrentStaff();                // any logged-in staff
 *   const staff = await getCurrentStaff(["Manager"]);       // only Managers allowed
 */
export async function getCurrentStaff(allowedRoles?: string[]) {
  const session = await getSession();

  if (!session) {
    redirect("/slogin");
  }

  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { id: true, fullName: true, role: true },
  });

  if (!staff) {
    redirect("/slogin");
  }

  // Server-side enforcement — even if someone reaches this page's URL
  // directly, this check runs before any data is fetched or returned.
  if (allowedRoles && !allowedRoles.includes(staff.role)) {
    redirect("/staffdashboard?error=not-authorized");
  }

  return staff;
}