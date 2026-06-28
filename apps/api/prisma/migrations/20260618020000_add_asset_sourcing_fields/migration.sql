-- Asset sourcing metadata + collection cover + lead status
-- (schema fields that were omitted when a prior migration was trimmed)

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "fabric_assets"
  ADD COLUMN IF NOT EXISTS "composition" TEXT,
  ADD COLUMN IF NOT EXISTS "color" TEXT,
  ADD COLUMN IF NOT EXISTS "supplier" TEXT,
  ADD COLUMN IF NOT EXISTS "moq" INTEGER,
  ADD COLUMN IF NOT EXISTS "leadTimeDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "pricePerUnitMillimes" INTEGER,
  ADD COLUMN IF NOT EXISTS "briefId" TEXT;

ALTER TABLE "product_assets"
  ADD COLUMN IF NOT EXISTS "composition" TEXT,
  ADD COLUMN IF NOT EXISTS "color" TEXT,
  ADD COLUMN IF NOT EXISTS "supplier" TEXT,
  ADD COLUMN IF NOT EXISTS "moq" INTEGER,
  ADD COLUMN IF NOT EXISTS "leadTimeDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "pricePerUnitMillimes" INTEGER,
  ADD COLUMN IF NOT EXISTS "briefId" TEXT;

ALTER TABLE "collections"
  ADD COLUMN IF NOT EXISTS "coverItemId" TEXT;

ALTER TABLE "leads"
  ADD COLUMN IF NOT EXISTS "status" "LeadStatus" NOT NULL DEFAULT 'NEW';
