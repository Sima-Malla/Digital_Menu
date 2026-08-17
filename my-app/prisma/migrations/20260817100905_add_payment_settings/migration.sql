-- CreateTable
CREATE TABLE "PaymentGateway" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "gatewayKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "apiKeyEnc" TEXT,
    "secretKeyEnc" TEXT,
    "lastTestOk" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" BIGSERIAL NOT NULL,
    "businessId" BIGINT NOT NULL,
    "methodKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSettings" (
    "businessId" BIGINT NOT NULL,
    "transactionFee" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "feeBearer" TEXT NOT NULL DEFAULT 'Business',
    "autoRefund" BOOLEAN NOT NULL DEFAULT true,
    "refundWindowDays" INTEGER NOT NULL DEFAULT 7,
    "manualApproval" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("businessId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGateway_businessId_gatewayKey_key" ON "PaymentGateway"("businessId", "gatewayKey");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_businessId_methodKey_key" ON "PaymentMethod"("businessId", "methodKey");

-- AddForeignKey
ALTER TABLE "PaymentGateway" ADD CONSTRAINT "PaymentGateway_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSettings" ADD CONSTRAINT "PaymentSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
