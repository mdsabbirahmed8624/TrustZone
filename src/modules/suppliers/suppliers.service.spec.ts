import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: PrismaService;

  const mockSupplier = {
    id: 'supplier-uuid',
    name: 'Dhaka Parts Plaza Ltd.',
    email: 'sales@dhakapartsplaza.com',
    phone: '01912998877',
    rating: 4.8,
    ledger: [],
  };

  const mockPrismaService = {
    supplier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    supplierLedger: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    purchaseOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    financialAccount: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: FinanceService,
          useValue: {
            recordPOReceiptJournal: jest.fn().mockResolvedValue({}),
            paySupplier: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query and return suppliers list', async () => {
      mockPrismaService.supplier.findMany.mockResolvedValue([mockSupplier]);

      const result = await service.findAll();
      expect(prisma.supplier.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
