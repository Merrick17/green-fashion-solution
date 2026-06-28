-- CreateEnum
CREATE TYPE "MoodItemType" AS ENUM ('IMAGE', 'TEXT', 'COLOR', 'LINK', 'AI_GENERATED');

-- AlterTable
ALTER TABLE "moodboards" ADD COLUMN     "canvasViewport" JSONB;

-- CreateTable
CREATE TABLE "mood_items" (
    "id" TEXT NOT NULL,
    "moodboardId" TEXT NOT NULL,
    "type" "MoodItemType" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "content" JSONB NOT NULL,
    "style" JSONB,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mood_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mood_items_moodboardId_idx" ON "mood_items"("moodboardId");

-- CreateIndex
CREATE INDEX "mood_items_moodboardId_zIndex_idx" ON "mood_items"("moodboardId", "zIndex");

-- AddForeignKey
ALTER TABLE "mood_items" ADD CONSTRAINT "mood_items_moodboardId_fkey" FOREIGN KEY ("moodboardId") REFERENCES "moodboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
