"use server";

// Adjust this import to wherever your Prisma client singleton lives.
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PlatformSettingsData = {
  platformName: string;
  brandColor: string;

  defaultCurrency: string;
  timezone: string;

  termsUrl: string;
  privacyUrl: string;

  defaultCommissionPct: number;
  minOrderValue: number;

  onlineOrdering: boolean;
  guestOrders: boolean;
  customerReviews: boolean;
  maintenanceMode: boolean;

  regions: string[]; // active region names
};

async function getOrCreateSettingsRow() {
  const existing = await prisma.platformSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.platformSettings.create({ data: { id: 1 } });
}

export async function getPlatformSettings(): Promise<PlatformSettingsData> {
  const row = await getOrCreateSettingsRow();
  const regions = await prisma.platformRegion.findMany({
    where: { settingsId: 1, active: true },
    orderBy: { name: "asc" },
  });

  return {
    platformName: row.platformName,
    brandColor: row.brandColor,

    defaultCurrency: row.defaultCurrency,
    timezone: row.timezone,

    termsUrl: row.termsUrl ?? "",
    privacyUrl: row.privacyUrl ?? "",

    defaultCommissionPct: Number(row.defaultCommissionPct),
    minOrderValue: Number(row.minOrderValue),

    onlineOrdering: row.onlineOrdering,
    guestOrders: row.guestOrders,
    customerReviews: row.customerReviews,
    maintenanceMode: row.maintenanceMode,

    regions: regions.map((r) => r.name),
  };
}

export async function updatePlatformSettingsAction(input: PlatformSettingsData) {
  try {
    await getOrCreateSettingsRow();

    await prisma.$transaction(async (tx) => {
      await tx.platformSettings.update({
        where: { id: 1 },
        data: {
          platformName: input.platformName.trim() || "Bistro Central",
          brandColor: input.brandColor,

          defaultCurrency: input.defaultCurrency,
          timezone: input.timezone,

          termsUrl: input.termsUrl.trim() || null,
          privacyUrl: input.privacyUrl.trim() || null,

          defaultCommissionPct: input.defaultCommissionPct,
          minOrderValue: input.minOrderValue,

          onlineOrdering: input.onlineOrdering,
          guestOrders: input.guestOrders,
          customerReviews: input.customerReviews,
          maintenanceMode: input.maintenanceMode,
        },
      });

      // Sync regions: add new, reactivate existing, deactivate removed.
      const existingRegions = await tx.platformRegion.findMany({ where: { settingsId: 1 } });
      const existingByName = new Map(existingRegions.map((r) => [r.name, r]));
      const wantedNames = new Set(input.regions.map((r) => r.trim()).filter(Boolean));

      for (const name of wantedNames) {
        const existing = existingByName.get(name);
        if (!existing) {
          await tx.platformRegion.create({ data: { settingsId: 1, name, active: true } });
        } else if (!existing.active) {
          await tx.platformRegion.update({ where: { id: existing.id }, data: { active: true } });
        }
      }

      for (const region of existingRegions) {
        if (!wantedNames.has(region.name) && region.active) {
          await tx.platformRegion.update({ where: { id: region.id }, data: { active: false } });
        }
      }
    });

    revalidatePath("/settings");
    return { success: true, message: "Settings saved." };
  } catch (err) {
    console.error("updatePlatformSettingsAction error:", err);
    return { success: false, message: "Failed to save settings." };
  }
}

// Dedicated action for the maintenance-mode confirm modal.
export async function toggleMaintenanceModeAction(enabled: boolean) {
  try {
    await getOrCreateSettingsRow();
    await prisma.platformSettings.update({
      where: { id: 1 },
      data: { maintenanceMode: enabled },
    });
    revalidatePath("/settings");
    return { success: true, message: enabled ? "Maintenance mode enabled." : "Maintenance mode disabled." };
  } catch (err) {
    console.error("toggleMaintenanceModeAction error:", err);
    return { success: false, message: "Failed to update maintenance mode." };
  }
}