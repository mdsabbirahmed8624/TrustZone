import { Test, TestingModule } from '@nestjs/testing';
import { KPIEngineService } from './kpi-engine.service';
import { ForecastService } from './forecast.service';
import { AlertAnalyticsService } from './alert-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Analytics Book 9 Services', () => {
  let kpiService: KPIEngineService;
  let forecastService: ForecastService;
  let alertService: AlertAnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    ticket: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    inventoryMovement: {
      count: jest.fn(),
    },
    kPIConfiguration: {
      upsert: jest.fn(),
    },
    forecastHistory: {
      create: jest.fn(),
    },
    alertAnalytics: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KPIEngineService,
        ForecastService,
        AlertAnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    kpiService = module.get<KPIEngineService>(KPIEngineService);
    forecastService = module.get<ForecastService>(ForecastService);
    alertService = module.get<AlertAnalyticsService>(AlertAnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('KPIEngineService', () => {
    it('should calculate SLA compliance and First Time Fix Rate correctly', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          status: 'ready',
          createdAt: new Date('2026-07-01T12:00:00.000Z'),
          ticketHistory: [
            {
              createdAt: new Date('2026-07-01T14:00:00.000Z'),
              notes: 'diagnosing started',
            },
            {
              createdAt: new Date('2026-07-01T16:00:00.000Z'),
              notes: 'status changed to ready',
            },
          ],
        },
      ];

      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets);
      mockPrisma.inventoryMovement.count.mockResolvedValue(2);

      const res = await kpiService.calculateKPIs();
      expect(res.firstTimeFixRatePercent).toBe(100.0);
      expect(res.SLAComplianceRatePercent).toBe(100.0);
      expect(res.averageRepairTimeHours).toBe(2.0);
    });
  });

  describe('ForecastService', () => {
    it('should generate slope projections using historical data series', async () => {
      mockPrisma.forecastHistory.create.mockResolvedValue({
        id: 'forecast-1',
        createdAt: new Date(),
      });

      const res = await forecastService.generateForecast('REVENUE');
      expect(res).toHaveProperty('projectedSeries');
      expect(res.projectedSeries.length).toBe(3);
      // Slope check: [12000, 15000, 14000, 16500, 19000, 18500] has a positive trend
      expect(res.projectedSeries[0]).toBeGreaterThan(18000);
    });
  });

  describe('AlertAnalyticsService', () => {
    it('should trigger backlog warning if ticket backlog exceeds threshold', async () => {
      mockPrisma.ticket.count.mockResolvedValue(60); // threshold is 50
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.alertAnalytics.create.mockImplementation(({ data }) => ({
        id: 'alert-1',
        ...data,
      }));

      const res = await alertService.runAnomaliesSweep();
      expect(res.triggeredAlertsCount).toBe(1);
      expect(res.alerts[0].alertType).toBe('BACKLOG_WARNING');
    });
  });
});
