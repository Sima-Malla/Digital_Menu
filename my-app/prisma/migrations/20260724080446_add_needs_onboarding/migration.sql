/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `staffRole` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "inviteCode",
DROP COLUMN "staffRole",
ADD COLUMN     "needsOnboarding" BOOLEAN NOT NULL DEFAULT false;
