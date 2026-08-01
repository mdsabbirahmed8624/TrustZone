import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReservationService } from './inventory-reservation.service';
import { InventoryAlertService } from './inventory-alert-dashboard.service';
import { InventorySyncService } from './inventory-sync.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Inventory Book 7 Services', () => {
  let reservationService: ReservationService;
  let alertService: InventoryAlertService;
  let syncService: InventorySyncService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    $queryRaw: jest.fn(),
    inventoryItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    inventoryReservation: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    inventoryBatch: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    inventoryAlert: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    inventoryAuditLog: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        InventoryAlertService,
        InventorySyncService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    alertService = module.get<InventoryAlertService>(InventoryAlertService);
    syncService = module.get<InventorySyncService>(InventorySyncService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('ReservationService - reserveParts', () => {
    it('should reserve parts successfully if stock is available', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'item-123', quantity: 10, version: 1 },
      ]);
      mockPrisma.inventoryReservation.findMany.mockResolvedValue([]);
      mockPrisma.inventoryItem.update.mockResolvedValue({
        id: 'item-123',
        version: 2,
      });
      mockPrisma.inventoryReservation.create.mockResolvedValue({
        id: 'res-456',
      });

      const res = await reservationService.reserveParts({
        warehouseId: 'wh-1',
        partId: 'part-1',
        ticketId: 'ticket-1',
        technicianId: 'tech-1',
        quantity: 5,
      });

      expect(res).toBeDefined();
      expect(mockPrisma.inventoryReservation.create).toHaveBeenCalled();
      expect(mockPrisma.inventoryMovement.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if available stock is insufficient', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'item-123', quantity: 4, version: 1 },
      ]);
      mockPrisma.inventoryReservation.findMany.mockResolvedValue([]);

      await expect(
        reservationService.reserveParts({
          warehouseId: 'wh-1',
          partId: 'part-1',
          ticketId: 'ticket-1',
          technicianId: 'tech-1',
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('ReservationService - consumeReservedParts (FIFO)', () => {
    it('should deduct from batches in FIFO order', async () => {
      mockPrisma.inventoryReservation.findFirst.mockResolvedValue({
        id: 'res-456',
        inventoryItemId: 'item-123',
        quantity: 5,
        status: 'PENDING',
        ticketId: 'ticket-1',
      });
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'item-123', quantity: 10, version: 1 },
      ]);
      // Mock two FIFO batches: LOT-A (3 units), LOT-B (5 units)
      mockPrisma.inventoryBatch.findMany.mockResolvedValue([
        { id: 'batch-A', quantity: 3, receivedAt: new Date('2026-01-01') },
        { id: 'batch-B', quantity: 5, receivedAt: new Date('2026-02-01') },
      ]);

      mockPrisma.inventoryItem.update.mockResolvedValue({ quantity: 5 });

      await reservationService.consumeReservedParts('res-456', 'user-1');

      // Oldest batch (batch-A) should be completely deleted since reservation wants 5 units
      expect(mockPrisma.inventoryBatch.delete).toHaveBeenCalledWith({
        where: { id: 'batch-A' },
      });
      // Second batch (batch-B) should be decremented by 2 units
      expect(mockPrisma.inventoryBatch.update).toHaveBeenCalledWith({
        where: { id: 'batch-B' },
        data: { quantity: { decrement: 2 } },
      });
    });
  });

  describe('InventoryAlertService - runAlertSweeper', () => {
    it('should create LOW_STOCK alerts if quantity is below minimum stock buffer', async () => {
      mockPrisma.inventoryItem.findMany.mockResolvedValue([
        {
          id: 'item-123',
          quantity: 2,
          part: {
            id: 'part-1',
            name: 'Part A',
            sku: 'SKU-A',
            minimumStockBuffer: 5,
          },
          batches: [],
        },
      ]);
      mockPrisma.inventoryAlert.findFirst.mockResolvedValue(null);

      await alertService.runAlertSweeper();

      expect(mockPrisma.inventoryAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          alertType: 'LOW_STOCK',
        }),
      });
    });
  });

  describe('InventorySyncService - syncOfflineMovements (LWW)', () => {
    it('should apply offline updates if client timestamp is newer than server updatedAt', async () => {
      mockPrisma.inventoryAuditLog.findFirst.mockResolvedValue(null);
      mockPrisma.inventoryItem.findUnique.mockResolvedValue({
        id: 'item-123',
        quantity: 10,
        version: 1,
        updatedAt: new Date('2026-07-16T12:00:00.000Z'),
      });

      const results = await syncService.syncOfflineMovements([
        {
          id: 'scan-1',
          inventoryItemId: 'item-123',
          quantityDelta: -2,
          timestamp: '2026-07-16T13:00:00.000Z', // newer
          userId: 'user-1',
        },
      ]);

      expect(results[0].status).toBe('SUCCESS');
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalled();
    });

    it('should skip updates if client timestamp is older than server updatedAt', async () => {
      mockPrisma.inventoryAuditLog.findFirst.mockResolvedValue(null);
      mockPrisma.inventoryItem.findUnique.mockResolvedValue({
        id: 'item-123',
        quantity: 10,
        version: 1,
        updatedAt: new Date('2026-07-16T14:00:00.000Z'),
      });

      const results = await syncService.syncOfflineMovements([
        {
          id: 'scan-1',
          inventoryItemId: 'item-123',
          quantityDelta: -2,
          timestamp: '2026-07-16T13:00:00.000Z', // older
          userId: 'user-1',
        },
      ]);

      expect(results[0].status).toBe('SKIPPED');
    });
  });
});
