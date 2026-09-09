import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOperatingHoursData } from "@/lib/setting/operating-hour";
import OperatingHoursClient from "./OperatingHoursClient";

export default async function OperatingHoursPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }
  if (!session.businessId) redirect("/login");

  const data = await getOperatingHoursData(BigInt(session.businessId));

  return <OperatingHoursClient initialData={data} />;
}