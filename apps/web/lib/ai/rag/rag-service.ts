import { createHash } from "crypto";
import type { AxiosInstance } from "axios";
import type { AgentContext, AgentContextAsset } from "@repo/types";
import { formatAssetSearchDocument } from "@repo/utils";
import { embedText, embedTexts } from "../fireworks/embeddings";
import { resolveFireworksModel } from "../fireworks/models";
import { persistRagChunks, searchRagChunks, fetchRagHashes } from "../server/nest-client";
import { cosineSimilarity } from "./cosine";

export interface RagChunk {
  sourceKey: string;
  content: string;
  embedding: number[];
}

export interface RagSearchResult {
  sourceKey: string;
  content: string;
  score: number;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function agentContextToChunks(
  ctx: AgentContext,
): Array<{ sourceKey: string; content: string }> {
  const chunks: Array<{ sourceKey: string; content: string }> = [];

  chunks.push({
    sourceKey: `project:${ctx.project.id}`,
    content: `Project "${ctx.project.title}": ${ctx.project.description}. Status: ${ctx.project.status}.`,
  });

  for (const board of ctx.moodboards) {
    chunks.push({
      sourceKey: `moodboard:${board.id}`,
      content: `Moodboard style="${board.styleDirection}" mood="${board.mood}" colors=${board.colorPalette.join(", ")} fabrics=${board.fabricSuggestions.join(", ")} items=${board.items.length}`,
    });
  }

  for (const fabric of ctx.assets.fabrics) {
    chunks.push(assetToSearchChunk(fabric, "fabric"));
  }

  for (const product of ctx.assets.products) {
    chunks.push(assetToSearchChunk(product, "product"));
  }

  for (const proposal of ctx.priorProposals) {
    chunks.push({
      sourceKey: `proposal:${proposal.id}`,
      content: `Prior proposal ${proposal.id} status=${proposal.status} items=${proposal.items.length}`,
    });
  }

  if (ctx.inspirationSelections?.length) {
    for (const sel of ctx.inspirationSelections) {
      chunks.push({
        sourceKey: `inspiration:${sel.id}`,
        content: `Customer inspiration ${sel.action} fabric=${sel.fabricAssetId ?? "-"} product=${sel.productAssetId ?? "-"}`,
      });
    }
  }

  return chunks;
}

function assetToSearchChunk(asset: AgentContextAsset, kind: "fabric" | "product") {
  return {
    sourceKey: `${kind}:${asset.id}`,
    content: formatAssetSearchDocument({
      kind,
      id: asset.id,
      title: asset.name,
      description: asset.description,
      imageUrl: asset.imageUrl,
      keywords: asset.keywords,
    }),
  };
}

export async function embedChunks(
  chunks: Array<{ sourceKey: string; content: string }>,
): Promise<RagChunk[]> {
  if (chunks.length === 0) return [];
  const texts = chunks.map((c) => c.content);
  const { embeddings } = await embedTexts(texts);
  return chunks.map((chunk, i) => ({
    sourceKey: chunk.sourceKey,
    content: chunk.content,
    embedding: embeddings[i] ?? [],
  }));
}

/** Index only changed chunks (incremental) into Postgres via API. */
export async function indexAgentContextToDb(
  client: AxiosInstance,
  projectId: string,
  ctx: AgentContext,
): Promise<void> {
  const embedModel = resolveFireworksModel("embed");
  const allChunks = agentContextToChunks(ctx);
  if (allChunks.length === 0) return;

  const existingHashes = await fetchRagHashes(client, projectId);
  const delta = allChunks.filter((c) => existingHashes[c.sourceKey] !== hashContent(c.content));
  if (delta.length === 0) return;

  const indexed = await embedChunks(delta);
  await persistRagChunks(
    client,
    projectId,
    indexed.map((chunk) => ({
      sourceKey: chunk.sourceKey,
      content: chunk.content,
      embedding: chunk.embedding,
      model: embedModel,
    })),
  );
}

export function searchChunks(
  queryEmbedding: number[],
  indexed: RagChunk[],
  topK = 8,
): RagSearchResult[] {
  return indexed
    .map((chunk) => ({
      sourceKey: chunk.sourceKey,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function formatRagHits(hits: RagSearchResult[], embedModel: string): string {
  if (hits.length === 0) return "";
  return [
    `RAG retrieval (${embedModel}, Postgres AiEmbeddingChunk, top ${hits.length}):`,
    ...hits.map((h) => `- [${h.score.toFixed(3)}] ${h.sourceKey}: ${h.content}`),
  ].join("\n");
}

export async function searchProjectRag(
  client: AxiosInstance,
  projectId: string,
  query: string,
  topK = 8,
): Promise<RagSearchResult[]> {
  if (process.env.AI_ENABLE_RAG === "false") {
    console.warn("[RAG] Disabled — returning empty results. Set AI_ENABLE_RAG=true to enable.");
    return [];
  }
  const queryEmbedding = await embedText(query);
  return searchRagChunks(client, projectId, queryEmbedding, topK);
}

export async function buildRagContextFromAgentContext(
  client: AxiosInstance,
  projectId: string,
  ctx: AgentContext,
  query: string,
  topK = 8,
): Promise<string> {
  if (process.env.AI_ENABLE_RAG === "false") {
    console.warn("[RAG] Disabled — returning empty context. Set AI_ENABLE_RAG=true to enable.");
    return "";
  }

  const embedModel = resolveFireworksModel("embed");
  await indexAgentContextToDb(client, projectId, ctx);

  const queryEmbedding = await embedText(query);
  const hits = await searchRagChunks(client, projectId, queryEmbedding, topK);

  return formatRagHits(hits, embedModel);
}
