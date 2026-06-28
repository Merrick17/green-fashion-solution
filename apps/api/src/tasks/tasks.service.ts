import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskListQueryDto } from './dto/update-task.dto';
import { TaskStatus, UserRole } from '@repo/types';
import { toProjectRef } from '@repo/utils';
import { resolvePagination, paginated } from '../common/utils/paginate';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async create(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        designerId: dto.designerId,
        title: dto.title,
        description: dto.description,
        briefType: dto.briefType,
        priority: dto.priority,
        deliverables: dto.deliverables,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    await this.events.notifyTaskAssigned(dto.designerId, dto.title);
    return task;
  }

  async findAll(query: TaskListQueryDto) {
    return this.paginateTasks({}, query, false);
  }

  async findByDesigner(designerId: string, query: TaskListQueryDto) {
    return this.paginateTasks({ designerId }, query, true);
  }

  private async paginateTasks(
    baseWhere: Record<string, unknown>,
    query: TaskListQueryDto,
    anonymizeProject: boolean,
  ) {
    const { page, limit, skip } = resolvePagination(query);
    const where = {
      ...baseWhere,
      ...(query.status ? { status: query.status } : {}),
      ...(query.briefType ? { briefType: query.briefType } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };
    const orderField = query.sortBy === 'dueDate' ? 'dueDate' : 'createdAt';
    const orderBy = { [orderField]: query.sortOrder ?? 'desc' };

    const [rows, total] = await Promise.all([
      this.prisma.task.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.task.count({ where }),
    ]);

    const data = anonymizeProject
      ? rows.map((t) => ({ ...t, projectRef: toProjectRef(t.projectId) }))
      : rows;

    return paginated(data, total, page, limit);
  }

  async findById(id: string, userId?: string, role?: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (role === UserRole.ADMIN) return task;
    if (role === UserRole.DESIGNER && task.designerId === userId) {
      return { ...task, projectRef: toProjectRef(task.projectId) };
    }
    if (userId && role) throw new ForbiddenException('Access denied');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findById(id);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        briefType: dto.briefType,
        priority: dto.priority,
        deliverables: dto.deliverables,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async designerUpdate(id: string, dto: UpdateTaskDto, designerId: string) {
    const task = await this.findById(id, designerId, UserRole.DESIGNER);
    if (dto.status !== TaskStatus.IN_PROGRESS && dto.status !== TaskStatus.COMPLETED) {
      throw new ForbiddenException('Designers can only mark briefs in progress or completed');
    }
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: { status: dto.status },
    });
    return { ...updated, projectRef: toProjectRef(updated.projectId) };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.task.delete({ where: { id } });
  }

  count(): Promise<number> {
    return this.prisma.task.count();
  }
}
