import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../files/storage.service';

const makeFabric = (overrides: Record<string, unknown> = {}) => ({
  id: 'fabric-1',
  designerId: 'designer-1',
  name: 'Linen Dobby',
  description: null,
  imageUrl: 'https://example.com/fabric.jpg',
  keywords: ['linen', 'dobby'],
  metadata: null,
  composition: null,
  color: null,
  supplier: null,
  moq: null,
  leadTimeDays: null,
  pricePerUnitMillimes: null,
  briefId: null,
  seasons: [],
  availabilityStatus: 'AVAILABLE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AssetsService', () => {
  let service: AssetsService;
  let mockPrisma: {
    fabricAsset: { create: jest.Mock; findFirst: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    productAsset: { create: jest.Mock; findFirst: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    moodboard: { findMany: jest.Mock };
    project: { findMany: jest.Mock };
    inspirationSelection: { findMany: jest.Mock };
  };
  let mockStorage: { rejectDataUrl: jest.Mock; resolveUrl: jest.Mock };

  beforeEach(async () => {
    mockPrisma = {
      fabricAsset: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      productAsset: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      moodboard: { findMany: jest.fn().mockResolvedValue([]) },
      project: { findMany: jest.fn().mockResolvedValue([]) },
      inspirationSelection: { findMany: jest.fn().mockResolvedValue([]) },
    };

    mockStorage = {
      rejectDataUrl: jest.fn(),
      resolveUrl: jest.fn().mockImplementation((url: string) => Promise.resolve(url)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFabric', () => {
    const dto = {
      name: 'Linen Dobby',
      imageUrl: 'https://example.com/fabric.jpg',
      keywords: ['linen'],
      seasons: ['SS26'],
    };

    it('creates and returns a fabric asset', async () => {
      const fabric = makeFabric();
      (mockPrisma.fabricAsset.create as jest.Mock).mockResolvedValue(fabric);
      (mockPrisma.fabricAsset.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.createFabric(dto, 'designer-1');

      expect(mockPrisma.fabricAsset.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'Linen Dobby', designerId: 'designer-1' }) }),
      );
      expect(result.id).toBe('fabric-1');
    });

    it('returns _warning POSSIBLE_DUPLICATE when similar asset exists', async () => {
      const fabric = makeFabric();
      const similar = makeFabric({ id: 'fabric-2', name: 'Linen Weave' });
      (mockPrisma.fabricAsset.create as jest.Mock).mockResolvedValue(fabric);
      (mockPrisma.fabricAsset.findFirst as jest.Mock).mockResolvedValue(similar);

      const result = await service.createFabric(dto, 'designer-1') as typeof fabric & { _warning?: string };

      expect(result._warning).toBe('POSSIBLE_DUPLICATE');
    });

    it('does NOT add _warning when no similar asset found', async () => {
      const fabric = makeFabric();
      (mockPrisma.fabricAsset.create as jest.Mock).mockResolvedValue(fabric);
      (mockPrisma.fabricAsset.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.createFabric(dto, 'designer-1') as typeof fabric & { _warning?: string };

      expect(result._warning).toBeUndefined();
    });
  });

  describe('findFabricsForRole', () => {
    const query = { page: 1, limit: 10 };

    it('returns all fabrics for ADMIN role', async () => {
      const fabrics = [makeFabric()];
      (mockPrisma.fabricAsset.findMany as jest.Mock).mockResolvedValue(fabrics);
      (mockPrisma.fabricAsset.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findFabricsForRole('admin-1', 'ADMIN', query);

      expect(result.data).toBeDefined();
      expect(mockPrisma.fabricAsset.findMany).toHaveBeenCalled();
    });

    it('filters by designerId for DESIGNER role', async () => {
      const fabrics = [makeFabric()];
      (mockPrisma.fabricAsset.findMany as jest.Mock).mockResolvedValue(fabrics);
      (mockPrisma.fabricAsset.count as jest.Mock).mockResolvedValue(1);

      await service.findFabricsForRole('designer-1', 'DESIGNER', query);

      const callArgs = (mockPrisma.fabricAsset.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toMatchObject({ designerId: 'designer-1' });
    });
  });
});
