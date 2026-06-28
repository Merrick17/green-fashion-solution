import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodboardSnapshotDto } from './dto/create-moodboard-snapshot.dto';
import { assertMoodboardAccess } from '../common/access/access.util';

@Injectable()
export class MoodboardSnapshotsService {
  constructor(private readonly prisma: PrismaService) {}

  // Captures the current board state (metadata + items + viewport) into a
  // read-only point-in-time snapshot. Items remain the source of truth — the
  // snapshot is never written back to the live canvas.
  async create(moodboardId: string, dto: CreateMoodboardSnapshotDto, userId: string, role: string) {
    const moodboard = await assertMoodboardAccess(this.prisma, moodboardId, userId, role);
    const items = await this.prisma.moodItem.findMany({
      where: { moodboardId },
      orderBy: { zIndex: 'asc' },
    });

    const payload = {
      capturedAt: new Date().toISOString(),
      moodboard: {
        styleDirection: moodboard.styleDirection,
        colorPalette: moodboard.colorPalette,
        fabricSuggestions: moodboard.fabricSuggestions,
        mood: moodboard.mood,
        canvasViewport: moodboard.canvasViewport,
      },
      items: items.map((item) => ({
        id: item.id,
        moodboardId: item.moodboardId,
        type: item.type,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        rotation: item.rotation,
        zIndex: item.zIndex,
        content: item.content,
        style: item.style,
        locked: item.locked,
        groupId: item.groupId,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };

    return this.prisma.moodboardSnapshot.create({
      data: {
        moodboardId,
        document: payload as any,
        aiSummary: dto.aiSummary,
      },
    });
  }

  async findByMoodboard(moodboardId: string, userId: string, role: string) {
    await assertMoodboardAccess(this.prisma, moodboardId, userId, role);
    return this.prisma.moodboardSnapshot.findMany({
      where: { moodboardId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(moodboardId: string, id: string, userId: string, role: string) {
    await assertMoodboardAccess(this.prisma, moodboardId, userId, role);
    const snapshot = await this.prisma.moodboardSnapshot.findUnique({ where: { id } });
    if (!snapshot || snapshot.moodboardId !== moodboardId) {
      throw new NotFoundException('Snapshot not found');
    }
    return snapshot;
  }
}