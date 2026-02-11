-- CreateEnum
CREATE TYPE "TripAccess" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "ItineraryTrip" ADD COLUMN     "access" "TripAccess" NOT NULL DEFAULT 'PRIVATE';
