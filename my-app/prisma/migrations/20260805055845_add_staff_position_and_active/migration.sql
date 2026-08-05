-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" TEXT NOT NULL DEFAULT 'Waiter';
