import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    payment: {
      findMany: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
    financialAccount: {
      findMany: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
    },
    supplier: {
      findMany: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
    },
    customer: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    branchInventory: {
      findMany: jest.fn(),
    },
    warrantyClaim: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    warranty: {
      findMany: jest.fn(),
    },
    part: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should aggregate revenue and repair metrics correctly', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([
        { amount: 5000 },
        { amount: 3500 },
      ]);
      mockPrisma.expense.findMany.mockResolvedValue([{ amount: 1200 }]);
      mockPrisma.financialAccount.findMany.mockResolvedValue([
        { accountType: 'CASH', currentBalance: 45000 },
        { accountType: 'BANK', currentBalance: 80000 },
      ]);
      mockPrisma.invoice.findMany.mockResolvedValue([{ total: 4000 }]);
      mockPrisma.supplier.findMany.mockResolvedValue([{ dueBalance: 3200 }]);
      mockPrisma.ticket.findMany.mockResolvedValue([
        { status: 'booked' },
        { status: 'ready' },
      ]);
      mockPrisma.customer.count.mockResolvedValue(10);
      mockPrisma.user.count.mockResolvedValue(4);
      mockPrisma.branchInventory.findMany.mockResolvedValue([]);
      mockPrisma.warrantyClaim.count.mockResolvedValue(2);

      const res = await service.getDashboardStats({ dateRange: 'THIS_MONTH' });

      expect(res.revenueThisMonth).toBe(8500);
      expect(res.cashBalance).toBe(45000);
      expect(res.bankBalance).toBe(80000);
      expect(res.receivables).toBe(4000);
      expect(res.payables).toBe(3200);
      expect(res.pendingRepairs).toBe(1);
      expect(res.completedRepairs).toBe(1);
    });
  });

  describe('getTrendsForecast', () => {
    it('should calculate slope and c linear forecasts', async () => {
      const res = await service.getTrendsForecast('revenue', {});
      expect(res.historicalTrend.length).toBe(5);
      expect(res.projections.length).toBe(3);
      expect(res.projections[0].predictedValue).toBeGreaterThan(0);
    });
  });
});
