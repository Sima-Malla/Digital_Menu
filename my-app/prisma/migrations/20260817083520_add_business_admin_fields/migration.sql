-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'Basic',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pending';
