-- Fashion-specific structured brief fields
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "garmentCategories" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "targetPricePointMillimes" INTEGER;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "sustainabilityRequirements" TEXT;
