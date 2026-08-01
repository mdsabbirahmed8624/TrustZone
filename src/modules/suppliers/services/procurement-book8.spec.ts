import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProcurementRequestService } from './procurement-request.service';
import { ProcurementValidationService } from './procurement-validation.service';
import { SupplierPerformanceService } from './supplier-performance.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Procurement Book 8 Services', () => {
  let requestService: ProcurementRequestService;
  let validationService: ProcurementValidationService;
  let performanceService: SupplierPerformanceService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    $queryRaw: jest.fn(),
    purchaseRequest: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    purchaseOrder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    purchaseOrderItem: {
      update: jest.fn(),
    },
    purchaseReceiving: {
      create: jest.fn(),
    },
    inventoryItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    inventoryBatch: {
      create: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    supplier: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcurementRequestService,
        ProcurementValidationService,
        SupplierPerformanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    requestService = module.get<ProcurementRequestService>(
      ProcurementRequestService,
    );
    validationService = module.get<ProcurementValidationService>(
      ProcurementValidationService,
    );
    performanceService = module.get<SupplierPerformanceService>(
      SupplierPerformanceService,
    );
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('ProcurementRequestService - Workflow', () => {
    it('should transition status from PENDING_MANAGER to APPROVED_MANAGER', async () => {
      mockPrisma.purchaseRequest.findFirst.mockResolvedValue({
        id: 'pr-1',
        status: 'PENDING_MANAGER',
        branchId: 'branch-1',
        partId: 'part-1',
        quantity: 5,
        isDeleted: false,
      });

      mockPrisma.purchaseRequest.update.mockResolvedValue({
        id: 'pr-1',
        status: 'APPROVED_MANAGER',
      });

      const res = await requestService.approveRequest(
        'pr-1',
        'approver-1',
        'MANAGER',
      );
      expect(res.status).toBe('APPROVED_MANAGER');
      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith({
        where: { id: 'pr-1' },
        data: expect.objectContaining({
          status: 'APPROVED_MANAGER',
          managerApprovedById: 'approver-1',
        }),
        include: { part: true },
      });
    });

    it('should auto-generate DRAFT PO when approved by FINANCE', async () => {
      mockPrisma.purchaseRequest.findFirst.mockResolvedValue({
        id: 'pr-1',
        status: 'APPROVED_PROCUREMENT',
        branchId: 'branch-1',
        partId: 'part-1',
        quantity: 5,
        isDeleted: false,
      });

      mockPrisma.purchaseRequest.update.mockResolvedValue({
        id: 'pr-1',
        status: 'ORDERED',
        branchId: 'branch-1',
        partId: 'part-1',
        quantity: 5,
        part: {
          id: 'part-1',
          supplierId: 'supp-1',
          basePrice: 150.0,
        },
      });
      mockPrisma.purchaseOrder.create.mockResolvedValue({ id: 'po-1' });

      await requestService.approveRequest('pr-1', 'approver-3', 'FINANCE');

      expect(mockPrisma.purchaseOrder.create).toHaveBeenCalled();
      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pr-1' },
          data: expect.objectContaining({ status: 'ORDERED' }),
        }),
      );
    });
  });

  describe('ProcurementValidationService - Over-receiving Prevention', () => {
    it('should throw BadRequestException if receiving quantity exceeds ordered quantity', async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue({
        id: 'po-1',
        status: 'APPROVED',
        items: [
          {
            id: 'po-item-1',
            partId: 'part-1',
            quantity: 10,
            quantityReceived: 8,
            unitCost: 150.0,
          },
        ],
      });

      await expect(
        validationService.validateAndReceiveGoods('po-1', 'wh-1', 'user-1', [
          {
            itemId: 'po-item-1',
            quantityReceived: 3, // 8 + 3 = 11 > 10
          },
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('SupplierPerformanceService - Score Card', () => {
    it('should calculate supplier metrics correctly', async () => {
      mockPrisma.supplier.findFirst.mockResolvedValue({
        id: 'supp-1',
        name: 'Supplier A',
        rating: 4.5,
        purchaseOrders: [
          {
            id: 'po-1',
            status: 'RECEIVED',
            createdAt: new Date('2026-07-01T12:00:00.000Z'),
            purchaseReceivings: [
              { createdAt: new Date('2026-07-03T12:00:00.000Z') },
            ], // 2 days
          },
        ],
        supplierRmas: [],
        isDeleted: false,
      });

      const metrics = await performanceService.getSupplierPerformance('supp-1');
      expect(metrics.averageDeliveryTimeDays).toBe(2);
      expect(metrics.returnRatePercent).toBe(0);
      expect(metrics.performanceScore).toBeGreaterThan(0);
    });
  });
});
