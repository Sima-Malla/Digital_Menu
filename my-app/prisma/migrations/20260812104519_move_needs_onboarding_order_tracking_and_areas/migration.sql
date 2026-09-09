-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "escalated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "notifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Area" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "capacity" INTEGER NOT NULL,
    "unitCount" INTEGER NOT NULL,
    "style" TEXT NOT NULL,
    "note" TEXT,
    "occupancyRate" INTEGER NOT NULL DEFAULT 0,
    "revenueToday" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubUnit" (
    "id" BIGSERIAL NOT NULL,
    "areaId" BIGINT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "guestName" TEXT,
    "orderItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "orderPlacedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Area_businessId_idx" ON "Area"("businessId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubUnit_areaId_idx" ON "SubUnit"("areaId");

-- AddForeignKey (guarded: Postgres has no "ADD CONSTRAINT IF NOT EXISTS",
-- so skip if a constraint with this name already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Area_businessId_fkey'
    ) THEN
        ALTER TABLE "Area" ADD CONSTRAINT "Area_businessId_fkey"
            FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SubUnit_areaId_fkey'
    ) THEN
        ALTER TABLE "SubUnit" ADD CONSTRAINT "SubUnit_areaId_fkey"
            FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;