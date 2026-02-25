/*
  Warnings:

  - You are about to drop the column `duration` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `events` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "EventVisibility" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "events" DROP COLUMN "duration",
DROP COLUMN "tags",
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "games" TEXT[],
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringEndDate" TIMESTAMP(3),
ADD COLUMN     "recurringPattern" TEXT;
