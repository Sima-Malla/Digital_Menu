// app/(admin)/areas/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAreasForBusiness } from "@/lib/areas";
import AreaManagementClient from "./AreaManagementClient";

export default async function AreaManagementPage() {
  const session = await getSession();
  if (!session?.businessId) {
    redirect("/login");
  }

  const areas = await getAreasForBusiness(BigInt(session.businessId));

  return <AreaManagementClient initialAreas={areas} businessId={session.businessId} />;
}