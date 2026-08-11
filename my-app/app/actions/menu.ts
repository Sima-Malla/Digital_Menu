"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";
import { menuItemSchema } from "@/lib/validations/menu";
import { uploadMenuImage, deleteMenuImage } from "@/lib/uploadcare-storage";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type MenuItemState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

const MENU_EDITOR_PATH = "/admin/menu-editor";

/** Every action here re-checks the session itself — never trust a role or
 * businessId passed in from the client, always derive it from the cookie. */
async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    throw new Error("Not authorized.");
  }
  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  if (!staff) throw new Error("Staff record not found.");
  return { ...session, businessId: staff.businessId };
}

export async function createMenuItemAction(
  _prevState: MenuItemState,
  formData: FormData
): Promise<MenuItemState> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as an admin." };

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("price"),
    calories: formData.get("calories"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  let imageUrl: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadMenuImage(file, "dishes");
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  await prisma.menuItem.create({
    data: {
      businessId: session.businessId,
      name: parsed.data.name,
      category: parsed.data.category,
      price: parsed.data.price,
      calories: parsed.data.calories === "" ? null : parsed.data.calories,
      description: parsed.data.description || null,
      imageUrl,
    },
  });

  revalidatePath(MENU_EDITOR_PATH);
  return { success: true, message: "Dish added." };
}

export async function updateMenuItemAction(
  _prevState: MenuItemState, 
  formData: FormData
): Promise<MenuItemState> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { success: false, message: "You must be signed in as an admin." };

  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Missing dish id." };

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("price"),
    calories: formData.get("calories"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  // Ownership check: only the business that created this dish can edit it.
  const existing = await prisma.menuItem.findUnique({ where: { id: BigInt(id) } });
  if (!existing || existing.businessId !== session.businessId) {
    return { success: false, message: "Dish not found." };
  }

  let imageUrl = existing.imageUrl;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadMenuImage(file, "dishes");
      await deleteMenuImage(existing.imageUrl); // clean up the old file
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  await prisma.menuItem.update({
    where: { id: BigInt(id) },
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      price: parsed.data.price,
      calories: parsed.data.calories === "" ? null : parsed.data.calories,
      description: parsed.data.description || null,
      imageUrl,
    },
  });

  revalidatePath(MENU_EDITOR_PATH);
  return { success: true, message: "Dish updated." };
}

export async function deleteMenuItemAction(id: string) {
  const session = await requireAdmin();

  const existing = await prisma.menuItem.findUnique({ where: { id: BigInt(id) } });
  if (!existing || existing.businessId !== session.businessId) {
    throw new Error("Dish not found.");
  }

  // Specials referencing this dish are removed too (onDelete: Cascade in schema).
  await prisma.menuItem.delete({ where: { id: BigInt(id) } });
  await deleteMenuImage(existing.imageUrl);

  revalidatePath(MENU_EDITOR_PATH);
}

export async function toggleMenuItemActiveAction(id: string) {
  const session = await requireAdmin();

  const existing = await prisma.menuItem.findUnique({ where: { id: BigInt(id) } });
  if (!existing || existing.businessId !== session.businessId) {
    throw new Error("Dish not found.");
  }

  await prisma.menuItem.update({
    where: { id: BigInt(id) },
    data: { isActive: !existing.isActive },
  });

  revalidatePath(MENU_EDITOR_PATH);
}