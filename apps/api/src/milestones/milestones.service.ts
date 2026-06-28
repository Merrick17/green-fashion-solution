import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMilestoneDto) {
    return this.prisma.milestone.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        date: new Date(dto.date),
        type: dto.type,
      },
    });
  }

  async findByProject(projectId: string, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const where = { projectId };
    const orderBy = { date: query.sortOrder ?? 'asc' };
    const [data, total] = await Promise.all([
      this.prisma.milestone.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.milestone.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async update(id: string, dto: UpdateMilestoneDto) {
    await this.findById(id);
    return this.prisma.milestone.update({
      where: { id },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        completed: dto.completed,
        type: dto.type,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.milestone.delete({ where: { id } });
  }

  async findById(id: string) {
    const milestone = await this.prisma.milestone.findUnique({ where: { id } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    return milestone;
  }
}
