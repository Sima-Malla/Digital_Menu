import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPaymentSettings } from "@/lib/queries/payment-setting";
import PaymentSettingsClient from "./PaymentSettingsClient";

const ALLOWED_ROLES = ["owner", "manager"];

export default async function PaymentSettingsPage() {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) {
    redirect("/login");
  }

  const data = await getPaymentSettings(BigInt(session.businessId));

  return <PaymentSettingsClient initialData={data} />;
}