-- CreateEnum
CREATE TYPE "BriefOptionType" AS ENUM ('SEASON', 'CATEGORY');

-- CreateTable
CREATE TABLE "brief_options" (
    "id" TEXT NOT NULL,
    "type" "BriefOptionType" NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brief_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brief_options_type_active_sortOrder_idx" ON "brief_options"("type", "active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "brief_options_type_label_key" ON "brief_options"("type", "label");
