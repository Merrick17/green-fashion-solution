import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: { email: string; password: string; name: string; role: UserRole }) {
    return this.prisma.user.create({ data });
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({ orderBy, skip, take: limit }),
      this.prisma.user.count(),
    ]);
    const data = rows.map(({ password, ...result }) => result);
    return paginated(data, total, page, limit);
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({ where: { id }, data: { role } });
    const { password, ...result } = updated;
    return result;
  }

  async updateEmailNotifications(id: string, emailNotifications: boolean) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { emailNotifications },
    });
    const { password, ...result } = updated;
    return result;
  }

  async exportData(userId: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const projects = await this.prisma.project.findMany({ where: { customerId: userId } });
    const notifications = await this.prisma.notification.findMany({ where: { userId } });

    return {
      user,
      projects,
      notifications,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) {
      throw new NotFoundException('Admin accounts cannot be self-deleted');
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  count(): Promise<number> {
    return this.prisma.user.count();
  }
}
