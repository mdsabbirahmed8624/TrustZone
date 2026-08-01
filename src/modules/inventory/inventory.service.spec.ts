import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockPart = {
    id: 'part-uuid',
    sku: 'SCRN-IPH14P',
    name: 'iPhone 14 Pro Original Screen Panel',
    category: 'Display',
    brand: 'Apple',
    brandCompatibility: 'Apple',
    basePrice: 22000.0,
    minimumStockBuffer: 4,
    branchInventory: [],
  };

  const mockPrismaService = {
    part: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    branchInventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
    },
    stockTransfer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransfer', () => {
    it('should throw BadRequestException if source stock is insufficient', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockPart);
      mockPrismaService.branchInventory.findUnique.mockResolvedValue({
        quantity: 2,
      });

      await expect(
        service.createTransfer('part-uuid', {
          fromBranchId: 'branch-1',
          toBranchId: 'branch-2',
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
