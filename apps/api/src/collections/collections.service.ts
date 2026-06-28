import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../files/storage.service';
import { UserRole } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddCollectionItemDto,
  ReorderCollectionItemsDto,
} from './dto/collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(role: string, designerId: string | null, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const where = role === UserRole.ADMIN ? {} : { designerId: designerId! };
    const [data, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { items: true } } },
      }),
      this.prisma.collection.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async findById(id: string, userId: string, role: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: { fabricAsset: true, productAsset: true },
        },
      },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (role === UserRole.DESIGNER && collection.designerId !== userId) {
      throw new ForbiddenException('Not your collection');
    }
    return this.hydrateCollection(collection);
  }

  async create(dto: CreateCollectionDto, designerId: string) {
    return this.prisma.collection.create({
      data: { ...dto, designerId },
    });
  }

  async update(id: string, dto: UpdateCollectionDto, designerId: string) {
    await this.assertDesignerOwner(id, designerId);
    return this.prisma.collection.update({ where: { id }, data: dto });
  }

  async remove(id: string, designerId: string) {
    await this.assertDesignerOwner(id, designerId);
    return this.prisma.collection.delete({ where: { id } });
  }

  async addItem(id: string, dto: AddCollectionItemDto, designerId: string) {
    await this.assertDesignerOwner(id, designerId);
    if (!dto.fabricAssetId && !dto.productAssetId) {
      throw new BadRequestException('fabricAssetId or productAssetId required');
    }
    if (dto.fabricAssetId) {
      const fabric = await this.prisma.fabricAsset.findFirst({
        where: { id: dto.fabricAssetId, designerId },
      });
      if (!fabric) throw new ForbiddenException('Fabric not found');
    }
    if (dto.productAssetId) {
      const product = await this.prisma.productAsset.findFirst({
        where: { id: dto.productAssetId, designerId },
      });
      if (!product) throw new ForbiddenException('Product not found');
    }
    return this.prisma.collectionItem.create({
      data: {
        collectionId: id,
        fabricAssetId: dto.fabricAssetId,
        productAssetId: dto.productAssetId,
        position: dto.position ?? 0,
      },
    });
  }

  async removeItem(collectionId: string, itemId: string, designerId: string) {
    await this.assertDesignerOwner(collectionId, designerId);
    const item = await this.prisma.collectionItem.findFirst({
      where: { id: itemId, collectionId },
    });
    if (!item) throw new NotFoundException('Item not found');
    return this.prisma.collectionItem.delete({ where: { id: itemId } });
  }

  /** Reassign positions (0..n-1) to the given item ids, in order. */
  async reorderItems(id: string, dto: ReorderCollectionItemsDto, designerId: string) {
    await this.assertDesignerOwner(id, designerId);
    const owned = await this.prisma.collectionItem.findMany({
      where: { collectionId: id },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((i) => i.id));
    const valid = dto.itemIds.filter((itemId) => ownedIds.has(itemId));
    if (!valid.length) throw new BadRequestException('No valid item ids');
    await this.prisma.$transaction(
      valid.map((itemId, index) =>
        this.prisma.collectionItem.update({
          where: { id: itemId },
          data: { position: index },
        }),
      ),
    );
    return this.findById(id, designerId, UserRole.DESIGNER);
  }

  private async assertDesignerOwner(id: string, designerId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.designerId !== designerId) throw new ForbiddenException('Not your collection');
    return collection;
  }

  private async hydrateCollection<T extends {
    items: Array<{
      fabricAsset: { imageUrl: string } | null;
      productAsset: { imageUrl: string } | null;
    } & Record<string, unknown>>;
  }>(collection: T) {
    const items = await Promise.all(
      collection.items.map(async (item) => ({
        ...item,
        fabricAsset: item.fabricAsset
          ? { ...item.fabricAsset, imageUrl: await this.storage.resolveUrl(item.fabricAsset.imageUrl) }
          : null,
        productAsset: item.productAsset
          ? { ...item.productAsset, imageUrl: await this.storage.resolveUrl(item.productAsset.imageUrl) }
          : null,
      })),
    );
    return { ...collection, items };
  }
}
