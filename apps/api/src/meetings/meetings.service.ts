import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GraphService } from '../graph/graph.service';
import { EventsService } from '../events/events.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingStatus, UserRole } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graph: GraphService,
    private readonly events: EventsService,
  ) {}

  async create(dto: CreateMeetingDto, customerId: string) {
    const meeting = await this.prisma.meeting.create({
      data: {
        projectId: dto.projectId,
        customerId,
        requestedAt: new Date(dto.requestedAt),
        agenda: dto.agenda,
        durationMinutes: dto.durationMinutes,
      },
    });
    const adminIds = await this.events.getAdminIds();
    await this.events.notifyMeetingRequested(adminIds);
    return meeting;
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({ orderBy, skip, take: limit }),
      this.prisma.meeting.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  async findByCustomer(customerId: string, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const where = { customerId };
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.meeting.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async findById(id: string, userId: string, role: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (role !== UserRole.ADMIN && meeting.customerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    let teamsLink = meeting.teamsLink;
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : meeting.scheduledAt;

    if (
      dto.status === MeetingStatus.SCHEDULED ||
      dto.status === MeetingStatus.APPROVED
    ) {
      if (scheduledAt && !teamsLink) {
        teamsLink = await this.graph.createOnlineMeeting(`Green Meeting - ${id}`, scheduledAt);
      }
      if (dto.status === MeetingStatus.APPROVED) {
        await this.events.notifyMeetingApproved(meeting.customerId);
      }
    }

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: {
        status: dto.status,
        scheduledAt,
        teamsLink,
      },
    });
    await this.events.emitMeetingUpdated(meeting.customerId, updated);
    return updated;
  }

  count(): Promise<number> {
    return this.prisma.meeting.count();
  }
}
