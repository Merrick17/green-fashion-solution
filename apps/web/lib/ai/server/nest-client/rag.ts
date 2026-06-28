import type { AxiosInstance } from "axios";

export interface RagChunkRecord {
  sourceKey: string;
  content: string;
  embedding: number[];
  model: string;
}

export interface RagSearchHit {
  sourceKey: string;
  content: string;
  score: number;
}

export async function persistRagChunks(
  client: AxiosInstance,
  projectId: string,
  chunks: RagChunkRecord[],
): Promise<{ indexed: number; skipped?: number }> {
  const res = await client.post<{ indexed: number; skipped?: number }>(
    `/projects/${projectId}/rag/index`,
    { chunks },
  );
  return res.data;
}

export async function fetchRagHashes(
  client: AxiosInstance,
  projectId: string,
): Promise<Record<string, string>> {
  const res = await client.get<Record<string, string>>(`/projects/${projectId}/rag/hashes`);
  return res.data;
}

export async function searchRagChunks(
  client: AxiosInstance,
  projectId: string,
  queryEmbedding: number[],
  topK = 8,
): Promise<RagSearchHit[]> {
  const res = await client.post<RagSearchHit[]>(`/projects/${projectId}/rag/search`, {
    queryEmbedding,
    topK,
  });
  return res.data;
}
