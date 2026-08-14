/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "allowReviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD ($)',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English (US)',
ADD COLUMN     "listInMarketplace" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "showOnMap" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "taxRegistration" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'EST (UTC-5)',
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");
