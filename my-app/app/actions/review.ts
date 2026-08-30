"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export async function submitReviewAction(input: {
  businessId: string;
  name: string;
  rating: number;
  comment?: string;
}): Promise<{ success: boolean; message?: string }> {
  const name = input.name.trim();
  if (!name) return { success: false, message: "Please enter your name." };
  if (input.rating < 1 || input.rating > 5) return { success: false, message: "Rating must be between 1 and 5." };

  await prisma.businessReview.create({
    data: {
      businessId: BigInt(input.businessId),
      name,
      rating: input.rating,
      comment: input.comment?.trim() || null,
    },
  });
  return { success: true };
}
