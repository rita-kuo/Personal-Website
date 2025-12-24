/*
  Warnings:

  - Added the required column `name` to the `LevelDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LevelDetail" ADD COLUMN     "name" TEXT NOT NULL;
