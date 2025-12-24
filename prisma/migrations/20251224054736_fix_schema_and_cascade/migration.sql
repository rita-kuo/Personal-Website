-- DropForeignKey
ALTER TABLE "Level" DROP CONSTRAINT "Level_gameId_fkey";

-- DropForeignKey
ALTER TABLE "LevelDetail" DROP CONSTRAINT "LevelDetail_levelId_fkey";

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelDetail" ADD CONSTRAINT "LevelDetail_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
