-- Proposal version + sections model (align DB with Prisma schema)

ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS "proposal_sections" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "proposal_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "proposal_sections_proposalId_idx" ON "proposal_sections"("proposalId");

ALTER TABLE "proposal_sections" DROP CONSTRAINT IF EXISTS "proposal_sections_proposalId_fkey";
ALTER TABLE "proposal_sections" ADD CONSTRAINT "proposal_sections_proposalId_fkey"
  FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate legacy proposal_items (proposalId) -> sections
ALTER TABLE "proposal_items" ADD COLUMN IF NOT EXISTS "sectionId" TEXT;
ALTER TABLE "proposal_items" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;

DO $$
DECLARE
  r RECORD;
  sec_id TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_items' AND column_name = 'proposalId'
  ) THEN
    FOR r IN SELECT DISTINCT "proposalId" FROM "proposal_items" WHERE "proposalId" IS NOT NULL LOOP
      sec_id := 'migrated-section-' || r."proposalId";
      INSERT INTO "proposal_sections" ("id", "proposalId", "title", "position", "updatedAt")
      VALUES (sec_id, r."proposalId", 'Collection', 0, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO NOTHING;
      UPDATE "proposal_items"
      SET "sectionId" = sec_id
      WHERE "proposalId" = r."proposalId" AND "sectionId" IS NULL;
    END LOOP;
  END IF;
END $$;

-- Drop legacy proposalId on items if present
ALTER TABLE "proposal_items" DROP CONSTRAINT IF EXISTS "proposal_items_proposalId_fkey";
ALTER TABLE "proposal_items" DROP COLUMN IF EXISTS "proposalId";

ALTER TABLE "proposal_items" ALTER COLUMN "sectionId" SET NOT NULL;

ALTER TABLE "proposal_items" DROP CONSTRAINT IF EXISTS "proposal_items_sectionId_fkey";
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "proposal_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "proposal_items_sectionId_idx" ON "proposal_items"("sectionId");
