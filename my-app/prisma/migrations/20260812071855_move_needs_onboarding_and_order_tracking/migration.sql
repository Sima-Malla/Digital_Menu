/*
  Warnings:

  - You are about to drop the column `needsOnboarding` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "needsOnboarding";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "needsOnboarding" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PlatformUser" (
    "id" BIGSERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Viewer',
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformUserActivity" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformUserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" BIGSERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'Info',
    "status" TEXT NOT NULL,
    "userName" TEXT,
    "userInitials" TEXT,
    "business" TEXT,
    "ipAddress" TEXT,
    "details" TEXT,
    "isSecurityEvent" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRule" (
    "id" BIGSERIAL NOT NULL,
    "autoApproveBusinesses" BOOLEAN NOT NULL DEFAULT false,
    "requireVerification" BOOLEAN NOT NULL DEFAULT true,
    "defaultBusinessStatus" TEXT NOT NULL DEFAULT 'Pending',
    "payoutFrequency" TEXT NOT NULL DEFAULT 'Weekly',
    "payoutThreshold" DECIMAL(10,2) NOT NULL DEFAULT 1000,
    "payoutMethod" TEXT NOT NULL DEFAULT 'Bank Transfer',
    "minOrderValue" DECIMAL(10,2) NOT NULL DEFAULT 150,
    "allowPerBusinessOverride" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredDocument" (
    "id" BIGSERIAL NOT NULL,
    "ruleId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RequiredDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionTier" (
    "id" BIGSERIAL NOT NULL,
    "ruleId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "commission" DECIMAL(5,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CommissionTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformUser_email_key" ON "PlatformUser"("email");

-- CreateIndex
CREATE INDEX "PlatformUserActivity_userId_idx" ON "PlatformUserActivity"("userId");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_module_idx" ON "SystemLog"("module");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_archived_idx" ON "SystemLog"("archived");

-- CreateIndex
CREATE INDEX "RequiredDocument_ruleId_idx" ON "RequiredDocument"("ruleId");

-- CreateIndex
CREATE INDEX "CommissionTier_ruleId_idx" ON "CommissionTier"("ruleId");

-- AddForeignKey
ALTER TABLE "PlatformUserActivity" ADD CONSTRAINT "PlatformUserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredDocument" ADD CONSTRAINT "RequiredDocument_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BusinessRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionTier" ADD CONSTRAINT "CommissionTier_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BusinessRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
