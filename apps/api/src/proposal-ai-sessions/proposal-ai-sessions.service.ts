import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProposalAiSessionDto } from './dto/upsert-proposal-ai-session.dto';

@Injectable()
export class ProposalAiSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProject(projectId: string, userId: string, role: string) {
    this.assertAdmin(role);
    await this.assertProjectExists(projectId);
    return this.prisma.proposalAiSession.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  async upsert(
    projectId: string,
    dto: UpsertProposalAiSessionDto,
    userId: string,
    role: string,
  ) {
    this.assertAdmin(role);
    await this.assertProjectExists(projectId);
    return this.prisma.proposalAiSession.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: {
        projectId,
        userId,
        messages: dto.messages as object,
        modelId: dto.modelId,
        settings: dto.settings as object | undefined,
      },
      update: {
        messages: dto.messages as object,
        modelId: dto.modelId,
        settings: dto.settings as object | undefined,
      },
    });
  }

  private assertAdmin(role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException('Admin only');
  }

  private async assertProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
  }
}
