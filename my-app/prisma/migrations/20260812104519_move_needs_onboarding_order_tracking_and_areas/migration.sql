-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "escalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Area" (
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
CREATE TABLE "SubUnit" (
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
CREATE INDEX "Area_businessId_idx" ON "Area"("businessId");

-- CreateIndex
CREATE INDEX "SubUnit_areaId_idx" ON "SubUnit"("areaId");

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubUnit" ADD CONSTRAINT "SubUnit_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
