import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { ProposalPdfService } from './proposal-pdf.service';
import { ProposalPptxService } from './proposal-pptx.service';
import { CacheService } from '../cache/cache.service';
import { ProposalStatus } from '@repo/types';

const proposalInclude = {
  sections: { include: { items: { include: { fabricAsset: true, productAsset: true } } } },
  project: { include: { customer: { select: { name: true, email: true } } } },
  changeRequests: { orderBy: { createdAt: 'desc' } },
};

const makeProposal = (overrides: Record<string, unknown> = {}) => ({
  id: 'proposal-1',
  projectId: 'project-1',
  version: 1,
  status: 'DRAFT',
  title: 'SS25 Sourcing Proposal',
  season: 'SS25',
  styleSummary: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [],
  project: { customerId: 'customer-1', customer: { name: 'Brand Co', email: 'brand@example.com' } },
  changeRequests: [],
  ...overrides,
});

describe('ProposalsService', () => {
  let service: ProposalsService;
  let mockPrisma: {
    proposal: jest.Mocked<{ create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; count: jest.Mock; update: jest.Mock; delete: jest.Mock }>;
    proposalSection: jest.Mocked<{ deleteMany: jest.Mock }>;
    project: jest.Mocked<{ findMany: jest.Mock }>;
    proposalChangeRequest: jest.Mocked<{ create: jest.Mock }>;
  };
  let mockEvents: jest.Mocked<Pick<EventsService, 'notifyProposalReady' | 'emitProposalUpdated'>>;
  let mockPdf: jest.Mocked<Pick<ProposalPdfService, 'generate'>>;
  let mockPptx: { generate: jest.Mock };
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock; delByPattern: jest.Mock };

  beforeEach(async () => {
    mockPrisma = {
      proposal: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      proposalSection: {
        deleteMany: jest.fn(),
      },
      project: {
        findMany: jest.fn(),
      },
      proposalChangeRequest: {
        create: jest.fn(),
      },
    };

    mockEvents = {
      notifyProposalReady: jest.fn().mockResolvedValue(undefined),
      emitProposalUpdated: jest.fn().mockResolvedValue(undefined),
    };

    mockPdf = {
      generate: jest.fn(),
    };

    mockPptx = {
      generate: jest.fn(),
    };

    mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsService, useValue: mockEvents },
        { provide: ProposalPdfService, useValue: mockPdf },
        { provide: ProposalPptxService, useValue: mockPptx },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const baseDto = {
      projectId: 'project-1',
      title: 'SS25 Proposal',
      season: 'SS25',
      styleSummary: undefined,
      sections: [],
    };

    it('fires notifyProposalReady when status is SENT', async () => {
      const dto = { ...baseDto, status: ProposalStatus.SENT };
      const proposal = makeProposal({ status: 'SENT' });
      (mockPrisma.proposal.create as jest.Mock).mockResolvedValue(proposal);

      await service.create(dto);

      expect(mockEvents.notifyProposalReady).toHaveBeenCalledWith('project-1', 'proposal-1');
    });

    it('does NOT fire notifyProposalReady when status is DRAFT', async () => {
      const dto = { ...baseDto, status: ProposalStatus.DRAFT };
      const proposal = makeProposal({ status: 'DRAFT' });
      (mockPrisma.proposal.create as jest.Mock).mockResolvedValue(proposal);

      await service.create(dto);

      expect(mockEvents.notifyProposalReady).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const query = { page: 1, limit: 10, sortOrder: 'desc' as const };

    it('returns all proposals for ADMIN role', async () => {
      const proposals = [makeProposal()];
      (mockPrisma.proposal.findMany as jest.Mock).mockResolvedValue(proposals);
      (mockPrisma.proposal.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll('admin-1', 'ADMIN', query);

      expect(result.data).toEqual(proposals);
      expect(mockPrisma.project.findMany).not.toHaveBeenCalled();
    });

    it('filters by customerId for CUSTOMER role', async () => {
      const projects = [{ id: 'project-1' }, { id: 'project-2' }];
      const proposals = [makeProposal()];
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(projects);
      (mockPrisma.proposal.findMany as jest.Mock).mockResolvedValue(proposals);
      (mockPrisma.proposal.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll('customer-1', 'CUSTOMER', query);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
        select: { id: true },
      });
      expect(result.data).toEqual(proposals);
    });

    it('throws ForbiddenException for DESIGNER role', async () => {
      await expect(service.findAll('designer-1', 'DESIGNER', query)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes proposal when it exists', async () => {
      const proposal = makeProposal();
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(proposal);
      (mockPrisma.proposal.delete as jest.Mock).mockResolvedValue(proposal);

      const result = await service.remove('proposal-1');

      expect(mockPrisma.proposal.delete).toHaveBeenCalledWith({ where: { id: 'proposal-1' } });
      expect(result).toEqual(proposal);
    });

    it('throws NotFoundException for unknown id', async () => {
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.proposal.delete).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns proposal for ADMIN regardless of ownership', async () => {
      const proposal = makeProposal();
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(proposal);

      const result = await service.findById('proposal-1', 'other-user', 'ADMIN');

      expect(result).toMatchObject({ id: proposal.id, status: proposal.status, projectId: proposal.projectId });
    });

    it('throws NotFoundException when proposal does not exist', async () => {
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('bad-id', 'customer-1', 'CUSTOMER')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when customer accesses another customer proposal', async () => {
      const proposal = makeProposal({ project: { customerId: 'other-customer', customer: { name: 'X', email: 'x@x.com' } } });
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(proposal);

      await expect(service.findById('proposal-1', 'customer-1', 'CUSTOMER')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('fires notifyProposalReady when updating status to SENT', async () => {
      const existingProposal = makeProposal({ status: 'DRAFT' });
      const updatedProposal = makeProposal({ status: 'SENT' });
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(existingProposal);
      (mockPrisma.proposal.update as jest.Mock).mockResolvedValue(updatedProposal);

      await service.update('proposal-1', { status: ProposalStatus.SENT });

      expect(mockEvents.notifyProposalReady).toHaveBeenCalledWith('project-1', 'proposal-1');
    });

    it('increments version when previous status was CHANGES_REQUESTED', async () => {
      const existingProposal = makeProposal({ status: 'CHANGES_REQUESTED' });
      const updatedProposal = makeProposal({ status: 'SENT', version: 2 });
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(existingProposal);
      (mockPrisma.proposal.update as jest.Mock).mockResolvedValue(updatedProposal);

      await service.update('proposal-1', { status: ProposalStatus.SENT });

      const updateCall = (mockPrisma.proposal.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ version: { increment: 1 } });
    });

    it('does NOT increment version when previous status was DRAFT', async () => {
      const existingProposal = makeProposal({ status: 'DRAFT' });
      const updatedProposal = makeProposal({ status: 'SENT', version: 1 });
      (mockPrisma.proposal.findUnique as jest.Mock).mockResolvedValue(existingProposal);
      (mockPrisma.proposal.update as jest.Mock).mockResolvedValue(updatedProposal);

      await service.update('proposal-1', { status: ProposalStatus.SENT });

      const updateCall = (mockPrisma.proposal.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.version).toBeUndefined();
    });
  });
});
