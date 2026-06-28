import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertMoodboardAccess } from '../common/access/access.util';
import { UpsertAiSessionDto } from './dto/upsert-ai-session.dto';

@Injectable()
export class AiSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMoodboard(moodboardId: string, userId: string, role: string) {
    await assertMoodboardAccess(this.prisma, moodboardId, userId, role, {
      designerMessage: 'Designers cannot access AI sessions',
    });
    return this.prisma.aiSession.findUnique({
      where: { moodboardId_userId: { moodboardId, userId } },
    });
  }

  async upsert(moodboardId: string, dto: UpsertAiSessionDto, userId: string, role: string) {
    await assertMoodboardAccess(this.prisma, moodboardId, userId, role, {
      designerMessage: 'Designers cannot access AI sessions',
    });
    return this.prisma.aiSession.upsert({
      where: { moodboardId_userId: { moodboardId, userId } },
      create: {
        moodboardId,
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
}
