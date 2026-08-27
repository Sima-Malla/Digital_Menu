// app/(admin)/general-settings/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getGeneralSettings } from "@/lib/setting/generalsetting";
import GeneralSettingsClient from "./generalSettingsClient";

export default async function GeneralSettingsPage() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    redirect("/login");
  }
  if (!session.businessId) {
    redirect("/login");
  }

  const settings = await getGeneralSettings(BigInt(session.businessId));
  if (!settings) {
    redirect("/login");
  }

  return <GeneralSettingsClient initialSettings={settings} />;
}