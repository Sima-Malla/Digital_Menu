"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

const ALLOWED_ROLES = ["owner", "manager", "staff"];

async function requireBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role) || !session.businessId) return null;
  return BigInt(session.businessId);
}

export type CartLine = {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes: string;
};

// Customer.phone is unique + required, so walk-ins can't each get a blank
// row. One reusable placeholder Customer per business instead.
function walkInPhoneFor(businessId: bigint) {
  return `WALKIN-${businessId}`;
}

export async function createPosOrderAction(input: {
  cart: CartLine[];
  orderType: "dine-in" | "pickup" | "delivery";
  locationId: string | null;
  isWalkIn: boolean;
  customerName: string;
  customerPhone: string;
}): Promise<{ success: boolean; message?: string; orderId?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  if (input.cart.length === 0) {
    return { success: false, message: "Cart is empty" };
  }

  const phone = input.isWalkIn ? walkInPhoneFor(businessId) : input.customerPhone.trim();
  if (!input.isWalkIn && !phone) {
    return { success: false, message: "Customer phone is required" };
  }

  if (input.orderType === "dine-in" && !input.locationId) {
    return { success: false, message: "Select a table for dine-in orders" };
  }

  const totalAmount = input.cart.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Validate the location belongs to this business — guards against a
      // tampered locationId from the client.
      if (input.locationId) {
        const location = await tx.location.findFirst({
          where: { id: BigInt(input.locationId), businessId },
        });
        if (!location) {
          throw new Error("INVALID_LOCATION");
        }
      }

      const customer = await tx.customer.upsert({
        where: { phone },
        update: input.isWalkIn ? {} : { name: input.customerName.trim() || undefined },
        create: {
          name: input.isWalkIn ? "Walk-in Customer" : input.customerName.trim() || "Guest",
          phone,
        },
      });

      return tx.order.create({
        data: {
          businessId,
          customerId: customer.id,
          locationId: input.locationId ? BigInt(input.locationId) : null,
          orderType: input.orderType,
          status: "new",
          paymentStatus: "unpaid",
          totalAmount,
          items: {
            create: input.cart.map((line) => ({
              menuItemId: BigInt(line.menuItemId),
              name: line.name,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              notes: line.notes || null,
            })),
          },
        },
      });
    });

    revalidatePath("/orders");
    revalidatePath("/pos");

    // Trigger notification for Admin and Staff on POS order placement
    import("@/lib/notifications").then(({ createBusinessNotification }) => {
      const customerDisp = input.isWalkIn ? "Walk-in Customer" : (input.customerName.trim() || "Guest");
      createBusinessNotification({
        businessId,
        type: "new_order",
        title: `New POS Order #${order.id.toString()}`,
        message: `A new POS ${input.orderType} order worth NPR ${totalAmount.toLocaleString()} was placed for ${customerDisp}.`,
        target: "all",
        orderId: order.id,
      }).catch(console.error);
    });

    // Notify SuperAdmin about POS order
    import("@/lib/superadmin-notifications").then(({ createSuperAdminNotification }) => {
      const customerDisp = input.isWalkIn ? "Walk-in Customer" : (input.customerName.trim() || "Guest");
      createSuperAdminNotification({
        title: `New POS Order #${order.id.toString()}`,
        message: `POS order #${order.id.toString()} (${input.orderType}) worth NPR ${totalAmount.toLocaleString()} placed for ${customerDisp}.`,
        type: "system_alert",
      }).catch(console.error);
    });

    return { success: true, orderId: order.id.toString() };
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_LOCATION") {
      return { success: false, message: "Selected table is not valid — please pick again." };
    }
    console.error("Failed to create POS order:", err);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}