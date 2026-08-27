import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSecurityLogsData } from "@/lib/setting/security-logs";
import SecurityLogsClient from "./SecurityLogsClient";

export default async function SecurityLogsPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }

  const logsData = await getSecurityLogsData();

  return <SecurityLogsClient initialData={logsData} />;
}