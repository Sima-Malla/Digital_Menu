// app/(admin)/areas/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createArea as dbCreateArea,
  updateArea as dbUpdateArea,
  duplicateArea as dbDuplicateArea,
  deleteArea as dbDeleteArea,
  bulkSetAreaStatus as dbBulkSetAreaStatus,
  setSubUnitStatus as dbSetSubUnitStatus,
  type AreaInput,
  type AreaStatus,
  type SubUnitStatus,
} from "@/lib/areas";

const AREAS_PATH = "/areas"; // update to your actual route

async function requireBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session?.businessId) return null;
  return BigInt(session.businessId);
}

export async function createAreaAction(input: AreaInput) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const area = await dbCreateArea(businessId, input);
  revalidatePath(AREAS_PATH);
  return { success: true, area };
}

export async function updateAreaAction(areaId: string, input: AreaInput) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const area = await dbUpdateArea(businessId, BigInt(areaId), input);
  if (!area) return { success: false, error: "Area not found" };

  revalidatePath(AREAS_PATH);
  return { success: true, area };
}

export async function duplicateAreaAction(areaId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const area = await dbDuplicateArea(businessId, BigInt(areaId));
  if (!area) return { success: false, error: "Area not found" };

  revalidatePath(AREAS_PATH);
  return { success: true, area };
}

export async function deleteAreaAction(areaId: string) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const ok = await dbDeleteArea(businessId, BigInt(areaId));
  if (!ok) return { success: false, error: "Area not found" };

  revalidatePath(AREAS_PATH);
  return { success: true };
}

export async function bulkSetAreaStatusAction(areaIds: string[], status: AreaStatus) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const count = await dbBulkSetAreaStatus(businessId, areaIds.map(BigInt), status);
  revalidatePath(AREAS_PATH);
  return { success: true, count };
}

export async function setSubUnitStatusAction(
  areaId: string,
  subUnitId: string,
  status: SubUnitStatus
) {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, error: "Not authenticated" };

  const ok = await dbSetSubUnitStatus(businessId, BigInt(areaId), BigInt(subUnitId), status);
  if (!ok) return { success: false, error: "Not found" };

  revalidatePath(AREAS_PATH);
  return { success: true };
}