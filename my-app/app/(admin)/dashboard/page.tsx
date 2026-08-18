import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboardData } from "@/app/actions/admin/dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }

  const data = await getDashboardData();
  if (!data) redirect("/login");

  return <DashboardClient data={data} />;
}
