-- Fireworks AI migration: switch embedding provider from Together to Fireworks
-- - Embedding model: togethercomputer/m2-bert-80M-8k-retrieval (1024d) → nomic-ai/nomic-embed-text-v1.5 (768d)
-- - Existing 1024-dim embeddings are incompatible with the new 768-dim model
-- - Clears all existing rows and recreates pgvector column with new dimension

DELETE FROM ai_embedding_chunks;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_embedding_chunks' AND column_name = 'embedding_vec'
  ) THEN
    DROP INDEX IF EXISTS "ai_embedding_chunks_embedding_vec_idx";
    ALTER TABLE "ai_embedding_chunks" DROP COLUMN "embedding_vec";
    ALTER TABLE "ai_embedding_chunks" ADD COLUMN "embedding_vec" vector(768);
    CREATE INDEX IF NOT EXISTS "ai_embedding_chunks_embedding_vec_idx"
      ON "ai_embedding_chunks" USING hnsw ("embedding_vec" vector_cosine_ops);
  END IF;
END $$;
