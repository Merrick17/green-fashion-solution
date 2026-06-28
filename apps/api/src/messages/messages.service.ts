import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole, NotificationType } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';
import { CreateMessageThreadDto, SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async findThreads(userId: string, role: string, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const where =
      role === UserRole.ADMIN
        ? {}
        : role === UserRole.CUSTOMER
          ? { customerId: userId }
          : null;
    if (!where) throw new ForbiddenException('Access denied');

    const [data, total] = await Promise.all([
      this.prisma.messageThread.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.messageThread.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async findThread(id: string, userId: string, role: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (role === UserRole.CUSTOMER && thread.customerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (role !== UserRole.ADMIN && role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Access denied');
    }
    return thread;
  }

  async createThread(dto: CreateMessageThreadDto, userId: string, role: string) {
    if (role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customers can start threads');
    }
    const thread = await this.prisma.messageThread.create({
      data: {
        customerId: userId,
        projectId: dto.projectId,
        messages: {
          create: {
            senderId: userId,
            senderRole: UserRole.CUSTOMER,
            body: dto.body,
          },
        },
      },
      include: { messages: true },
    });
    await this.notifyAdmins(`New message from customer`);
    return thread;
  }

  async sendMessage(threadId: string, dto: SendMessageDto, userId: string, role: string) {
    const thread = await this.findThread(threadId, userId, role);
    const message = await this.prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        senderRole: role as UserRole,
        body: dto.body,
      },
    });
    await this.prisma.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });
    if (role === UserRole.ADMIN) {
      await this.notifications.create(
        thread.customerId,
        NotificationType.MESSAGE_RECEIVED,
        'New message from your sourcing team',
      );
    } else {
      await this.notifyAdmins('Customer replied to message thread');
    }
    return message;
  }

  async findOrCreateBriefQaThread(projectId: string, customerId: string) {
    const existing = await this.prisma.messageThread.findFirst({
      where: { projectId, purpose: 'BRIEF_QA' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (existing) return existing;
    return this.prisma.messageThread.create({
      data: { customerId, projectId, purpose: 'BRIEF_QA' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async getProjectCustomerId(projectId: string): Promise<string> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { customerId: true },
    });
    if (!project) throw new Error(`Project ${projectId} not found`);
    return project.customerId;
  }

  private async notifyAdmins(message: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        this.notifications.create(a.id, NotificationType.MESSAGE_RECEIVED, message),
      ),
    );
  }
}
