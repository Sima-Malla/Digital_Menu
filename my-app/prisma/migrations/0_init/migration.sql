-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Business" (
    "id" BIGSERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT,
    "businessAddress" TEXT,
    "businessPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "allowReviews" BOOLEAN NOT NULL DEFAULT true,
    "bannerUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NPR (Rs.)',
    "email" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English (US)',
    "listInMarketplace" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "showOnMap" BOOLEAN NOT NULL DEFAULT true,
    "taxId" TEXT,
    "taxRegistration" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'EST (UTC-5)',
    "twitter" TEXT,
    "website" TEXT,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" TEXT NOT NULL DEFAULT 'Waiter',
    "needsOnboarding" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" BIGSERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "calories" INTEGER,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Special" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "menuItemId" BIGINT NOT NULL,
    "badgeLabel" TEXT NOT NULL,
    "scheduleType" TEXT NOT NULL,
    "weekday" INTEGER,
    "date" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Special_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'dine-in',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "customerId" BIGINT NOT NULL,
    "locationId" BIGINT,
    "orderType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "delayReason" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "menuItemId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_businessId_idx" ON "Staff"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");

-- CreateIndex
CREATE INDEX "MenuItem_businessId_idx" ON "MenuItem"("businessId");

-- CreateIndex
CREATE INDEX "Special_businessId_idx" ON "Special"("businessId");

-- CreateIndex
CREATE INDEX "Special_menuItemId_idx" ON "Special"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Location_businessId_idx" ON "Location"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_businessId_label_key" ON "Location"("businessId", "label");

-- CreateIndex
CREATE INDEX "Order_businessId_idx" ON "Order"("businessId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

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

-- CreateIndex
CREATE INDEX "Area_businessId_idx" ON "Area"("businessId");

-- CreateIndex
CREATE INDEX "SubUnit_areaId_idx" ON "SubUnit"("areaId");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Special" ADD CONSTRAINT "Special_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Special" ADD CONSTRAINT "Special_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformUserActivity" ADD CONSTRAINT "PlatformUserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredDocument" ADD CONSTRAINT "RequiredDocument_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BusinessRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionTier" ADD CONSTRAINT "CommissionTier_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BusinessRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubUnit" ADD CONSTRAINT "SubUnit_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;


