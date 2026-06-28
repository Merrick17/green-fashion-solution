import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CacheService } from '../cache/cache.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateProposalItemDto } from './dto/update-proposal-item.dto';
import { ProposalPdfService } from './proposal-pdf.service';
import { ProposalPptxService } from './proposal-pptx.service';
import { ProposalStatus, UserRole } from '@repo/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';

const PROPOSALS_CACHE_TTL = 60;

const proposalInclude = {
  sections: {
    include: {
      items: {
        include: {
          fabricAsset: { select: { id: true, name: true, description: true, imageUrl: true, keywords: true, pricePerUnitMillimes: true } },
          productAsset: { select: { id: true, name: true, description: true, imageUrl: true, keywords: true, pricePerUnitMillimes: true } },
        },
      },
    },
  },
  project: { include: { customer: { select: { name: true, email: true } } } },
  changeRequests: { orderBy: { createdAt: 'desc' as const } },
  readEvents: { orderBy: { openedAt: 'desc' as const }, take: 1 },
};

function computeBudgetSummary(sections: Array<{ id: string; title: string; items: Array<{ fabricAsset?: { pricePerUnitMillimes?: number | null } | null; productAsset?: { pricePerUnitMillimes?: number | null } | null }> }>) {
  const perSection = sections.map((sec) => {
    const total = sec.items.reduce((sum, item) => {
      const price = item.fabricAsset?.pricePerUnitMillimes ?? item.productAsset?.pricePerUnitMillimes ?? 0;
      return sum + price;
    }, 0);
    return { sectionId: sec.id, title: sec.title, totalMillimes: total };
  });
  return {
    totalMillimes: perSection.reduce((s, sec) => s + sec.totalMillimes, 0),
    perSection,
    itemCount: sections.reduce((s, sec) => s + sec.items.length, 0),
  };
}

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly pdf: ProposalPdfService,
    private readonly pptx: ProposalPptxService,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateProposalDto) {
    const proposal = await this.prisma.proposal.create({
      data: {
        projectId: dto.projectId,
        status: dto.status,
        title: dto.title,
        season: dto.season,
        styleSummary: dto.styleSummary,
        sections: {
          create: dto.sections.map((sec, i) => ({
            title: sec.title,
            description: sec.description,
            adminNotes: sec.adminNotes,
            position: sec.position ?? i,
            items: {
              create: sec.items.map((item, j) => ({
                fabricAssetId: item.fabricAssetId,
                productAssetId: item.productAssetId,
                notes: item.notes,
                position: item.position ?? j,
              })),
            },
          })),
        },
      },
      include: proposalInclude,
    });

    if (proposal.status === ProposalStatus.SENT) {
      await this.events.notifyProposalReady(proposal.projectId, proposal.id);
    }
    await this.events.emitProposalUpdated(proposal.project.customerId, proposal);
    await this.cache.delByPattern('proposals:*');
    return proposal;
  }

  async findAll(userId: string, role: string, query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const cacheKey = `proposals:list:${role}:${userId}:${page}:${limit}:${query.sortOrder ?? 'desc'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const include = {
      sections: { include: { items: { include: { fabricAsset: { select: { id: true, name: true, imageUrl: true } }, productAsset: { select: { id: true, name: true, imageUrl: true } } } } } },
      readEvents: { orderBy: { openedAt: 'desc' as const }, take: 1 },
    };

    let result;
    if (role === UserRole.ADMIN) {
      const [data, total] = await Promise.all([
        this.prisma.proposal.findMany({ orderBy, skip, take: limit, include }),
        this.prisma.proposal.count(),
      ]);
      result = paginated(data, total, page, limit);
    } else if (role === UserRole.CUSTOMER) {
      const projects = await this.prisma.project.findMany({
        where: { customerId: userId },
        select: { id: true },
      });
      const where = { projectId: { in: projects.map((p) => p.id) } };
      const [data, total] = await Promise.all([
        this.prisma.proposal.findMany({ where, orderBy, skip, take: limit, include }),
        this.prisma.proposal.count({ where }),
      ]);
      result = paginated(data, total, page, limit);
    } else {
      throw new ForbiddenException('Access denied');
    }

    await this.cache.set(cacheKey, result, PROPOSALS_CACHE_TTL);
    return result;
  }

  async findById(id: string, userId: string, role: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: proposalInclude,
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    const budgetSummary = computeBudgetSummary(proposal.sections);

    if (role === UserRole.ADMIN) {
      const readEvents = proposal.readEvents ?? [];
      const lastViewedAt = readEvents[0]?.openedAt ?? null;
      const viewCount = readEvents.length;
      return { ...proposal, budgetSummary, lastViewedAt, viewCount };
    }

    if (role === UserRole.CUSTOMER && proposal.project.customerId === userId) {
      const sections = proposal.sections.map(({ adminNotes: _adminNotes, ...rest }) => rest);
      return { ...proposal, sections, budgetSummary, readEvents: undefined };
    }

    throw new ForbiddenException('Access denied');
  }

  private async findByIdOrThrow(id: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async recordView(proposalId: string, customerId: string): Promise<void> {
    await this.prisma.proposalReadEvent.upsert({
      where: { proposalId_customerId: { proposalId, customerId } },
      update: { openedAt: new Date() },
      create: { proposalId, customerId },
    });
  }

  async update(id: string, dto: UpdateProposalDto) {
    const current = await this.findByIdOrThrow(id);
    const shouldBumpVersion = current.status === ProposalStatus.CHANGES_REQUESTED;
    if (dto.sections) {
      await this.prisma.proposalSection.deleteMany({ where: { proposalId: id } });
    }
    const proposal = await this.prisma.proposal.update({
      where: { id },
      data: {
        status: dto.status,
        title: dto.title,
        season: dto.season,
        styleSummary: dto.styleSummary,
        ...(shouldBumpVersion ? { version: { increment: 1 } } : {}),
        sections: dto.sections
          ? {
              create: dto.sections.map((sec, i) => ({
                title: sec.title,
                description: sec.description,
                adminNotes: sec.adminNotes,
                position: sec.position ?? i,
                items: {
                  create: sec.items.map((item, j) => ({
                    fabricAssetId: item.fabricAssetId,
                    productAssetId: item.productAssetId,
                    notes: item.notes,
                    position: item.position ?? j,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: proposalInclude,
    });

    if (dto.status === ProposalStatus.SENT) {
      await this.events.notifyProposalReady(proposal.projectId, proposal.id);
    }
    await this.events.emitProposalUpdated(proposal.project.customerId, proposal);
    await this.cache.delByPattern('proposals:*');
    return proposal;
  }

  async customerUpdate(id: string, dto: UpdateProposalDto, userId: string) {
    await this.findById(id, userId, UserRole.CUSTOMER);

    if (dto.status === ProposalStatus.CHANGES_REQUESTED && dto.changeRequestMessage?.trim()) {
      await this.prisma.proposalChangeRequest.create({
        data: {
          proposalId: id,
          customerId: userId,
          message: dto.changeRequestMessage.trim(),
          sectionId: dto.sectionId,
        },
      });
    }

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: { status: dto.status },
      include: proposalInclude,
    });
    await this.events.emitProposalUpdated(updated.project.customerId, updated);
    await this.cache.delByPattern('proposals:*');
    return updated;
  }

  async createChangeRequest(id: string, dto: CreateChangeRequestDto, userId: string) {
    const proposal = await this.findById(id, userId, UserRole.CUSTOMER);

    const changeRequest = await this.prisma.proposalChangeRequest.create({
      data: {
        proposalId: id,
        customerId: userId,
        message: dto.message.trim(),
        sectionId: dto.sectionId,
      },
    });

    if (proposal.status === ProposalStatus.SENT) {
      await this.prisma.proposal.update({
        where: { id },
        data: { status: ProposalStatus.CHANGES_REQUESTED },
      });
    }

    return changeRequest;
  }

  async remove(id: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return this.prisma.proposal.delete({ where: { id } });
  }

  async generatePdf(id: string, userId: string, role: string): Promise<Buffer> {
    const proposal = await this.findById(id, userId, role);
    return this.pdf.generate(proposal);
  }

  async generatePptx(id: string, userId: string, role: string): Promise<Buffer> {
    const proposal = await this.findById(id, userId, role);
    return this.pptx.generate(proposal);
  }

  async updateProposalItem(proposalId: string, itemId: string, dto: UpdateProposalItemDto) {
    const item = await this.prisma.proposalItem.findFirst({
      where: { id: itemId, section: { proposalId } },
    });
    if (!item) throw new NotFoundException('Proposal item not found');
    return this.prisma.proposalItem.update({
      where: { id: itemId },
      data: {
        samplingStatus: dto.samplingStatus,
        confirmedQty: dto.confirmedQty,
        confirmedColorway: dto.confirmedColorway,
        deliveryEta: dto.deliveryEta ? new Date(dto.deliveryEta) : undefined,
      },
    });
  }

  count(): Promise<number> {
    return this.prisma.proposal.count();
  }
}
