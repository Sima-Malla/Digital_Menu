// lib/areas.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/* ─── Types (shared with the client component) ───────────── */

export type AreaType = "dining" | "rooms";
export type AreaStatus = "available" | "cleaning" | "occupied" | "maintenance" | "blocked";
export type RoomOrderStatus =
  | "vacant"
  | "checked_in"
  | "order_placed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "do_not_disturb";
export type SubUnitStatus = AreaStatus | RoomOrderStatus;

export type SubUnit = {
  id: string;
  label: string;
  status: SubUnitStatus;
  guestName?: string | null;
  orderItems?: string[];
  orderPlacedAt?: string;
};

export type Area = {
  id: string;
  type: AreaType;
  name: string;
  status: AreaStatus;
  capacity: number;
  unitCount: number;
  style: string;
  note: string;
  occupancyRate: number;
  revenueToday: number;
  subUnits: SubUnit[];
};

export type AreaInput = {
  type: AreaType;
  name: string;
  unitCount: number;
  capacity: number;
  style: string;
  note: string;
};

/* ─── Mapping DB rows -> UI shape ─────────────────────────── */

function relativeTime(date: Date): string {
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
}

function toUISubUnit(u: {
  id: bigint;
  label: string;
  status: string;
  guestName: string | null;
  orderItems: string[];
  orderPlacedAt: Date | null;
}): SubUnit {
  return {
    id: u.id.toString(),
    label: u.label,
    status: u.status as SubUnitStatus,
    guestName: u.guestName,
    orderItems: u.orderItems.length > 0 ? u.orderItems : undefined,
    orderPlacedAt: u.orderPlacedAt ? relativeTime(u.orderPlacedAt) : undefined,
  };
}

function toUIArea(a: {
  id: bigint;
  type: string;
  name: string;
  status: string;
  capacity: number;
  unitCount: number;
  style: string;
  note: string | null;
  occupancyRate: number;
  revenueToday: unknown;
  SubUnit?: Parameters<typeof toUISubUnit>[0][];
}): Area {
  return {
    id: a.id.toString(),
    type: a.type as AreaType,
    name: a.name,
    status: a.status as AreaStatus,
    capacity: a.capacity,
    unitCount: a.unitCount,
    style: a.style,
    note: a.note ?? "",
    occupancyRate: a.occupancyRate,
    revenueToday: Number(a.revenueToday),
    subUnits: (a.SubUnit ?? []).map(toUISubUnit),
  };
}

/* ─── Queries ──────────────────────────────────────────────── */

export async function getAreasForBusiness(businessId: bigint): Promise<Area[]> {
  const areas = await prisma.area.findMany({
    where: { businessId },
    include: { SubUnit: { orderBy: { id: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return areas.map(toUIArea);
}

export async function findArea(businessId: bigint, areaId: bigint) {
  return prisma.area.findFirst({ where: { id: areaId, businessId } });
}

/* ─── Mutations ────────────────────────────────────────────── */

function unitLabelFor(type: AreaType) {
  return type === "rooms" ? "Room" : "Table";
}

function defaultSubUnitStatus(type: AreaType): SubUnitStatus {
  return type === "rooms" ? "vacant" : "available";
}

function buildSubUnitRows(type: AreaType, count: number) {
  const label = unitLabelFor(type);
  const status = defaultSubUnitStatus(type);
  return Array.from({ length: count }).map((_, i) => ({
    label: `${label} ${i + 1}`,
    status,
    updatedAt: new Date(),
  }));
}

export async function createArea(businessId: bigint, input: AreaInput): Promise<Area> {
  const area = await prisma.area.create({
    data: {
      businessId,
      type: input.type,
      name: input.name,
      capacity: input.capacity,
      unitCount: input.unitCount,
      style: input.style,
      note: input.note,
      updatedAt: new Date(),
      SubUnit: { create: buildSubUnitRows(input.type, input.unitCount) },
    },
    include: { SubUnit: true },
  });
  return toUIArea(area);
}

export async function updateArea(
  businessId: bigint,
  areaId: bigint,
  input: AreaInput
): Promise<Area | null> {
  const existing = await findArea(businessId, areaId);
  if (!existing) return null;

  const regenerateSubUnits =
    existing.unitCount !== input.unitCount || existing.type !== input.type;

  const area = await prisma.$transaction(async (tx) => {
    if (regenerateSubUnits) {
      await tx.subUnit.deleteMany({ where: { areaId } });
    }
    return tx.area.update({
      where: { id: areaId },
      data: {
        type: input.type,
        name: input.name,
        capacity: input.capacity,
        unitCount: input.unitCount,
        style: input.style,
        note: input.note,
        SubUnit: regenerateSubUnits
          ? { create: buildSubUnitRows(input.type, input.unitCount) }
          : undefined,
      },
      include: { SubUnit: { orderBy: { id: "asc" } } },
    });
  });

  return toUIArea(area);
}

export async function duplicateArea(businessId: bigint, areaId: bigint): Promise<Area | null> {
  const source = await prisma.area.findFirst({
    where: { id: areaId, businessId },
    include: { SubUnit: true },
  });
  if (!source) return null;

  const area = await prisma.area.create({
    data: {
      businessId,
      type: source.type,
      name: `${source.name} (Copy)`,
      status: "available",
      capacity: source.capacity,
      unitCount: source.unitCount,
      style: source.style,
      note: source.note,
      occupancyRate: 0,
      revenueToday: 0,
      updatedAt: new Date(),
      SubUnit: { create: buildSubUnitRows(source.type as AreaType, source.unitCount) },
    },
    include: { SubUnit: true },
  });
  return toUIArea(area);
}

export async function deleteArea(businessId: bigint, areaId: bigint): Promise<boolean> {
  const existing = await findArea(businessId, areaId);
  if (!existing) return false;
  await prisma.area.delete({ where: { id: areaId } });
  return true;
}

export async function bulkSetAreaStatus(
  businessId: bigint,
  areaIds: bigint[],
  status: AreaStatus
): Promise<number> {
  const result = await prisma.area.updateMany({
    where: { id: { in: areaIds }, businessId },
    data: { status },
  });
  return result.count;
}

export async function setAreaStatus(
  businessId: bigint,
  areaId: bigint,
  status: AreaStatus
): Promise<boolean> {
  const existing = await findArea(businessId, areaId);
  if (!existing) return false;
  await prisma.area.update({ where: { id: areaId }, data: { status } });
  return true;
}

export async function setSubUnitStatus(
  businessId: bigint,
  areaId: bigint,
  subUnitId: bigint,
  status: SubUnitStatus
): Promise<boolean> {
  const area = await findArea(businessId, areaId);
  if (!area) return false;

  const subUnit = await prisma.subUnit.findFirst({ where: { id: subUnitId, areaId } });
  if (!subUnit) return false;

  await prisma.subUnit.update({ where: { id: subUnitId }, data: { status } });
  return true;
}