// app/(admin)/general-settings/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { updateGeneralSettings, type GeneralSettings } from "@/lib/setting/generalsetting";

const SETTINGS_PATH = "/general-settings"; // update to your actual route

export async function saveGeneralSettingsAction(data: GeneralSettings) {
  const session = await getSession();
  if (!session?.businessId) return { success: false, error: "Not authenticated" };

  try {
    await updateGeneralSettings(BigInt(session.businessId), data);
  } catch (err) {
    console.error("Failed to save general settings:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}