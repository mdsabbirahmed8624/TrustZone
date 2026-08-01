import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CrmService', () => {
  let service: CrmService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    ticket: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    customerCommunication: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    customerFeedback: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    loyaltyTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      aggregate: jest.fn(),
    },
    customerActivity: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('accrualPointsForPayment', () => {
    it('should award 1 point for every ৳100 spent', async () => {
      const mockCustomer = { id: 'c1', firstName: 'John', loyaltyPoints: 10 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        loyaltyPoints: 15,
      });
      mockPrismaService.loyaltyTransaction.create.mockResolvedValue({
        id: 'lt1',
      });

      const result = await service.accrualPointsForPayment('c1', 500, 'p1');

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { loyaltyPoints: { increment: 5 } },
      });
      expect(mockPrismaService.loyaltyTransaction.create).toHaveBeenCalledWith({
        data: {
          customerId: 'c1',
          pointsDelta: 5,
          remainingPoints: 5,
          type: 'EARNED',
          description: 'Points earned on invoice payment. Amount: ৳500',
          referenceId: 'p1',
        },
      });
      expect(result).toBeDefined();
    });

    it('should do nothing if payment amount is less than ৳100', async () => {
      const result = await service.accrualPointsForPayment('c1', 50);
      expect(result).toBeNull();
      expect(mockPrismaService.customer.update).not.toHaveBeenCalled();
    });
  });

  describe('redeemPoints', () => {
    it('should deduct points and allocate them to EARNED transactions in FIFO order', async () => {
      const mockCustomer = { id: 'c1', firstName: 'John', loyaltyPoints: 30 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        loyaltyPoints: 10,
      });

      const activeEarnedTx = [
        { id: 'et1', remainingPoints: 15 },
        { id: 'et2', remainingPoints: 20 },
      ];
      mockPrismaService.loyaltyTransaction.findMany.mockResolvedValue(
        activeEarnedTx,
      );

      const result = await service.redeemPoints(
        { customerId: 'c1', points: 20, description: 'Invoice Discount' },
        'staff1',
        'Admin',
      );

      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { loyaltyPoints: { decrement: 20 } },
      });

      // Deduct 15 from et1 and 5 from et2
      expect(mockPrismaService.loyaltyTransaction.update).toHaveBeenCalledWith({
        where: { id: 'et1' },
        data: { remainingPoints: { decrement: 15 } },
      });
      expect(mockPrismaService.loyaltyTransaction.update).toHaveBeenCalledWith({
        where: { id: 'et2' },
        data: { remainingPoints: { decrement: 5 } },
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if points requested exceed balance', async () => {
      const mockCustomer = { id: 'c1', firstName: 'John', loyaltyPoints: 10 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      await expect(
        service.redeemPoints({ customerId: 'c1', points: 20 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('adjustPoints', () => {
    it('should adjust balance positively and save remainingPoints for expiration tracking', async () => {
      const mockCustomer = { id: 'c1', firstName: 'John', loyaltyPoints: 10 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        loyaltyPoints: 15,
      });

      const result = await service.adjustPoints(
        { customerId: 'c1', pointsDelta: 5, description: 'Gift' },
        'staff1',
        'Admin',
      );

      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { loyaltyPoints: 15 },
      });
      expect(mockPrismaService.loyaltyTransaction.create).toHaveBeenCalledWith({
        data: {
          customerId: 'c1',
          pointsDelta: 5,
          remainingPoints: 5,
          type: 'ADJUSTED',
          description: 'Gift',
          staffId: 'staff1',
          staffName: 'Admin',
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if negative adjustment exceeds balance', async () => {
      const mockCustomer = { id: 'c1', firstName: 'John', loyaltyPoints: 10 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      await expect(
        service.adjustPoints({ customerId: 'c1', pointsDelta: -15 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('expireLoyaltyPoints', () => {
    it('should expire points older than cutoff date and record EXPIRED transaction', async () => {
      const expiredTx = [
        { id: 'et1', customerId: 'cust1', remainingPoints: 10 },
        { id: 'et2', customerId: 'cust1', remainingPoints: 15 },
      ];
      mockPrismaService.loyaltyTransaction.findMany.mockResolvedValue(
        expiredTx,
      );
      mockPrismaService.customer.update.mockResolvedValue({
        id: 'cust1',
        loyaltyPoints: 0,
      });

      const result = await service.expireLoyaltyPoints(365);

      expect(
        mockPrismaService.loyaltyTransaction.updateMany,
      ).toHaveBeenCalledWith({
        where: { id: { in: ['et1', 'et2'] } },
        data: { remainingPoints: 0 },
      });
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'cust1' },
        data: { loyaltyPoints: { decrement: 25 } },
      });
      expect(mockPrismaService.loyaltyTransaction.create).toHaveBeenCalledWith({
        data: {
          customerId: 'cust1',
          pointsDelta: -25,
          type: 'EXPIRED',
          description:
            'Expired 25 loyalty points due to inactivity period (365 days limit).',
        },
      });
      expect(result.expiredPointsCount).toBe(25);
    });
  });

  describe('getNpsSummary', () => {
    it('should aggregate promoters, passives, detectors and calculate correct NPS score', async () => {
      const feedbacks = [
        { npsScore: 10, createdAt: new Date() },
        { npsScore: 9, createdAt: new Date() },
        { npsScore: 8, createdAt: new Date() },
        { npsScore: 6, createdAt: new Date() },
        { npsScore: 4, createdAt: new Date() },
      ];
      mockPrismaService.customerFeedback.findMany.mockResolvedValue(feedbacks);
      mockPrismaService.customerFeedback.count.mockResolvedValue(5);

      const result = await service.getNpsSummary();

      // Promoters: 2 (40%)
      // Passives: 1 (20%)
      // Detractors: 2 (40%)
      // NPS Score = 40% - 40% = 0
      // Average NPS: (10+9+8+6+4)/5 = 7.4
      expect(result.promoters).toBe(2);
      expect(result.passives).toBe(1);
      expect(result.detractors).toBe(2);
      expect(result.npsScore).toBe(0);
      expect(result.averageNps).toBe(7.4);
    });
  });
});
