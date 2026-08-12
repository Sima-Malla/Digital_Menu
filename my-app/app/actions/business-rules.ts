"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logSettings } from "@/lib/logger";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type DocumentInput = { id?: string; name: string; required: boolean };
export type TierInput = { id?: string; name: string; commission: number };

export type BusinessRulesData = {
  autoApproveBusinesses: boolean;
  requireVerification: boolean;
  defaultBusinessStatus: string;
  payoutFrequency: string;
  payoutThreshold: number;
  payoutMethod: string;
  minOrderValue: number;
  allowPerBusinessOverride: boolean;
  documents: { id: string; name: string; required: boolean }[];
  tiers: { id: string; name: string; commission: number }[];
};

const DEFAULTS: Omit<BusinessRulesData, "documents" | "tiers"> = {
  autoApproveBusinesses: false,
  requireVerification: true,
  defaultBusinessStatus: "Pending",
  payoutFrequency: "Weekly",
  payoutThreshold: 1000,
  payoutMethod: "Bank Transfer",
  minOrderValue: 150,
  allowPerBusinessOverride: true,
};

/* ------------------------------------------------------------------ */
/* getBusinessRules — fetches the singleton row, creating it with     */
/* sensible defaults the very first time the settings page is opened. */
/* ------------------------------------------------------------------ */

export async function getBusinessRules(): Promise<BusinessRulesData> {
  try {
    let rule = await prisma.businessRule.findFirst({
      include: {
        documents: { orderBy: { sortOrder: "asc" } },
        tiers: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!rule) {
      rule = await prisma.businessRule.create({
        data: {
          ...DEFAULTS,
          documents: {
            create: [
              { name: "Business Registration / License", required: true, sortOrder: 0 },
              { name: "Tax Registration (PAN / VAT)", required: true, sortOrder: 1 },
              { name: "Bank Account Details", required: true, sortOrder: 2 },
              { name: "Owner Citizenship / ID", required: false, sortOrder: 3 },
            ],
          },
          tiers: {
            create: [
              { name: "Standard", commission: 12, sortOrder: 0 },
              { name: "Premium Partner", commission: 8, sortOrder: 1 },
              { name: "New Business (first 3 months)", commission: 5, sortOrder: 2 },
            ],
          },
        },
        include: {
          documents: { orderBy: { sortOrder: "asc" } },
          tiers: { orderBy: { sortOrder: "asc" } },
        },
      });
    }

    return {
      autoApproveBusinesses: rule.autoApproveBusinesses,
      requireVerification: rule.requireVerification,
      defaultBusinessStatus: rule.defaultBusinessStatus,
      payoutFrequency: rule.payoutFrequency,
      payoutThreshold: Number(rule.payoutThreshold),
      payoutMethod: rule.payoutMethod,
      minOrderValue: Number(rule.minOrderValue),
      allowPerBusinessOverride: rule.allowPerBusinessOverride,
      documents: rule.documents.map((d) => ({ id: d.id.toString(), name: d.name, required: d.required })),
      tiers: rule.tiers.map((t) => ({ id: t.id.toString(), name: t.name, commission: Number(t.commission) })),
    };
  } catch (err) {
    console.error("getBusinessRules failed:", err);
    return { ...DEFAULTS, documents: [], tiers: [] };
  }
}

/* ------------------------------------------------------------------ */
/* saveBusinessRules — upserts the singleton + replaces the two lists */
/* in one transaction, then writes a Global Config system log.        */
/* ------------------------------------------------------------------ */

export async function saveBusinessRules(
  data: Omit<BusinessRulesData, "documents" | "tiers"> & {
    documents: DocumentInput[];
    tiers: TierInput[];
  },
  adminName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.businessRule.findFirst({ select: { id: true } });

    await prisma.$transaction(async (tx) => {
      const rule = existing
        ? await tx.businessRule.update({
            where: { id: existing.id },
            data: {
              autoApproveBusinesses: data.autoApproveBusinesses,
              requireVerification: data.requireVerification,
              defaultBusinessStatus: data.defaultBusinessStatus,
              payoutFrequency: data.payoutFrequency,
              payoutThreshold: data.payoutThreshold,
              payoutMethod: data.payoutMethod,
              minOrderValue: data.minOrderValue,
              allowPerBusinessOverride: data.allowPerBusinessOverride,
            },
          })
        : await tx.businessRule.create({
            data: {
              autoApproveBusinesses: data.autoApproveBusinesses,
              requireVerification: data.requireVerification,
              defaultBusinessStatus: data.defaultBusinessStatus,
              payoutFrequency: data.payoutFrequency,
              payoutThreshold: data.payoutThreshold,
              payoutMethod: data.payoutMethod,
              minOrderValue: data.minOrderValue,
              allowPerBusinessOverride: data.allowPerBusinessOverride,
            },
          });

      // Replace-all is simplest & safest for two short, fully-editable lists
      // (add/remove/reorder all happen client-side before save).
      await tx.requiredDocument.deleteMany({ where: { ruleId: rule.id } });
      await tx.commissionTier.deleteMany({ where: { ruleId: rule.id } });

      if (data.documents.length > 0) {
        await tx.requiredDocument.createMany({
          data: data.documents.map((d, i) => ({
            ruleId: rule.id,
            name: d.name,
            required: d.required,
            sortOrder: i,
          })),
        });
      }

      if (data.tiers.length > 0) {
        await tx.commissionTier.createMany({
          data: data.tiers.map((t, i) => ({
            ruleId: rule.id,
            name: t.name,
            commission: t.commission,
            sortOrder: i,
          })),
        });
      }
    });

    await logSettings.changed("Business Rules", adminName, "Business rules and commission settings updated");
    revalidatePath("/business-rules");

    return { success: true, message: "Changes saved." };
  } catch (err) {
    console.error("saveBusinessRules failed:", err);
    return { success: false, message: "Failed to save changes. Please try again." };
  }
}