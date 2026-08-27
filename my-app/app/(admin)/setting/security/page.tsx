import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSecurityData } from "@/lib/setting/security-setting";
import SecurityClient from "./SecurityClient";

export default async function SecurityPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }

  const securityData = await getSecurityData(session.userId);
  if (!securityData) {
    redirect("/login");
  }

  return <SecurityClient initialData={securityData} />;
}