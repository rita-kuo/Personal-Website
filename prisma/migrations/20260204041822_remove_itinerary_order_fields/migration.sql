/*
  Warnings:

  - You are about to drop the column `order` on the `ItineraryDay` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ItineraryItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItineraryDay" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "ItineraryItem" DROP COLUMN "order";
