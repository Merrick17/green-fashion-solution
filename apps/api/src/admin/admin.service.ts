import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DesignerApplicationsService } from '../designer-applications/designer-applications.service';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { ProposalsService } from '../proposals/proposals.service';
import { TasksService } from '../tasks/tasks.service';
import { MeetingsService } from '../meetings/meetings.service';
import { LeadsService } from '../leads/leads.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { MoodboardsService } from '../moodboards/moodboards.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { AssetsService } from '../assets/assets.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { UserRole } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/admin-user.dto';
import { ApproveDesignerApplicationDto } from '../designer-applications/dto/designer-application.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly designerApplications: DesignerApplicationsService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly proposalsService: ProposalsService,
    private readonly tasksService: TasksService,
    private readonly meetingsService: MeetingsService,
    private readonly leadsService: LeadsService,
    private readonly waitlistService: WaitlistService,
    private readonly moodboardsService: MoodboardsService,
    private readonly filesService: FilesService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly assetsService: AssetsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getOverview() {
    const [
      users,
      projects,
      proposals,
      tasks,
      meetings,
      leads,
      waitlist,
      moodboards,
      files,
      notifications,
      auditLogs,
      fabrics,
      products,
      designerApplications,
    ] = await Promise.all([
      this.usersService.count(),
      this.projectsService.count(),
      this.proposalsService.count(),
      this.tasksService.count(),
      this.meetingsService.count(),
      this.leadsService.count(),
      this.waitlistService.count(),
      this.moodboardsService.count(),
      this.filesService.count(),
      this.notificationsService.count(),
      this.auditService.count(),
      this.assetsService.countFabrics(),
      this.assetsService.countProducts(),
      this.designerApplications.countPending(),
    ]);

    return {
      users,
      projects,
      proposals,
      tasks,
      meetings,
      leads,
      waitlist,
      moodboards,
      files,
      notifications,
      auditLogs,
      assets: fabrics + products,
      designerApplications,
    };
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async createUser(dto: AdminCreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    if (dto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot create admin accounts via API');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashed, name: dto.name, role: dto.role },
    });
    const { password, ...result } = user;
    return result;
  }

  async updateUser(id: string, dto: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.role === UserRole.ADMIN && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot promote to admin via API');
    }
    const updated = await this.prisma.user.update({ where: { id }, data: dto });
    if (dto.blocked === true) {
      await this.redis.revokeAllRefreshTokens(id);
    }
    const { password, ...result } = updated;
    return result;
  }

  async blockUser(id: string) {
    return this.updateUser(id, { blocked: true });
  }

  async unblockUser(id: string) {
    return this.updateUser(id, { blocked: false });
  }

  async updateUserRole(id: string, role: UserRole) {
    if (role === UserRole.ADMIN) throw new ForbiddenException('Cannot assign admin role');
    return this.updateUser(id, { role });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) throw new ForbiddenException('Cannot delete admin accounts');
    await this.redis.revokeAllRefreshTokens(id);
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  // ─── Designer applications ───────────────────────────────────────────────

  findAllDesignerApplications(query: PaginationQueryDto) {
    return this.designerApplications.findAll(query);
  }

  approveDesignerApplication(id: string, dto: ApproveDesignerApplicationDto) {
    return this.designerApplications.approve(id, dto);
  }

  rejectDesignerApplication(id: string) {
    return this.designerApplications.reject(id);
  }

  deleteDesignerApplication(id: string) {
    return this.designerApplications.remove(id);
  }

  // ─── Entity lists ────────────────────────────────────────────────────────

  async findAllLeads(query: PaginationQueryDto) {
    return this.paginate(this.prisma.lead, query);
  }

  async findAllWaitlist(query: PaginationQueryDto) {
    return this.paginate(this.prisma.waitlistEntry, query);
  }

  async findAllMoodboards(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { generatedAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.moodboard.findMany({
        orderBy,
        skip,
        take: limit,
        include: {
          project: { select: { id: true, title: true, customerId: true } },
          items: { select: { id: true } },
        },
      }),
      this.prisma.moodboard.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  async findAllFiles(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        orderBy,
        skip,
        take: limit,
        include: { project: { select: { id: true, title: true } } },
      }),
      this.prisma.file.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  async findAllInspiration(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.inspirationSelection.findMany({
        orderBy,
        skip,
        take: limit,
        include: {
          project: { select: { id: true, title: true } },
          customer: { select: { id: true, name: true, email: true } },
          fabricAsset: { select: { id: true, name: true, imageUrl: true } },
          productAsset: { select: { id: true, name: true, imageUrl: true } },
        },
      }),
      this.prisma.inspirationSelection.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  async findAllNotifications(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.notification.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  async findAllAuditLogs(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  private async paginate(
    model: { findMany: (args: object) => Promise<unknown[]>; count: () => Promise<number> },
    query: PaginationQueryDto,
  ) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      model.findMany({ orderBy, skip, take: limit }),
      model.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  // ─── Entity deletes ────────────────────────────────────────────────────────

  async updateLead(id: string, data: { status: LeadStatus }) {
    return this.prisma.lead.update({ where: { id }, data: { status: data.status } });
  }

  async deleteLead(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }

  async deleteWaitlistEntry(id: string) {
    return this.prisma.waitlistEntry.delete({ where: { id } });
  }

  async deleteMoodboard(id: string) {
    return this.prisma.moodboard.delete({ where: { id } });
  }

  async deleteFile(id: string) {
    return this.prisma.file.delete({ where: { id } });
  }

  async deleteNotification(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async deleteProject(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async deleteProposal(id: string) {
    return this.prisma.proposal.delete({ where: { id } });
  }

  async deleteMeeting(id: string) {
    return this.prisma.meeting.delete({ where: { id } });
  }

  async deleteTask(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async deleteFabricAsset(id: string) {
    return this.prisma.fabricAsset.delete({ where: { id } });
  }

  async deleteProductAsset(id: string) {
    return this.prisma.productAsset.delete({ where: { id } });
  }

  async deleteInspiration(id: string) {
    return this.prisma.inspirationSelection.delete({ where: { id } });
  }

  async deleteMilestone(id: string) {
    return this.prisma.milestone.delete({ where: { id } });
  }

  getAnalytics() {
    return this.analyticsService.getMetrics();
  }
}
