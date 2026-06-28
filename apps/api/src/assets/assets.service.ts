import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../files/storage.service';
import { CreateFabricAssetDto } from './dto/create-fabric-asset.dto';
import { CreateProductAssetDto } from './dto/create-product-asset.dto';
import { UpdateFabricAssetDto, UpdateProductAssetDto } from './dto/update-asset.dto';
import { ListAssetsQueryDto } from './dto/list-assets-query.dto';
import { UserRole } from '@repo/types';
import { resolvePagination, paginated, paginateArray } from '../common/utils/paginate';
import { buildAssetSearchWhere, normalizeAssetKeywords } from './asset-search.util';
import { dispatchByRole } from '../common/access/access.util';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  countFabrics(): Promise<number> {
    return this.prisma.fabricAsset.count();
  }

  countProducts(): Promise<number> {
    return this.prisma.productAsset.count();
  }

  async createFabric(dto: CreateFabricAssetDto, designerId: string) {
    this.storage.rejectDataUrl(dto.imageUrl, 'imageUrl');
    const created = await this.prisma.fabricAsset.create({
      data: {
        designerId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        keywords: normalizeAssetKeywords(dto.keywords),
        metadata: dto.metadata,
        composition: dto.composition,
        color: dto.color,
        supplier: dto.supplier,
        moq: dto.moq,
        leadTimeDays: dto.leadTimeDays,
        pricePerUnitMillimes: dto.pricePerUnitMillimes,
        briefId: dto.briefId,
        seasons: dto.seasons ?? [],
        availabilityStatus: dto.availabilityStatus,
      },
    });
    const similar = await this.prisma.fabricAsset.findFirst({
      where: {
        designerId,
        id: { not: created.id },
        name: { contains: dto.name.split(' ')[0], mode: 'insensitive' },
      },
      select: { id: true, name: true },
    });
    if (similar) {
      return { ...created, _warning: 'POSSIBLE_DUPLICATE', _similarAssetId: similar.id, _similarAssetName: similar.name };
    }
    return created;
  }

  async findFabricsForRole(userId: string, role: string, query: ListAssetsQueryDto) {
    return dispatchByRole(role, {
      admin: () => this.paginateFabrics({}, query),
      designer: () => this.paginateFabrics({ designerId: userId }, query),
      customer: async () => {
        const curated = await this.getCustomerCuratedFabrics(userId);
        const hydrated = await Promise.all(curated.map((f) => this.hydrateFabric(f)));
        const { page, limit } = resolvePagination(query);
        return paginateArray(hydrated, page, limit);
      },
    });
  }

  private async getMoodboardKeywords(projectId: string): Promise<string[]> {
    const moodboards = await this.prisma.moodboard.findMany({
      where: { projectId },
      select: { fabricSuggestions: true, colorPalette: true },
    });
    return moodboards
      .flatMap((m) => [...m.fabricSuggestions, ...m.colorPalette])
      .map((k) => k.toLowerCase());
  }

  private sortByMoodboardKeywords<T extends { keywords: string[] }>(
    assets: T[],
    keywords: string[],
  ): T[] {
    return [...assets].sort((a, b) => {
      const scoreA = a.keywords.filter((k) => keywords.includes(k.toLowerCase())).length;
      const scoreB = b.keywords.filter((k) => keywords.includes(k.toLowerCase())).length;
      return scoreB - scoreA;
    });
  }

  private async paginateFabrics(where: Record<string, unknown>, query: ListAssetsQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const filteredWhere = buildAssetSearchWhere(where, query.search);
    if (query.seasons?.length) {
      (filteredWhere as Record<string, unknown>).seasons = { hasSome: query.seasons };
    }
    const [data, total] = await Promise.all([
      this.prisma.fabricAsset.findMany({ where: filteredWhere, orderBy, skip, take: limit }),
      this.prisma.fabricAsset.count({ where: filteredWhere }),
    ]);
    let resolved = await Promise.all(data.map((f) => this.hydrateFabric(f)));
    if (query.matchMoodboard && query.projectId) {
      const keywords = await this.getMoodboardKeywords(query.projectId);
      resolved = this.sortByMoodboardKeywords(resolved, keywords);
    }
    return paginated(resolved, total, page, limit);
  }

  async findFabricByIdForRole(id: string, userId: string, role: string) {
    const fabric = await this.findFabricById(id);
    return dispatchByRole(role, {
      admin: () => fabric,
      designer: () => fabric,
      customer: async () => {
        const curated = await this.getCustomerCuratedFabrics(userId);
        if (!curated.find((f) => f.id === id)) {
          throw new ForbiddenException('Access denied');
        }
        return fabric;
      },
    });
  }

  async updateFabric(id: string, dto: UpdateFabricAssetDto, userId: string, role: string) {
    const fabric = await this.findFabricById(id);
    if (role === UserRole.DESIGNER && fabric.designerId !== userId) {
      throw new ForbiddenException('Not your asset');
    }
    if (dto.imageUrl) this.storage.rejectDataUrl(dto.imageUrl, 'imageUrl');
    return this.prisma.fabricAsset.update({
      where: { id },
      data: {
        ...dto,
        keywords: dto.keywords ? normalizeAssetKeywords(dto.keywords) : undefined,
      },
    });
  }

  async removeFabric(id: string, userId: string, role: string) {
    const fabric = await this.findFabricById(id);
    if (role === UserRole.DESIGNER && fabric.designerId !== userId) {
      throw new ForbiddenException('Not your asset');
    }
    return this.prisma.fabricAsset.delete({ where: { id } });
  }

  async createProduct(dto: CreateProductAssetDto, designerId: string) {
    this.storage.rejectDataUrl(dto.imageUrl, 'imageUrl');
    const created = await this.prisma.productAsset.create({
      data: {
        designerId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        keywords: normalizeAssetKeywords(dto.keywords),
        metadata: dto.metadata,
        composition: dto.composition,
        color: dto.color,
        supplier: dto.supplier,
        moq: dto.moq,
        leadTimeDays: dto.leadTimeDays,
        pricePerUnitMillimes: dto.pricePerUnitMillimes,
        briefId: dto.briefId,
        seasons: dto.seasons ?? [],
        availabilityStatus: dto.availabilityStatus,
      },
    });
    const similar = await this.prisma.productAsset.findFirst({
      where: {
        designerId,
        id: { not: created.id },
        name: { contains: dto.name.split(' ')[0], mode: 'insensitive' },
      },
      select: { id: true, name: true },
    });
    if (similar) {
      return { ...created, _warning: 'POSSIBLE_DUPLICATE', _similarAssetId: similar.id, _similarAssetName: similar.name };
    }
    return created;
  }

  async findProductsForRole(userId: string, role: string, query: ListAssetsQueryDto) {
    return dispatchByRole(role, {
      admin: () => this.paginateProducts({}, query),
      designer: () => this.paginateProducts({ designerId: userId }, query),
      customer: async () => {
        const curated = await this.getCustomerCuratedProducts(userId);
        const hydrated = await Promise.all(curated.map((p) => this.hydrateProduct(p)));
        const { page, limit } = resolvePagination(query);
        return paginateArray(hydrated, page, limit);
      },
    });
  }

  private async paginateProducts(where: Record<string, unknown>, query: ListAssetsQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const filteredWhere = buildAssetSearchWhere(where, query.search);
    if (query.seasons?.length) {
      (filteredWhere as Record<string, unknown>).seasons = { hasSome: query.seasons };
    }
    const [data, total] = await Promise.all([
      this.prisma.productAsset.findMany({ where: filteredWhere, orderBy, skip, take: limit }),
      this.prisma.productAsset.count({ where: filteredWhere }),
    ]);
    let resolved = await Promise.all(data.map((p) => this.hydrateProduct(p)));
    if (query.matchMoodboard && query.projectId) {
      const keywords = await this.getMoodboardKeywords(query.projectId);
      resolved = this.sortByMoodboardKeywords(resolved, keywords);
    }
    return paginated(resolved, total, page, limit);
  }

  async findProductByIdForRole(id: string, userId: string, role: string) {
    const product = await this.findProductById(id);
    return dispatchByRole(role, {
      admin: () => product,
      designer: () => product,
      customer: async () => {
        const curated = await this.getCustomerCuratedProducts(userId);
        if (!curated.find((p) => p.id === id)) {
          throw new ForbiddenException('Access denied');
        }
        return product;
      },
    });
  }

  async updateProduct(id: string, dto: UpdateProductAssetDto, userId: string, role: string) {
    const product = await this.findProductById(id);
    if (role === UserRole.DESIGNER && product.designerId !== userId) {
      throw new ForbiddenException('Not your asset');
    }
    if (dto.imageUrl) this.storage.rejectDataUrl(dto.imageUrl, 'imageUrl');
    return this.prisma.productAsset.update({
      where: { id },
      data: {
        ...dto,
        keywords: dto.keywords ? normalizeAssetKeywords(dto.keywords) : undefined,
      },
    });
  }

  async removeProduct(id: string, userId: string, role: string) {
    const product = await this.findProductById(id);
    if (role === UserRole.DESIGNER && product.designerId !== userId) {
      throw new ForbiddenException('Not your asset');
    }
    return this.prisma.productAsset.delete({ where: { id } });
  }

  private async findFabricById(id: string) {
    const fabric = await this.prisma.fabricAsset.findUnique({ where: { id } });
    if (!fabric) throw new NotFoundException('Fabric asset not found');
    return this.hydrateFabric(fabric);
  }

  private async findProductById(id: string) {
    const product = await this.prisma.productAsset.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product asset not found');
    return this.hydrateProduct(product);
  }

  private async hydrateFabric<T extends { imageUrl: string }>(fabric: T): Promise<T> {
    return { ...fabric, imageUrl: await this.storage.resolveUrl(fabric.imageUrl) };
  }

  private async hydrateProduct<T extends { imageUrl: string }>(product: T): Promise<T> {
    return { ...product, imageUrl: await this.storage.resolveUrl(product.imageUrl) };
  }

  private async getCustomerCuratedFabrics(customerId: string) {
    const projects = await this.prisma.project.findMany({
      where: { customerId },
      select: { id: true },
    });
    const items = await this.prisma.proposalItem.findMany({
      where: {
        section: { proposal: { projectId: { in: projects.map((p) => p.id) } } },
        fabricAssetId: { not: null },
      },
      include: { fabricAsset: true },
    });
    const seen = new Set<string>();
    return items
      .map((i) => i.fabricAsset!)
      .filter((f) => {
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
      });
  }

  private async getCustomerCuratedProducts(customerId: string) {
    const projects = await this.prisma.project.findMany({
      where: { customerId },
      select: { id: true },
    });
    const items = await this.prisma.proposalItem.findMany({
      where: {
        section: { proposal: { projectId: { in: projects.map((p) => p.id) } } },
        productAssetId: { not: null },
      },
      include: { productAsset: true },
    });
    const seen = new Set<string>();
    return items
      .map((i) => i.productAsset!)
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
  }

  async getFabricStats(id: string) {
    const items = await this.prisma.proposalItem.findMany({
      where: { fabricAssetId: id },
      include: { section: { include: { proposal: { select: { status: true, id: true } } } } },
    });
    const proposalIds = new Set(items.map(i => i.section.proposalId));
    const proposalCount = proposalIds.size;
    const approvedCount = items.filter(i => i.section.proposal?.status === 'APPROVED').length;
    const sorted = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const lastUsedAt = sorted[0]?.createdAt ?? null;
    return { proposalCount, approvedProposalCount: approvedCount, lastUsedAt };
  }

  async getProductStats(id: string) {
    const items = await this.prisma.proposalItem.findMany({
      where: { productAssetId: id },
      include: { section: { include: { proposal: { select: { status: true, id: true } } } } },
    });
    const proposalIds = new Set(items.map(i => i.section.proposalId));
    const proposalCount = proposalIds.size;
    const approvedCount = items.filter(i => i.section.proposal?.status === 'APPROVED').length;
    const sorted = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const lastUsedAt = sorted[0]?.createdAt ?? null;
    return { proposalCount, approvedProposalCount: approvedCount, lastUsedAt };
  }
}
