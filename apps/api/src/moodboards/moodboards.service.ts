import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodboardDto } from './dto/create-moodboard.dto';
import { UpdateMoodboardDto } from './dto/update-moodboard.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';
import { assertProjectAccess } from '../common/access/access.util';

@Injectable()
export class MoodboardsService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.moodboard.count();
  }

  async create(dto: CreateMoodboardDto, customerId: string) {
    await this.assertProjectOwnership(dto.projectId, customerId);
    return this.prisma.moodboard.create({
      data: {
        projectId: dto.projectId,
        styleDirection: dto.styleDirection,
        colorPalette: dto.colorPalette,
        fabricSuggestions: dto.fabricSuggestions,
        mood: dto.mood,
      },
    });
  }

  async findByProject(projectId: string, userId: string, role: string, query: PaginationQueryDto) {
    await assertProjectAccess(this.prisma, projectId, userId, role);
    const { page, limit, skip } = resolvePagination(query);
    const where = { projectId };
    const orderBy = { generatedAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.moodboard.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.moodboard.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async findById(id: string, userId: string, role: string) {
    const moodboard = await this.prisma.moodboard.findUnique({ where: { id } });
    if (!moodboard) throw new NotFoundException('Moodboard not found');
    await assertProjectAccess(this.prisma, moodboard.projectId, userId, role);
    return moodboard;
  }

  async findFull(id: string, userId: string, role: string) {
    const moodboard = await this.prisma.moodboard.findUnique({
      where: { id },
      include: { items: { orderBy: { zIndex: 'asc' } } },
    });
    if (!moodboard) throw new NotFoundException('Moodboard not found');
    await assertProjectAccess(this.prisma, moodboard.projectId, userId, role);
    return moodboard;
  }

  async update(id: string, dto: UpdateMoodboardDto, userId: string, role: string) {
    const moodboard = await this.prisma.moodboard.findUnique({ where: { id } });
    if (!moodboard) throw new NotFoundException('Moodboard not found');
    if (role !== 'ADMIN') await this.assertProjectOwnership(moodboard.projectId, userId);

    const data: any = {};
    if (dto.styleDirection !== undefined) data.styleDirection = dto.styleDirection;
    if (dto.colorPalette !== undefined) data.colorPalette = dto.colorPalette;
    if (dto.fabricSuggestions !== undefined) data.fabricSuggestions = dto.fabricSuggestions;
    if (dto.mood !== undefined) data.mood = dto.mood;
    if (dto.canvasViewport !== undefined) data.canvasViewport = dto.canvasViewport as any;

    return this.prisma.moodboard.update({ where: { id }, data });
  }

  async reset(id: string, userId: string, role: string) {
    const moodboard = await this.prisma.moodboard.findUnique({ where: { id } });
    if (!moodboard) throw new NotFoundException('Moodboard not found');
    if (role !== 'ADMIN') await this.assertProjectOwnership(moodboard.projectId, userId);

    await this.prisma.$transaction([
      this.prisma.moodItem.deleteMany({ where: { moodboardId: id } }),
      this.prisma.moodboardSnapshot.deleteMany({ where: { moodboardId: id } }),
      this.prisma.aiSession.deleteMany({ where: { moodboardId: id } }),
      this.prisma.moodboard.update({
        where: { id },
        data: {
          styleDirection: 'New Mood Board',
          colorPalette: [],
          fabricSuggestions: [],
          mood: 'Exploring ideas',
          canvasViewport: { x: 0, y: 0, zoom: 1 },
        },
      }),
    ]);

    return this.findFull(id, userId, role);
  }

  async remove(id: string, userId: string, role: string) {
    const moodboard = await this.prisma.moodboard.findUnique({ where: { id } });
    if (!moodboard) throw new NotFoundException('Moodboard not found');
    if (role !== 'ADMIN') await this.assertProjectOwnership(moodboard.projectId, userId);
    return this.prisma.moodboard.delete({ where: { id } });
  }

  private async assertProjectOwnership(projectId: string, customerId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.customerId !== customerId) throw new ForbiddenException('Access denied');
  }
}