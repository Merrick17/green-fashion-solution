import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { BriefOptionsService } from '../brief-options/brief-options.service';
import { CacheService } from '../cache/cache.service';

const makeProject = (overrides: Record<string, unknown> = {}) => ({
  id: 'project-1',
  title: 'SS26 Project',
  customerId: 'customer-1',
  status: ProjectStatus.DRAFT,
  season: 'SS26',
  category: 'TOPS',
  description: null,
  budgetBand: null,
  targetDelivery: null,
  moq: null,
  garmentCategories: [],
  targetPricePointMillimes: null,
  sustainabilityRequirements: null,
  coverImageUrl: null,
  briefSubmittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockPrisma: {
    project: { findMany: jest.Mock; findUnique: jest.Mock; count: jest.Mock; update: jest.Mock; create: jest.Mock; delete: jest.Mock };
  };
  let mockEvents: { notifyStatusChanged: jest.Mock; emitProjectStatusChanged: jest.Mock };
  let mockBriefOptions: { assertActiveOption: jest.Mock };
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock; delByPattern: jest.Mock };

  beforeEach(async () => {
    mockPrisma = {
      project: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockEvents = {
      notifyStatusChanged: jest.fn().mockResolvedValue(undefined),
      emitProjectStatusChanged: jest.fn().mockResolvedValue(undefined),
    };

    mockBriefOptions = {
      assertActiveOption: jest.fn().mockResolvedValue(undefined),
    };

    mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsService, useValue: mockEvents },
        { provide: BriefOptionsService, useValue: mockBriefOptions },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated projects', async () => {
      const projects = [makeProject()];
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(projects);
      (mockPrisma.project.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(projects);
      expect(result.meta.total).toBe(1);
    });

    it('returns cached result when cache hits', async () => {
      const cached = { data: [makeProject()], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } };
      mockCache.get.mockResolvedValue(cached);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(cached);
      expect(mockPrisma.project.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns project when found', async () => {
      const project = makeProject();
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);

      const result = await service.findById('project-1');

      expect(result).toEqual(project);
    });

    it('throws NotFoundException when project does not exist', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('emits notification when status changes', async () => {
      const project = makeProject({ status: ProjectStatus.DRAFT });
      const updated = makeProject({ status: ProjectStatus.SUBMITTED });
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (mockPrisma.project.update as jest.Mock).mockResolvedValue(updated);

      await service.update('project-1', { status: ProjectStatus.SUBMITTED });

      expect(mockEvents.notifyStatusChanged).toHaveBeenCalledWith(
        'customer-1',
        'SS26 Project',
        ProjectStatus.SUBMITTED,
      );
      expect(mockEvents.emitProjectStatusChanged).toHaveBeenCalledWith('customer-1', updated);
    });

    it('throws BadRequestException on invalid status transition', async () => {
      const project = makeProject({ status: ProjectStatus.COMPLETED });
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);

      await expect(
        service.update('project-1', { status: ProjectStatus.DRAFT }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.project.update).not.toHaveBeenCalled();
    });

    it('does NOT emit notification when status is unchanged', async () => {
      const project = makeProject({ status: ProjectStatus.DRAFT });
      const updated = makeProject({ status: ProjectStatus.DRAFT });
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (mockPrisma.project.update as jest.Mock).mockResolvedValue(updated);

      await service.update('project-1', { status: ProjectStatus.DRAFT });

      expect(mockEvents.notifyStatusChanged).not.toHaveBeenCalled();
    });
  });
});
