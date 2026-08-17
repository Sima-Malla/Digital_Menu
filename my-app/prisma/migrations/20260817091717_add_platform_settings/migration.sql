-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "platformName" TEXT NOT NULL DEFAULT 'Bistro Central',
    "brandColor" TEXT NOT NULL DEFAULT '#F97316',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'NPR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kathmandu',
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "defaultCommissionPct" DECIMAL(5,2) NOT NULL DEFAULT 12,
    "minOrderValue" DECIMAL(10,2) NOT NULL DEFAULT 200,
    "onlineOrdering" BOOLEAN NOT NULL DEFAULT true,
    "guestOrders" BOOLEAN NOT NULL DEFAULT true,
    "customerReviews" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformRegion" (
    "id" BIGSERIAL NOT NULL,
    "settingsId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformRegion_settingsId_idx" ON "PlatformRegion"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRegion_settingsId_name_key" ON "PlatformRegion"("settingsId", "name");

-- AddForeignKey
ALTER TABLE "PlatformRegion" ADD CONSTRAINT "PlatformRegion_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "PlatformSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
