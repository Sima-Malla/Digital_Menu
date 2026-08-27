// app/actions/adminsetting/generalsetting.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { updateGeneralSettings, type GeneralSettings } from "@/lib/setting/generalsetting";
import { uploadMenuImage } from "@/lib/uploadcare-storage";

const SETTINGS_PATH = "/setting/generalsetting";

export async function saveGeneralSettingsAction(data: GeneralSettings) {
  const session = await getSession();
  if (!session?.businessId) {
    return { success: false, error: "Not authenticated. Please log in again." };
  }

  if (!data.restaurantName || data.restaurantName.trim() === "") {
    return { success: false, error: "Restaurant Name cannot be empty." };
  }

  try {
    await updateGeneralSettings(BigInt(session.businessId), {
      ...data,
      restaurantName: data.restaurantName.trim(),
      phone: data.phone?.trim() ?? "",
      email: data.email?.trim() ?? "",
      website: data.website?.trim() ?? "",
      instagram: data.instagram?.trim() ?? "",
      facebook: data.facebook?.trim() ?? "",
      twitter: data.twitter?.trim() ?? "",
    });

    revalidatePath(SETTINGS_PATH);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Failed to save general settings:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save settings. Please try again.",
    };
  }
}

export async function uploadGeneralSettingImageAction(formData: FormData) {
  const session = await getSession();
  if (!session?.businessId) {
    return { success: false, error: "Not authenticated." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No image file provided." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Selected file must be an image." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Image size must be less than 5MB." };
  }

  try {
    const url = await uploadMenuImage(file, "branding");
    return { success: true, url };
  } catch (err) {
    console.error("Failed to upload branding image:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload image.",
    };
  }
}