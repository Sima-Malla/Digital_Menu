import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

const ALLOWED_ROLES = ["owner", "manager", "staff"];

export default async function StaffOrdersPage() {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) {
    redirect("/login");
  }

  const business = await prisma.business.findUnique({
    where: { id: BigInt(session.businessId) },
    select: { businessName: true },
  });

  return <OrdersClient businessName={business?.businessName ?? "your business"} />;
}