import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@repo/types';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(userId: string, role: string, start?: string, end?: string) {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (start) dateFilter.gte = new Date(start);
    if (end) dateFilter.lte = new Date(end);

    const [meetings, milestones, tasks] = await Promise.all([
      this.getMeetings(userId, role, dateFilter),
      this.getMilestones(userId, role, dateFilter),
      this.getDesignerTasks(userId, role, dateFilter),
    ]);

    return { meetings, milestones, tasks };
  }

  private async getMeetings(userId: string, role: string, dateFilter: { gte?: Date; lte?: Date }) {
    if (role === UserRole.DESIGNER) return [];
    const where: Record<string, unknown> = {};
    if (role !== UserRole.ADMIN) where.customerId = userId;
    if (dateFilter.gte || dateFilter.lte) {
      where.OR = [
        { scheduledAt: dateFilter },
        { scheduledAt: null, requestedAt: dateFilter },
      ];
    }

    return this.prisma.meeting.findMany({
      where,
      orderBy: [{ scheduledAt: 'asc' }, { requestedAt: 'asc' }],
    });
  }

  private async getMilestones(
    userId: string,
    role: string,
    dateFilter: { gte?: Date; lte?: Date },
  ) {
    if (role === UserRole.DESIGNER) return [];

    const where: Record<string, unknown> = {};
    if (dateFilter.gte || dateFilter.lte) where.date = dateFilter;
    if (role === UserRole.CUSTOMER) {
      where.project = { customerId: userId };
    } else if (role !== UserRole.ADMIN) {
      return [];
    }

    return this.prisma.milestone.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  private async getDesignerTasks(
    userId: string,
    role: string,
    dateFilter: { gte?: Date; lte?: Date },
  ) {
    if (role !== UserRole.DESIGNER) return [];
    const where: Record<string, unknown> = { designerId: userId, dueDate: { not: null } };
    if (dateFilter.gte || dateFilter.lte) where.dueDate = dateFilter;

    return this.prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      select: { id: true, title: true, dueDate: true, status: true, projectId: true },
    });
  }
}
