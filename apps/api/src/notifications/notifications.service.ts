import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.notification.count();
  }

  async create(userId: string, type: NotificationType, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  async findByUser(userId: string, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const where = { userId };
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.notification.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
