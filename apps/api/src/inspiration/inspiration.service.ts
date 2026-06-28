import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInspirationSelectionDto } from './dto/create-inspiration.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginateArray, resolvePagination } from '../common/utils/paginate';

@Injectable()
export class InspirationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCuratedAssets(projectId: string, customerId: string, query: PaginationQueryDto) {
    await this.assertCustomerProject(projectId, customerId);

    const proposals = await this.prisma.proposal.findMany({
      where: { projectId, status: { in: ['SENT', 'APPROVED', 'CHANGES_REQUESTED'] } },
      include: {
        sections: {
          include: { items: { include: { fabricAsset: true, productAsset: true } } },
        },
      },
    });

    const selections = await this.prisma.inspirationSelection.findMany({
      where: { projectId, customerId },
    });

    const assets: Array<{
      id: string;
      type: 'fabric' | 'product';
      name: string;
      description?: string | null;
      imageUrl: string;
      keywords: string[];
      selections: typeof selections;
    }> = [];

    for (const proposal of proposals) {
      for (const section of proposal.sections) {
        for (const item of section.items) {
          if (item.fabricAsset) {
            assets.push({
              id: item.fabricAsset.id,
              type: 'fabric',
              name: item.fabricAsset.name,
              description: item.fabricAsset.description,
              imageUrl: item.fabricAsset.imageUrl,
              keywords: item.fabricAsset.keywords ?? [],
              selections: selections.filter((s) => s.fabricAssetId === item.fabricAsset!.id),
            });
          }
          if (item.productAsset) {
            assets.push({
              id: item.productAsset.id,
              type: 'product',
              name: item.productAsset.name,
              description: item.productAsset.description,
              imageUrl: item.productAsset.imageUrl,
              keywords: item.productAsset.keywords ?? [],
              selections: selections.filter((s) => s.productAssetId === item.productAsset!.id),
            });
          }
        }
      }
    }

    const { page, limit } = resolvePagination(query);
    return paginateArray(assets, page, limit);
  }

  async toggleSelection(dto: CreateInspirationSelectionDto, customerId: string) {
    await this.assertCustomerProject(dto.projectId, customerId);
    if (!dto.fabricAssetId && !dto.productAssetId) {
      throw new BadRequestException('Must specify fabricAssetId or productAssetId');
    }

    const existing = await this.prisma.inspirationSelection.findFirst({
      where: {
        projectId: dto.projectId,
        customerId,
        fabricAssetId: dto.fabricAssetId ?? null,
        productAssetId: dto.productAssetId ?? null,
        action: dto.action as any,
      },
    });

    if (existing) {
      await this.prisma.inspirationSelection.delete({ where: { id: existing.id } });
      return { removed: true };
    }

    return this.prisma.inspirationSelection.create({
      data: {
        projectId: dto.projectId,
        customerId,
        fabricAssetId: dto.fabricAssetId,
        productAssetId: dto.productAssetId,
        action: dto.action as any,
      },
    });
  }

  private async assertCustomerProject(projectId: string, customerId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.customerId !== customerId) throw new ForbiddenException('Access denied');
  }
}
