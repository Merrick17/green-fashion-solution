import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AgentContext } from '@repo/types';

export interface AgentContextOptions {
  revisionMode?: boolean;
  filterByTaskDesigners?: boolean;
}

@Injectable()
export class ProjectsAgentContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgentContext(
    projectId: string,
    options: AgentContextOptions = {},
  ): Promise<AgentContext> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, description: true, status: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const moodboards = await this.prisma.moodboard.findMany({
      where: { projectId },
      include: { items: true },
      orderBy: { updatedAt: 'desc' },
    });

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        briefType: true,
        deliverables: true,
        designerId: true,
        status: true,
      },
    });

    const filterByTasks = options.filterByTaskDesigners !== false;
    const designerIds = filterByTasks
      ? [...new Set(tasks.map((t) => t.designerId))]
      : [];

    const assetFilter =
      designerIds.length > 0 ? { designerId: { in: designerIds } } : {};

    const [fabrics, products, priorProposals] = await Promise.all([
      this.prisma.fabricAsset.findMany({ where: assetFilter }),
      this.prisma.productAsset.findMany({ where: assetFilter }),
      this.prisma.proposal.findMany({
        where: { projectId },
        include: { sections: { include: { items: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const inspirationRows = await this.prisma.inspirationSelection.findMany({
      where: { projectId },
      select: {
        id: true,
        action: true,
        fabricAssetId: true,
        productAssetId: true,
      },
    });
    const inspirationSelections = inspirationRows.map((s) => ({
      id: s.id,
      action: s.action,
      fabricAssetId: s.fabricAssetId,
      productAssetId: s.productAssetId,
    }));

    return {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
      },
      moodboards: moodboards.map((m) => ({
        id: m.id,
        styleDirection: m.styleDirection,
        colorPalette: m.colorPalette,
        fabricSuggestions: m.fabricSuggestions,
        mood: m.mood,
        items: m.items.map((item) => ({
          id: item.id,
          type: item.type,
          content: item.content,
        })),
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        briefType: t.briefType,
        deliverables: t.deliverables,
        designerId: t.designerId,
        status: t.status,
      })),
      assets: {
        fabrics: fabrics.map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          imageUrl: f.imageUrl,
          keywords: f.keywords ?? [],
          designerId: f.designerId,
          metadata: f.metadata,
        })),
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          keywords: p.keywords ?? [],
          designerId: p.designerId,
          metadata: p.metadata,
        })),
      },
      priorProposals: priorProposals.map((p) => ({
        id: p.id,
        status: p.status,
        items: p.sections.flatMap((section) =>
          section.items.map((item) => ({
            id: item.id,
            fabricAssetId: item.fabricAssetId,
            productAssetId: item.productAssetId,
            notes: item.notes,
          })),
        ),
      })),
      inspirationSelections,
    };
  }
}
