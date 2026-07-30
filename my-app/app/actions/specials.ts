"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import { specialSchema } from "@/lib/validations/menu";
import { uploadMenuImage, deleteMenuImage } from "@/lib/uploadcare-storage";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type SpecialState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

const MENU_EDITOR_PATH = "/admin/menu-editor";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Not authorized.");
  }
  return session;
}

function parseSpecialForm(formData: FormData) {
  return specialSchema.safeParse({
    menuItemId: formData.get("menuItemId"),
    badgeLabel: formData.get("badgeLabel"),
    scheduleType: formData.get("scheduleType"),
    weekday: formData.get("weekday") || undefined,
    date: formData.get("date") || undefined,
  });
}

function fieldErrorsFrom(error: import("zod").ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createSpecialAction(
  _prevState: SpecialState,
  formData: FormData
): Promise<SpecialState> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as an admin." };

  const parsed = parseSpecialForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  // Confirm the dish actually belongs to this business before attaching a special to it.
  const dish = await prisma.menuItem.findUnique({ where: { id: BigInt(parsed.data.menuItemId) } });
  if (!dish || dish.businessId !== BigInt(session.userId)) {
    return { success: false, message: "Dish not found.", fieldErrors: { menuItemId: "Invalid dish." } };
  }

  let imageUrl: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadMenuImage(file, "specials");
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  await prisma.special.create({
    data: {
      businessId: BigInt(session.userId),
      menuItemId: BigInt(parsed.data.menuItemId),
      badgeLabel: parsed.data.badgeLabel,
      scheduleType: parsed.data.scheduleType,
      weekday: parsed.data.scheduleType === "recurring" ? parsed.data.weekday : null,
      date: parsed.data.scheduleType === "one-time" && parsed.data.date ? new Date(parsed.data.date) : null,
      imageUrl,
    },
  });

  revalidatePath(MENU_EDITOR_PATH);
  return { success: true, message: "Special scheduled." };
}

export async function updateSpecialAction(
  _prevState: SpecialState,
  formData: FormData
): Promise<SpecialState> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as an admin." };

  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Missing special id." };

  const parsed = parseSpecialForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const existing = await prisma.special.findUnique({ where: { id: BigInt(id) } });
  if (!existing || existing.businessId !== BigInt(session.userId)) {
    return { success: false, message: "Special not found." };
  }

  const dish = await prisma.menuItem.findUnique({ where: { id: BigInt(parsed.data.menuItemId) } });
  if (!dish || dish.businessId !== BigInt(session.userId)) {
    return { success: false, message: "Dish not found.", fieldErrors: { menuItemId: "Invalid dish." } };
  }

  let imageUrl = existing.imageUrl;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadMenuImage(file, "specials");
      await deleteMenuImage(existing.imageUrl);
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  await prisma.special.update({
    where: { id: BigInt(id) },
    data: {
      menuItemId: BigInt(parsed.data.menuItemId),
      badgeLabel: parsed.data.badgeLabel,
      scheduleType: parsed.data.scheduleType,
      weekday: parsed.data.scheduleType === "recurring" ? parsed.data.weekday : null,
      date: parsed.data.scheduleType === "one-time" && parsed.data.date ? new Date(parsed.data.date) : null,
      imageUrl,
    },
  });

  revalidatePath(MENU_EDITOR_PATH);
  return { success: true, message: "Special updated." };
}

export async function deleteSpecialAction(id: string) {
  const session = await requireAdmin();

  const existing = await prisma.special.findUnique({ where: { id: BigInt(id) } });
  if (!existing || existing.businessId !== BigInt(session.userId)) {
    throw new Error("Special not found.");
  }

  await prisma.special.delete({ where: { id: BigInt(id) } });
  await deleteMenuImage(existing.imageUrl);

  revalidatePath(MENU_EDITOR_PATH);
}