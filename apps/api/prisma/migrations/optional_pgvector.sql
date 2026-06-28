-- Optional manual pgvector setup.
-- Run only if you skipped migrations:
--   npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/optional_pgvector.sql
--
-- Dimension must match EMBEDDING_DIMENSION (default 768 for Fireworks nomic-embed-text-v1.5).

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "ai_embedding_chunks" DROP COLUMN IF EXISTS "embedding_vec";
ALTER TABLE "ai_embedding_chunks" ADD COLUMN IF NOT EXISTS "embedding_vec" vector(768);

DROP INDEX IF EXISTS "ai_embedding_chunks_embedding_vec_idx";
CREATE INDEX IF NOT EXISTS "ai_embedding_chunks_embedding_vec_idx"
  ON "ai_embedding_chunks" USING hnsw ("embedding_vec" vector_cosine_ops);
