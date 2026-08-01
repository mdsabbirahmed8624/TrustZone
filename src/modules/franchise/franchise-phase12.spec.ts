import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseService } from './franchise.service';
import { EnterpriseBIService } from '../enterprise-bi/enterprise-bi.service';
import { AutonomousAIService } from '../autonomous-ai/autonomous-ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('Phase 12 Enterprise Platform Unit Tests', () => {
  let franchiseService: FranchiseService;
  let biService: EnterpriseBIService;
  let aiService: AutonomousAIService;

  const mockPrismaService = {
    franchise: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    franchiseAgreement: {
      create: jest.fn(),
    },
    franchiseSettlement: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    branch: {
      count: jest.fn(),
    },
    income: {
      aggregate: jest.fn(),
    },
    expense: {
      aggregate: jest.fn(),
    },
    sale: {
      aggregate: jest.fn(),
    },
    enterpriseBIReport: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    multiRegionConfig: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    branchInventory: {
      findMany: jest.fn(),
    },
    autonomousAIOperation: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    getStatus: jest.fn().mockReturnValue('connected'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FranchiseService,
        EnterpriseBIService,
        AutonomousAIService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    franchiseService = module.get<FranchiseService>(FranchiseService);
    biService = module.get<EnterpriseBIService>(EnterpriseBIService);
    aiService = module.get<AutonomousAIService>(AutonomousAIService);

    jest.clearAllMocks();
  });

  describe('FranchiseService', () => {
    it('should create a franchise partner successfully', async () => {
      mockPrismaService.franchise.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.franchise.create.mockResolvedValueOnce({
        id: 'franchise-1',
        name: 'TrustZone Texas Franchise',
        code: 'TZ-TX-001',
        royaltyRate: 0.05,
      });

      const res = await franchiseService.createFranchise({
        name: 'TrustZone Texas Franchise',
        code: 'TZ-TX-001',
        ownerEmail: 'owner@tz-texas.com',
        territory: 'Dallas, TX',
      });

      expect(res.code).toBe('TZ-TX-001');
      expect(mockPrismaService.franchise.create).toHaveBeenCalled();
    });

    it('should calculate monthly royalty settlement', async () => {
      mockPrismaService.franchise.findUnique.mockResolvedValueOnce({
        id: 'franchise-1',
        royaltyRate: 0.05,
      });
      mockPrismaService.franchiseSettlement.create.mockImplementation(
        ({ data }) => Promise.resolve({ id: 'set-1', ...data }),
      );

      const res = await franchiseService.calculateSettlement(
        'franchise-1',
        '2026-07',
        100000,
      );

      expect(res.royaltyAmount).toBe(5000);
      expect(res.netPayout).toBe(95000);
    });
  });

  describe('EnterpriseBIService', () => {
    it('should generate global enterprise financial rollup', async () => {
      mockPrismaService.branch.count.mockResolvedValueOnce(10);
      mockPrismaService.franchise.count.mockResolvedValueOnce(5);
      mockPrismaService.income.aggregate.mockResolvedValueOnce({
        _sum: { amount: 50000 },
      });
      mockPrismaService.expense.aggregate.mockResolvedValueOnce({
        _sum: { amount: 30000 },
      });
      mockPrismaService.sale.aggregate.mockResolvedValueOnce({
        _sum: { totalAmount: 70000 },
      });
      mockPrismaService.enterpriseBIReport.create.mockImplementation(
        ({ data }) => Promise.resolve({ id: 'report-1', ...data }),
      );

      const res = await biService.generateGlobalRollup('2026-07');

      expect(res.totalRevenue).toBe(120000);
      expect(res.netProfit).toBe(90000);
    });

    it('should generate 12-month executive forecast', async () => {
      mockPrismaService.enterpriseBIReport.findFirst.mockResolvedValueOnce({
        totalRevenue: 100000,
        totalExpense: 60000,
      });

      const forecast = await biService.getExecutiveForecast(12);

      expect(forecast.forecastHorizonMonths).toBe(12);
      expect(forecast.timeline.length).toBe(12);
      expect(forecast.timeline[0].projectedRevenue).toBeGreaterThan(100000);
    });
  });

  describe('AutonomousAIService', () => {
    it('should execute self-healing cycle for stuck tickets', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValueOnce([
        { id: 't-1', status: 'IN_PROGRESS' },
      ]);
      mockPrismaService.ticket.update.mockResolvedValueOnce({});
      mockPrismaService.autonomousAIOperation.create.mockImplementation(
        ({ data }) => Promise.resolve({ id: 'op-1', ...data }),
      );

      const res = await aiService.triggerSelfHealing();

      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: 't-1' },
        data: { status: 'PENDING_QA' },
      });
      expect(res.operationType).toBe('SELF_HEALING');
    });

    it('should trigger low-stock reordering cycle', async () => {
      mockPrismaService.branchInventory.findMany.mockResolvedValueOnce([
        { branchId: 'b-1', partId: 'p-1', quantity: 2 },
      ]);
      mockPrismaService.autonomousAIOperation.create.mockImplementation(
        ({ data }) => Promise.resolve({ id: 'op-2', ...data }),
      );

      const res = await aiService.triggerAutonomousReorder();

      expect(res.operationType).toBe('REORDER_TRIGGER');
    });
  });
});
