import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashContent } from '../common/utils/content-hash';

const EMBED_DIM = Number(process.env.EMBEDDING_DIMENSION ?? 768);

@Injectable()
export class AiRagService {
  constructor(private readonly prisma: PrismaService) {}

  async getContentHashes(projectId: string): Promise<Record<string, string>> {
    await this.assertProject(projectId);
    const rows = await this.prisma.aiEmbeddingChunk.findMany({
      where: { projectId },
      select: { sourceKey: true, contentHash: true },
    });
    const map: Record<string, string> = {};
    for (const row of rows) {
      if (row.contentHash) map[row.sourceKey] = row.contentHash;
    }
    return map;
  }

  async upsertChunks(
    projectId: string,
    chunks: Array<{ sourceKey: string; content: string; embedding: number[]; model: string }>,
  ) {
    await this.assertProject(projectId);

    let indexed = 0;
    let skipped = 0;

    for (const chunk of chunks) {
      const contentHash = hashContent(chunk.content);
      const existing = await this.prisma.aiEmbeddingChunk.findUnique({
        where: { projectId_sourceKey: { projectId, sourceKey: chunk.sourceKey } },
      });

      if (existing?.contentHash === contentHash) {
        skipped += 1;
        continue;
      }

      await this.prisma.aiEmbeddingChunk.upsert({
        where: { projectId_sourceKey: { projectId, sourceKey: chunk.sourceKey } },
        create: {
          projectId,
          sourceKey: chunk.sourceKey,
          content: chunk.content,
          contentHash,
          embedding: chunk.embedding,
          model: chunk.model,
        },
        update: {
          content: chunk.content,
          contentHash,
          embedding: chunk.embedding,
          model: chunk.model,
        },
      });

      await this.syncVectorColumn(projectId, chunk.sourceKey, chunk.embedding);
      indexed += 1;
    }

    return { indexed, skipped };
  }

  async listByProject(projectId: string) {
    await this.assertProject(projectId);
    return this.prisma.aiEmbeddingChunk.findMany({ where: { projectId } });
  }

  async search(projectId: string, queryEmbedding: number[], topK = 8) {
    await this.assertProject(projectId);

    const vectorHits = await this.searchWithPgVector(projectId, queryEmbedding, topK);
    if (vectorHits.length > 0) return vectorHits;

    return this.searchInMemory(projectId, queryEmbedding, topK);
  }

  private async searchWithPgVector(
    projectId: string,
    queryEmbedding: number[],
    topK: number,
  ): Promise<Array<{ sourceKey: string; content: string; score: number }>> {
    try {
      const vectorLiteral = `[${queryEmbedding.join(',')}]`;
      const rows = await this.prisma.$queryRaw<
        Array<{ sourceKey: string; content: string; score: number }>
      >`
        SELECT "sourceKey", content, 1 - ("embedding_vec" <=> ${vectorLiteral}::vector) AS score
        FROM ai_embedding_chunks
        WHERE "projectId" = ${projectId} AND embedding_vec IS NOT NULL
        ORDER BY "embedding_vec" <=> ${vectorLiteral}::vector
        LIMIT ${topK}
      `;
      return rows.filter((r) => r.score > 0);
    } catch {
      return [];
    }
  }

  private async searchInMemory(
    projectId: string,
    queryEmbedding: number[],
    topK: number,
  ): Promise<Array<{ sourceKey: string; content: string; score: number }>> {
    const rows = await this.listByProject(projectId);
    return rows
      .map((row) => {
        const embedding = row.embedding as number[];
        return {
          sourceKey: row.sourceKey,
          content: row.content,
          score: cosineSimilarity(queryEmbedding, embedding),
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private async syncVectorColumn(projectId: string, sourceKey: string, embedding: number[]) {
    if (embedding.length !== EMBED_DIM) return;
    try {
      const vectorLiteral = `[${embedding.join(',')}]`;
      await this.prisma.$executeRaw`
        UPDATE ai_embedding_chunks
        SET embedding_vec = ${vectorLiteral}::vector
        WHERE "projectId" = ${projectId} AND "sourceKey" = ${sourceKey}
      `;
    } catch {
      /* pgvector optional until migration applied */
    }
  }

  private async assertProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
