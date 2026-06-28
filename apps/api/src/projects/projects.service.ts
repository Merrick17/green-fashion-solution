import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { BriefOptionType, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { BriefOptionsService } from '../brief-options/brief-options.service';
import { CacheService } from '../cache/cache.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';
import { assertValidProjectTransition } from './project-status.machine';

const PROJECTS_CACHE_TTL = 60;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly briefOptions: BriefOptionsService,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateProjectDto, customerId: string) {
    await this.briefOptions.assertActiveOption(BriefOptionType.SEASON, dto.season);
    await this.briefOptions.assertActiveOption(BriefOptionType.CATEGORY, dto.category);
    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        customerId,
        season: dto.season,
        category: dto.category,
        budgetBand: dto.budgetBand,
        targetDelivery: dto.targetDelivery ? new Date(dto.targetDelivery) : undefined,
        moq: dto.moq,
        garmentCategories: dto.garmentCategories ?? [],
        targetPricePointMillimes: dto.targetPricePointMillimes,
        sustainabilityRequirements: dto.sustainabilityRequirements,
        coverImageUrl: dto.coverImageUrl,
      },
    });
    await this.cache.delByPattern('projects:*');
    return project;
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const cacheKey = `projects:all:${page}:${limit}:${query.sortOrder ?? 'desc'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({ orderBy, skip, take: limit }),
      this.prisma.project.count(),
    ]);
    const result = paginated(data, total, page, limit);
    await this.cache.set(cacheKey, result, PROJECTS_CACHE_TTL);
    return result;
  }

  async findByCustomer(customerId: string, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const cacheKey = `projects:customer:${customerId}:${page}:${limit}:${query.sortOrder ?? 'desc'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    const where = { customerId };
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.project.count({ where }),
    ]);
    const result = paginated(data, total, page, limit);
    await this.cache.set(cacheKey, result, PROJECTS_CACHE_TTL);
    return result;
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findById(id);
    if (dto.status && dto.status !== project.status) {
      assertValidProjectTransition(project.status, dto.status);
    }
    await this.briefOptions.assertActiveOption(BriefOptionType.SEASON, dto.season);
    await this.briefOptions.assertActiveOption(BriefOptionType.CATEGORY, dto.category);
    const data = this.toUpdateData(dto);
    const updated = await this.prisma.project.update({ where: { id }, data });
    if (dto.status && dto.status !== project.status) {
      await this.events.notifyStatusChanged(project.customerId, project.title, dto.status);
      await this.events.emitProjectStatusChanged(project.customerId, updated);
    }
    await this.cache.delByPattern('projects:*');
    return updated;
  }

  async submit(id: string, customerId: string) {
    const project = await this.findById(id);
    if (project.customerId !== customerId) {
      throw new ForbiddenException('Only the project owner can submit the brief');
    }
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Only draft projects can be submitted');
    }
    assertValidProjectTransition(project.status, ProjectStatus.SUBMITTED);

    const briefSubmittedAt = new Date();
    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.SUBMITTED,
        briefSubmittedAt,
      },
    });

    const adminIds = await this.events.getAdminIds();
    await this.events.notifyBriefSubmitted(adminIds, project.title);
    await this.events.emitProjectStatusChanged(project.customerId, updated);

    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.project.delete({ where: { id } });
  }

  private toUpdateData(dto: UpdateProjectDto) {
    const { targetDelivery, ...rest } = dto;
    return {
      ...rest,
      ...(targetDelivery !== undefined
        ? { targetDelivery: new Date(targetDelivery) }
        : {}),
    };
  }

  count(): Promise<number> {
    return this.prisma.project.count();
  }
}
