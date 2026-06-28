-- CreateTable
CREATE TABLE "moodboard_snapshots" (
    "id" TEXT NOT NULL,
    "moodboardId" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moodboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moodboard_snapshots_moodboardId_idx" ON "moodboard_snapshots"("moodboardId");

-- AddForeignKey
ALTER TABLE "moodboard_snapshots" ADD CONSTRAINT "moodboard_snapshots_moodboardId_fkey" FOREIGN KEY ("moodboardId") REFERENCES "moodboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;