-- User email notification preference
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailNotifications" BOOLEAN NOT NULL DEFAULT true;

-- RAG incremental indexing
ALTER TABLE "ai_embedding_chunks" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
