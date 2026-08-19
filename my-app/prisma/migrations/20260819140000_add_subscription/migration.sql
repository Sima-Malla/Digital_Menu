-- CreateTable
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cycle" TEXT NOT NULL DEFAULT 'Monthly',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubscriptionSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "trialEnabled" BOOLEAN NOT NULL DEFAULT true,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "requireCardForTrial" BOOLEAN NOT NULL DEFAULT false,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 13,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "autoGenerateInvoice" BOOLEAN NOT NULL DEFAULT true,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 5,
    "sendReminders" BOOLEAN NOT NULL DEFAULT true,
    "autoSuspend" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionSettings_pkey" PRIMARY KEY ("id")
);