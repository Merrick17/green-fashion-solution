export interface AiEmbeddingChunk {
  id: string;
  projectId: string;
  sourceKey: string;
  content: string;
  contentHash: string | null;
  embedding: number[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAiEmbeddingChunkDto {
  sourceKey: string;
  content: string;
  embedding: number[];
  model: string;
}

export interface RagSearchResult {
  sourceKey: string;
  content: string;
  score: number;
}
