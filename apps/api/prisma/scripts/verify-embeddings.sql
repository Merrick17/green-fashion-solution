SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'ai_embedding_chunks'
ORDER BY ordinal_position;

SELECT extname AS pgvector_enabled FROM pg_extension WHERE extname = 'vector';
