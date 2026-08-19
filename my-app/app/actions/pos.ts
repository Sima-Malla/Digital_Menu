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

export async function createPosOrderAction(input: {
  cart: CartLine[];
  orderType: "dine-in" | "pickup" | "delivery";
  locationId: string | null;
  customerName: string;
  customerPhone: string;
}): Promise<{ success: boolean; message?: string; orderId?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  if (input.cart.length === 0) {
    return { success: false, message: "Cart is empty" };
  }

  const phone = input.customerPhone.trim();
  if (!phone) {
    return { success: false, message: "Customer phone is required" };
  }

  const totalAmount = input.cart.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );

  try {
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone },
        update: { name: input.customerName.trim() || undefined },
        create: {
          name: input.customerName.trim() || "Walk-in Customer",
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

    return { success: true, orderId: order.id.toString() };
  } catch (err) {
    console.error("Failed to create POS order:", err);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}