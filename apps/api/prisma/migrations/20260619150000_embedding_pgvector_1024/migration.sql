-- pgvector column for fast RAG cosine search (JSONB `embedding` remains source of truth).
-- Dimension must match EMBEDDING_DIMENSION env (1024 for Together intfloat/multilingual-e5-large-instruct).

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "ai_embedding_chunks" DROP COLUMN IF EXISTS "embedding_vec";
ALTER TABLE "ai_embedding_chunks" ADD COLUMN "embedding_vec" vector(1024);

DROP INDEX IF EXISTS "ai_embedding_chunks_embedding_vec_idx";
CREATE INDEX "ai_embedding_chunks_embedding_vec_idx"
  ON "ai_embedding_chunks" USING hnsw ("embedding_vec" vector_cosine_ops);
