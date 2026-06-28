-- Structured project brief fields
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "season" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "budgetBand" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "targetDelivery" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "moq" INTEGER;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "briefSubmittedAt" TIMESTAMP(3);
