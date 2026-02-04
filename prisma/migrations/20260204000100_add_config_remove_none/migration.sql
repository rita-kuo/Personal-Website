-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- UpdateEnum
ALTER TABLE "LevelDetail" ALTER COLUMN "actionType" DROP DEFAULT;
UPDATE "LevelDetail" SET "actionType" = 'IMAGE' WHERE "actionType" = 'NONE';
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
CREATE TYPE "ActionType" AS ENUM ('IMAGE', 'IOT');
ALTER TABLE "LevelDetail" ALTER COLUMN "actionType" TYPE "ActionType" USING ("actionType"::text::"ActionType");
DROP TYPE "ActionType_old";
ALTER TABLE "LevelDetail" ALTER COLUMN "actionType" SET DEFAULT 'IMAGE';
