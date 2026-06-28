-- AlterTable
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "season" TEXT;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "styleSummary" TEXT;
