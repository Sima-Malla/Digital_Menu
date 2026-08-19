"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PATH = "/settings/platform";

export type Settings = {
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
};

export type Region = { id: string; name: string; active: boolean };

// ---- mappers: raw Prisma rows (bigint/Decimal) -> plain client types ----

type RawSettings = Awaited<ReturnType<typeof prisma.platformSettings.upsert>>;
type RawRegion = Awaited<ReturnType<typeof prisma.platformRegion.create>>;

function mapSettings(s: RawSettings): Settings {
  return {
    platformName: s.platformName,
    brandColor: s.brandColor,
    defaultCurrency: s.defaultCurrency,
    timezone: s.timezone,
    termsUrl: s.termsUrl ?? "",
    privacyUrl: s.privacyUrl ?? "",
    defaultCommissionPct: Number(s.defaultCommissionPct),
    minOrderValue: Number(s.minOrderValue),
    onlineOrdering: s.onlineOrdering,
    guestOrders: s.guestOrders,
    customerReviews: s.customerReviews,
    maintenanceMode: s.maintenanceMode,
  };
}

function mapRegion(r: RawRegion): Region {
  return {
    id: r.id.toString(),
    name: r.name,
    active: r.active,
  };
}

// ---- settings ------------------------------------------------------------

export async function getSettingsAndRegions() {
  const settings = await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
    include: { regions: { orderBy: { name: "asc" } } },
  });

  return {
    ...mapSettings(settings),
    regions: settings.regions.map(mapRegion),
  };
}

export async function updateSettings(data: Partial<Settings>) {
  const allowedFields: (keyof Settings)[] = [
    "platformName",
    "brandColor",
    "defaultCurrency",
    "timezone",
    "termsUrl",
    "privacyUrl",
    "defaultCommissionPct",
    "minOrderValue",
    "onlineOrdering",
    "guestOrders",
    "customerReviews",
    "maintenanceMode",
  ];

  const payload: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in data) payload[field] = data[field];
  }

  const settings = await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: payload,
    create: { id: 1, ...payload },
  });

  revalidatePath(PATH);
  return mapSettings(settings);
}

// ---- regions: search + filter --------------------------------------------

export async function searchRegions(query: string, filter: "all" | "active" | "inactive") {
  const q = query.trim();

  const regions = await prisma.platformRegion.findMany({
    where: {
      settingsId: 1,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(filter !== "all" ? { active: filter === "active" } : {}),
    },
    orderBy: { name: "asc" },
  });

  return regions.map(mapRegion);
}

export async function addRegion(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Region name is required");

  await prisma.platformSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const region = await prisma.platformRegion.create({
    data: { settingsId: 1, name: trimmed },
  });

  revalidatePath(PATH);
  return mapRegion(region);
}

export async function removeRegion(id: string) {
  await prisma.platformRegion.delete({ where: { id: BigInt(id) } });
  revalidatePath(PATH);
}

export async function toggleRegionActive(id: string, active: boolean) {
  const region = await prisma.platformRegion.update({
    where: { id: BigInt(id) },
    data: { active },
  });
  revalidatePath(PATH);
  return mapRegion(region);
}