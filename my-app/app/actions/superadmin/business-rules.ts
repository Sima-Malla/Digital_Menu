"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/log-event";
import { createSuperAdminNotification } from "@/lib/superadmin-notifications";

const PATH = "/settings/business";

export type BusinessRulesData = {
  autoApproveBusinesses: boolean;
  requireVerification: boolean;
  defaultBusinessStatus: string;
  payoutFrequency: string;
  payoutThreshold: number;
  documents: { id: string; name: string; required: boolean }[];
  tiers: { id: string; name: string; commission: number }[];
};

export type SaveResult = { success: true } | { success: false; message: string };

type RawRule = Awaited<ReturnType<typeof getOrCreateRule>>;

async function getOrCreateRule() {
  const existing = await prisma.businessRule.findFirst({
    include: {
      documents: { orderBy: { sortOrder: "asc" } },
      tiers: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (existing) return existing;

  return prisma.businessRule.create({
    data: {},
    include: {
      documents: { orderBy: { sortOrder: "asc" } },
      tiers: { orderBy: { sortOrder: "asc" } },
    },
  });
}

function mapRule(rule: RawRule): BusinessRulesData {
  return {
    autoApproveBusinesses: rule.autoApproveBusinesses,
    requireVerification: rule.requireVerification,
    defaultBusinessStatus: rule.defaultBusinessStatus,
    payoutFrequency: rule.payoutFrequency,
    payoutThreshold: Number(rule.payoutThreshold),
    documents: rule.documents.map((d) => ({ id: d.id.toString(), name: d.name, required: d.required })),
    tiers: rule.tiers.map((t) => ({ id: t.id.toString(), name: t.name, commission: Number(t.commission) })),
  };
}

export async function getBusinessRules(): Promise<BusinessRulesData> {
  const rule = await getOrCreateRule();
  return mapRule(rule);
}

export async function saveBusinessRules(data: BusinessRulesData): Promise<SaveResult> {
  try {
    const rule = await getOrCreateRule();

    await prisma.businessRule.update({
      where: { id: rule.id },
      data: {
        autoApproveBusinesses: data.autoApproveBusinesses,
        requireVerification: data.requireVerification,
        defaultBusinessStatus: data.defaultBusinessStatus,
        payoutFrequency: data.payoutFrequency,
        payoutThreshold: data.payoutThreshold,
        // minOrderValue intentionally left untouched — dropped from the
        // UI/type, but the schema column still exists with its default.
      },
    });

    await prisma.requiredDocument.deleteMany({ where: { ruleId: rule.id } });
    if (data.documents.length > 0) {
      await prisma.requiredDocument.createMany({
        data: data.documents.map((d, i) => ({
          ruleId: rule.id,
          name: d.name,
          required: d.required,
          sortOrder: i,
        })),
      });
    }

    await prisma.commissionTier.deleteMany({ where: { ruleId: rule.id } });
    if (data.tiers.length > 0) {
      await prisma.commissionTier.createMany({
        data: data.tiers.map((t, i) => ({
          ruleId: rule.id,
          name: t.name,
          commission: t.commission,
          sortOrder: i,
        })),
      });
    }

    await logEvent({
      event: "Business Rules Updated",
      module: "Settings",
      status: "Success",
    });

    await createSuperAdminNotification({
      title: "Business Rules & Tiers Updated",
      message: "Platform business verification rules, commission tiers, or payout limits were updated.",
      type: "system_alert",
    });

    revalidatePath(PATH);
    return { success: true };
  } catch (err) {
    console.error("saveBusinessRules failed:", err);
    return { success: false, message: "Could not save business rules. Please try again." };
  }
}