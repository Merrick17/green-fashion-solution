import type { AgentContext } from "@repo/types";
import { assetSearchText, formatAssetSearchDocument } from "@repo/utils";
import { embedText, embedTexts } from "../../fireworks/embeddings";
import { cosineSimilarity } from "../../rag/cosine";
import { isRagEnabled } from "../registry/guards";

function collectKeywords(ctx: AgentContext): string[] {
  const words = new Set<string>();
  for (const board of ctx.moodboards) {
    board.styleDirection.split(/\W+/).forEach((w) => w.length > 2 && words.add(w.toLowerCase()));
    board.mood.split(/\W+/).forEach((w) => w.length > 2 && words.add(w.toLowerCase()));
    board.colorPalette.forEach((c) => words.add(c.toLowerCase()));
    board.fabricSuggestions.forEach((f) =>
      f.split(/\W+/).forEach((w) => w.length > 2 && words.add(w.toLowerCase())),
    );
  }
  return [...words];
}

function scoreAsset(
  asset: {
    name: string;
    description: string | null;
    imageUrl: string;
    keywords: string[];
  },
  keywords: string[],
): number {
  const corpus = assetSearchText({
    title: asset.name,
    description: asset.description,
    imageUrl: asset.imageUrl,
    keywords: asset.keywords,
  });

  let score = keywords.reduce((total, kw) => (corpus.includes(kw) ? total + 1 : total), 0);

  for (const tag of asset.keywords) {
    if (keywords.includes(tag.toLowerCase())) score += 2;
  }

  return score;
}

export function parseRagAssetBoosts(
  hits: Array<{ sourceKey: string; score: number }>,
): Map<string, number> {
  const boosts = new Map<string, number>();
  for (const hit of hits) {
    const match = hit.sourceKey.match(/^(fabric|product):(.+)$/);
    if (!match) continue;
    const id = match[2]!;
    boosts.set(id, Math.max(boosts.get(id) ?? 0, hit.score * 12));
  }
  return boosts;
}

export function rankAssetsDeterministic(
  ctx: AgentContext,
  focus?: "fabric" | "product" | "all",
  ragBoosts?: Map<string, number>,
) {
  const keywords = collectKeywords(ctx);
  const boost = (id: string, score: number) => score + (ragBoosts?.get(id) ?? 0);

  const fabrics =
    focus === "product"
      ? []
      : ctx.assets.fabrics
          .map((f) => ({
            id: f.id,
            name: f.name,
            imageUrl: f.imageUrl,
            keywords: f.keywords,
            type: "fabric" as const,
            score: boost(
              f.id,
              scoreAsset(f, keywords) +
                (ctx.moodboards.some((m) =>
                  m.fabricSuggestions.some((s) =>
                    assetSearchText({
                      title: f.name,
                      description: f.description,
                      imageUrl: f.imageUrl,
                      keywords: f.keywords,
                    }).includes(s.toLowerCase()),
                  ),
                )
                  ? 2
                  : 0),
            ),
          }))
          .sort((a, b) => b.score - a.score);

  const products =
    focus === "fabric"
      ? []
      : ctx.assets.products
          .map((p) => ({
            id: p.id,
            name: p.name,
            imageUrl: p.imageUrl,
            keywords: p.keywords,
            type: "product" as const,
            score: boost(p.id, scoreAsset(p, keywords)),
          }))
          .sort((a, b) => b.score - a.score);

  return { keywords, fabrics, products };
}

/** Adds embedding similarity when a query string is provided. */
export async function rankAssetsWithEmbeddings(
  ctx: AgentContext,
  query: string,
  focus?: "fabric" | "product" | "all",
  ragBoosts?: Map<string, number>,
) {
  const base = rankAssetsDeterministic(ctx, focus, ragBoosts);
  if (!isRagEnabled() || !query.trim()) return base;

  const queryEmbedding = await embedText(query);
  const candidates: Array<{ id: string; doc: string; kind: "fabric" | "product" }> = [];

  if (focus !== "product") {
    for (const f of ctx.assets.fabrics) {
      candidates.push({
        id: f.id,
        kind: "fabric",
        doc: formatAssetSearchDocument({
          kind: "fabric",
          id: f.id,
          title: f.name,
          description: f.description,
          imageUrl: f.imageUrl,
          keywords: f.keywords,
        }),
      });
    }
  }
  if (focus !== "fabric") {
    for (const p of ctx.assets.products) {
      candidates.push({
        id: p.id,
        kind: "product",
        doc: formatAssetSearchDocument({
          kind: "product",
          id: p.id,
          title: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          keywords: p.keywords,
        }),
      });
    }
  }

  if (candidates.length === 0) return base;

  const { embeddings } = await embedTexts(candidates.map((c) => c.doc));
  const embedBoosts = new Map<string, number>();
  candidates.forEach((c, i) => {
    const sim = cosineSimilarity(queryEmbedding, embeddings[i] ?? []);
    if (sim > 0.2) embedBoosts.set(c.id, sim * 8);
  });

  const merged = new Map(ragBoosts);
  for (const [id, value] of embedBoosts) {
    merged.set(id, (merged.get(id) ?? 0) + value);
  }

  return rankAssetsDeterministic(ctx, focus, merged);
}
