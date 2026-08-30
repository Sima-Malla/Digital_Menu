import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type PaymentSettingsData = {
  methods: { methodKey: string; name: string; enabled: boolean }[];
  gateways: {
    gatewayKey: string;
    name: string;
    enabled: boolean;
    hasApiKey: boolean;
    hasSecretKey: boolean;
    lastTestOk: boolean | null;
  }[];
  settings: {
    transactionFee: number;
    feeBearer: "Business" | "Customer";
    autoRefund: boolean;
    refundWindowDays: number;
    manualApproval: boolean;
  };
};

// Only what's actually needed: Cash on Delivery, plus Nepal's dominant
// wallets/gateways. Card/Stripe intentionally left out — add it back here
// (and to the client) the day you actually need international card acceptance.
const REQUIRED_METHODS = [{ methodKey: "cod", name: "Cash on Delivery" }];
const REQUIRED_GATEWAYS = [
  { gatewayKey: "esewa", name: "eSewa" },
  { gatewayKey: "fonepay", name: "FonePay" },
];

export async function getPaymentSettings(businessId: bigint): Promise<PaymentSettingsData> {
  const [methodRows, gatewayRows, settingsRow] = await Promise.all([
    prisma.paymentMethod.findMany({ where: { businessId } }),
    prisma.paymentGateway.findMany({ where: { businessId } }),
    prisma.paymentSettings.findUnique({ where: { businessId } }),
  ]);

  const methods = REQUIRED_METHODS.map((def) => {
    const row = methodRows.find((m) => m.methodKey === def.methodKey);
    return { methodKey: def.methodKey, name: row?.name ?? def.name, enabled: row?.enabled ?? false };
  });

  // Never send apiKeyEnc/secretKeyEnc to the client — only whether they exist.
  const gateways = REQUIRED_GATEWAYS.map((def) => {
    const row = gatewayRows.find((g) => g.gatewayKey === def.gatewayKey);
    return {
      gatewayKey: def.gatewayKey,
      name: row?.name ?? def.name,
      enabled: row?.enabled ?? false,
      hasApiKey: Boolean(row?.apiKeyEnc),
      hasSecretKey: Boolean(row?.secretKeyEnc),
      lastTestOk: row?.lastTestOk ?? null as boolean | null,
    };
  });

  const settings = {
    transactionFee: settingsRow ? Number(settingsRow.transactionFee) : 2.5,
    feeBearer: (settingsRow?.feeBearer ?? "Business") as "Business" | "Customer",
    autoRefund: settingsRow?.autoRefund ?? true,
    refundWindowDays: settingsRow?.refundWindowDays ?? 7,
    manualApproval: settingsRow?.manualApproval ?? true,
  };

  return { methods, gateways, settings };
}