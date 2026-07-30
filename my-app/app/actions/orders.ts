"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type CheckoutState = {
  success: boolean;
  message: string;
  orderId?: string;
  fieldErrors?: Record<string, string>;
};

export const checkoutAction = async (input: CheckoutInput): Promise<CheckoutState> => {
  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const businessId = BigInt(data.businessId);

  // Re-fetch every dish from the DB — NEVER trust price/name the client sent.
  // A tampered request could otherwise submit fake (lower) prices.
  const menuItemIds = data.items.map((i) => BigInt(i.menuItemId));
  const dbItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, businessId, isActive: true },
  });

  if (dbItems.length !== data.items.length) {
    return { success: false, message: "One or more items in your cart are no longer available." };
  }

  const dbItemsById = new Map(dbItems.map((item) => [item.id.toString(), item]));

  let totalAmount = 0;
  const orderItemsData = data.items.map((cartItem) => {
    const dbItem = dbItemsById.get(cartItem.menuItemId)!;
    const lineTotal = Number(dbItem.price) * cartItem.quantity;
    totalAmount += lineTotal;
    return {
      menuItemId: dbItem.id,
      name: dbItem.name,
      unitPrice: dbItem.price,
      quantity: cartItem.quantity,
      notes: cartItem.notes || null,
    };
  });

  // Find-or-create the customer by phone — repeat guests reuse the same row.
  const customer = await prisma.customer.upsert({
    where: { phone: data.customerPhone },
    update: {
      name: data.customerName,
      email: data.customerEmail || undefined,
    },
    create: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail || null,
    },
  });

  // Find-or-create the table/location if one was given (dine-in orders).
  let locationId: bigint | null = null;
  if (data.locationLabel) {
    const location = await prisma.location.upsert({
      where: { businessId_label: { businessId, label: data.locationLabel } },
      update: {},
      create: { businessId, label: data.locationLabel, type: data.orderType },
    });
    locationId = location.id;
  }

  const order = await prisma.order.create({
    data: {
      businessId,
      customerId: customer.id,
      locationId,
      orderType: data.orderType,
      totalAmount,
      items: { create: orderItemsData },
    },
  });

  return { success: true, message: "Order placed!", orderId: order.id.toString() };
}