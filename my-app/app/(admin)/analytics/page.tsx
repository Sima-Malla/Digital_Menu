import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAnalyticsData } from "@/lib/admin/analytics";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session?.businessId) {
    redirect("/login");
  }

  const data = await getAnalyticsData(BigInt(session.businessId));

  return <AnalyticsClient data={data} />;
}