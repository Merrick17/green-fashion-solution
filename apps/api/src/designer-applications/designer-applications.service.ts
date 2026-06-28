import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesignerApplicationDto, ApproveDesignerApplicationDto } from './dto/designer-application.dto';
import { DesignerApplicationStatus, UserRole } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';

@Injectable()
export class DesignerApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: CreateDesignerApplicationDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const pending = await this.prisma.designerApplication.findFirst({
      where: { email: dto.email, status: DesignerApplicationStatus.PENDING },
    });
    if (pending) {
      throw new ConflictException('You already have a pending application');
    }

    return this.prisma.designerApplication.create({
      data: {
        name: dto.name,
        email: dto.email,
        portfolioUrl: dto.portfolioUrl,
        experience: dto.experience,
        message: dto.message,
      },
    });
  }

  countPending(): Promise<number> {
    return this.prisma.designerApplication.count({ where: { status: 'PENDING' } });
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.designerApplication.findMany({ orderBy, skip, take: limit }),
      this.prisma.designerApplication.count(),
    ]);
    return paginated(data, total, page, limit);
  }

  async approve(id: string, dto: ApproveDesignerApplicationDto) {
    const application = await this.findById(id);
    if (application.status !== DesignerApplicationStatus.PENDING) {
      throw new BadRequestException('Application is not pending');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: application.email } });
    if (existingUser) {
      throw new ConflictException('User already exists for this email');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const [user] = await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          email: application.email,
          password: hashed,
          name: application.name,
          role: UserRole.DESIGNER,
        },
      }),
      this.prisma.designerApplication.update({
        where: { id },
        data: { status: DesignerApplicationStatus.APPROVED, reviewedAt: new Date() },
      }),
    ]);

    const { password, ...result } = user;
    return { user: result, applicationId: id };
  }

  async reject(id: string) {
    const application = await this.findById(id);
    if (application.status !== DesignerApplicationStatus.PENDING) {
      throw new BadRequestException('Application is not pending');
    }
    return this.prisma.designerApplication.update({
      where: { id },
      data: { status: DesignerApplicationStatus.REJECTED, reviewedAt: new Date() },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.designerApplication.delete({ where: { id } });
  }

  private async findById(id: string) {
    const application = await this.prisma.designerApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }
}
