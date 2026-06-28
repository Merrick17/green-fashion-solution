import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../files/storage.service';
import { CreateMoodItemDto } from './dto/create-mood-item.dto';
import { UpdateMoodItemDto } from './dto/update-mood-item.dto';
import { BatchUpdateMoodItemsDto } from './dto/batch-update-mood-items.dto';
import { assertMoodboardAccess } from '../common/access/access.util';
import { isDataUrl } from '../common/utils/content-hash';
import { UserRole } from '@repo/types';

@Injectable()
export class MoodItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(moodboardId: string, dto: CreateMoodItemDto, userId: string, role: string) {
    await assertMoodboardAccess(this.prisma, moodboardId, userId, role);
    this.validateContent(dto.content);
    const content = await this.resolveContentUrls(dto.content);
    return this.prisma.moodItem.create({
      data: {
        moodboardId,
        type: dto.type,
        x: dto.x ?? 0,
        y: dto.y ?? 0,
        width: dto.width ?? 200,
        height: dto.height ?? 200,
        rotation: dto.rotation ?? 0,
        zIndex: dto.zIndex ?? 0,
        content: content as any,
        style: dto.style as any ?? undefined,
        locked: dto.locked ?? false,
        groupId: dto.groupId ?? undefined,
      },
    });
  }

  async findByMoodboard(moodboardId: string, userId: string, role: string) {
    await assertMoodboardAccess(this.prisma, moodboardId, userId, role);
    const items = await this.prisma.moodItem.findMany({
      where: { moodboardId },
      orderBy: { zIndex: 'asc' },
    });
    return Promise.all(items.map((item) => this.hydrateItem(item)));
  }

  async findById(id: string, userId: string, role: string) {
    const item = await this.prisma.moodItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Mood item not found');
    await assertMoodboardAccess(this.prisma, item.moodboardId, userId, role);
    return this.hydrateItem(item);
  }

  async update(id: string, dto: UpdateMoodItemDto, userId: string, role: string) {
    const item = await this.prisma.moodItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Mood item not found');
    await assertMoodboardAccess(this.prisma, item.moodboardId, userId, role);
    if (item.locked && role !== UserRole.ADMIN) throw new ForbiddenException('Item is locked');

    const data: any = {};
    if (dto.x !== undefined) data.x = dto.x;
    if (dto.y !== undefined) data.y = dto.y;
    if (dto.width !== undefined) data.width = dto.width;
    if (dto.height !== undefined) data.height = dto.height;
    if (dto.rotation !== undefined) data.rotation = dto.rotation;
    if (dto.zIndex !== undefined) data.zIndex = dto.zIndex;
    if (dto.content !== undefined) {
      this.validateContent(dto.content);
      data.content = await this.resolveContentUrls(dto.content);
    }
    if (dto.style !== undefined) data.style = dto.style;
    if (dto.locked !== undefined) data.locked = dto.locked;
    if (dto.groupId !== undefined) data.groupId = dto.groupId;

    const updated = await this.prisma.moodItem.update({ where: { id }, data });
    return this.hydrateItem(updated);
  }

  async remove(id: string, userId: string, role: string) {
    const item = await this.prisma.moodItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Mood item not found');
    await assertMoodboardAccess(this.prisma, item.moodboardId, userId, role);
    return this.prisma.moodItem.delete({ where: { id } });
  }

  async batchUpdate(dto: BatchUpdateMoodItemsDto, userId: string, role: string) {
    if (dto.updates.length === 0) return [];

    const firstUpdate = dto.updates[0]!;
    const firstItem = await this.prisma.moodItem.findUnique({
      where: { id: firstUpdate.id },
    });
    if (!firstItem) throw new NotFoundException('Mood item not found');
    await assertMoodboardAccess(this.prisma, firstItem.moodboardId, userId, role);

    const results = await this.prisma.$transaction(
      dto.updates.map((u) => {
        const data: any = {};
        if (u.x !== undefined) data.x = u.x;
        if (u.y !== undefined) data.y = u.y;
        if (u.width !== undefined) data.width = u.width;
        if (u.height !== undefined) data.height = u.height;
        if (u.rotation !== undefined) data.rotation = u.rotation;
        if (u.zIndex !== undefined) data.zIndex = u.zIndex;
        return this.prisma.moodItem.update({ where: { id: u.id }, data });
      }),
    );
    return Promise.all(results.map((item) => this.hydrateItem(item)));
  }

  async reorder(itemIds: string[], userId: string, role: string) {
    if (itemIds.length === 0) return [];

    const firstItemId = itemIds[0]!;
    const firstItem = await this.prisma.moodItem.findUnique({
      where: { id: firstItemId },
    });
    if (!firstItem) throw new NotFoundException('Mood item not found');
    await assertMoodboardAccess(this.prisma, firstItem.moodboardId, userId, role);

    const results = await this.prisma.$transaction(
      itemIds.map((id, index) =>
        this.prisma.moodItem.update({ where: { id }, data: { zIndex: index } }),
      ),
    );
    return Promise.all(results.map((item) => this.hydrateItem(item)));
  }

  private validateContent(content: unknown) {
    const c = content as { src?: string; key?: string };
    const value = c?.key ?? c?.src;
    if (value && isDataUrl(value)) {
      throw new BadRequestException('Inline base64 images are not allowed. Upload to storage first.');
    }
  }

  private async resolveContentUrls(content: unknown): Promise<unknown> {
    const c = content as { src?: string; key?: string; alt?: string };
    if (c?.key) {
      return { ...c, src: await this.storage.getSignedGetUrl(c.key) };
    }
    if (c?.src && !c.src.startsWith('http') && !c.src.startsWith('data:')) {
      return { ...c, key: c.src, src: await this.storage.getSignedGetUrl(c.src) };
    }
    return content;
  }

  private async hydrateItem<T extends { content: unknown }>(item: T): Promise<T> {
    return {
      ...item,
      content: await this.resolveContentUrls(item.content),
    };
  }
}
