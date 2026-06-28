import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BriefOptionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBriefOptionDto, UpdateBriefOptionDto } from './dto/brief-option.dto';

@Injectable()
export class BriefOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(type?: BriefOptionType, includeInactive = false) {
    return this.prisma.briefOption.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(includeInactive ? {} : { active: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
  }

  async create(dto: CreateBriefOptionDto) {
    const label = dto.label.trim();
    const existing = await this.prisma.briefOption.findUnique({
      where: { type_label: { type: dto.type, label } },
    });
    if (existing) throw new ConflictException('Option already exists');

    const sortOrder =
      dto.sortOrder ??
      (await this.nextSortOrder(dto.type));

    return this.prisma.briefOption.create({
      data: { type: dto.type, label, sortOrder, active: dto.active ?? true },
    });
  }

  async update(id: string, dto: UpdateBriefOptionDto) {
    const option = await this.prisma.briefOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Option not found');

    const label = dto.label?.trim();
    if (label && label !== option.label) {
      const existing = await this.prisma.briefOption.findUnique({
        where: { type_label: { type: option.type, label } },
      });
      if (existing) throw new ConflictException('Option already exists');
    }

    return this.prisma.briefOption.update({
      where: { id },
      data: {
        ...(label ? { label } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });
  }

  async remove(id: string) {
    const option = await this.prisma.briefOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Option not found');
    return this.prisma.briefOption.delete({ where: { id } });
  }

  async assertActiveOption(type: BriefOptionType, label: string | undefined) {
    if (!label?.trim()) return;
    const option = await this.prisma.briefOption.findFirst({
      where: { type, label: label.trim(), active: true },
    });
    if (!option) {
      const field = type === BriefOptionType.SEASON ? 'season' : 'category';
      throw new BadRequestException(`Invalid ${field}: "${label}"`);
    }
  }

  private async nextSortOrder(type: BriefOptionType) {
    const last = await this.prisma.briefOption.findFirst({
      where: { type },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  }
}
