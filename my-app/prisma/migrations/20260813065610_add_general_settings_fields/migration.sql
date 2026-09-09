/*
  Warnings:
  - A unique constraint covering the columns `[email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "allowReviews" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'NPR (Rs.)';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'English (US)';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "listInMarketplace" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "showOnMap" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "taxRegistration" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'EST (UTC-5)';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Business_email_key" ON "Business"("email");
