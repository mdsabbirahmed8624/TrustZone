import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseBIBook2Service } from './services/enterprise-bi-book2.service';
import { AutonomousAIBook2Service } from '../autonomous-ai/services/autonomous-ai-book2.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 2 Unit Tests (Enterprise BI & Autonomous AI Rules)', () => {
  let biService: EnterpriseBIBook2Service;
  let aiService: AutonomousAIBook2Service;

  const mockPrisma = {
    currencyExchangeRate: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    income: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 50000 } }),
    },
    expense: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 20000 } }),
    },
    sale: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 70000 } }),
    },
    executiveBIForecast: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'fc-1', ...data }),
        ),
      findMany: jest.fn(),
    },
    globalConsolidatedLedger: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'gcl-1', ...data }),
        ),
      findMany: jest.fn(),
    },
    autonomousAIRule: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'r-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'r-1',
          ruleName: 'SLA Auto-Reassign',
          triggerCondition: 'TICKET_SLA_BREACH',
          actionType: 'SELF_HEAL_QUEUE',
          isEnabled: true,
          priority: 1,
        },
      ]),
      update: jest.fn(),
    },
    autonomousAIOperation: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'op-1', ...data }),
        ),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseBIBook2Service,
        AutonomousAIBook2Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    biService = module.get<EnterpriseBIBook2Service>(EnterpriseBIBook2Service);
    aiService = module.get<AutonomousAIBook2Service>(AutonomousAIBook2Service);
    jest.clearAllMocks();
  });

  it('should convert currency with fallback rate', async () => {
    const res = await biService.convertCurrency(100, 'USD', 'EUR');
    expect(res.convertedAmount).toBe(92);
    expect(res.exchangeRate).toBe(0.92);
  });

  it('should generate predictive revenue and EBITDA forecast', async () => {
    const forecast = await biService.generatePredictiveForecast({
      forecastPeriod: '2026-Q4',
      growthRateMultiplier: 1.1,
    });
    expect(forecast.forecastPeriod).toBe('2026-Q4');
    expect(forecast.projectedRevenue).toBeGreaterThan(100000);
  });

  it('should consolidate global ledger entry', async () => {
    const ledger = await biService.consolidateGlobalLedger({
      ledgerPeriod: '2026-07',
      tenantCode: 'HQ',
      accountCategory: 'REVENUE',
      totalDebit: 50000,
      totalCredit: 10000,
    });

    expect(ledger.netBalance).toBe(40000);
  });

  it('should evaluate active autonomous AI rules and log audit executions', async () => {
    mockPrisma.autonomousAIRule.findMany.mockResolvedValueOnce([
      {
        id: 'r-1',
        ruleName: 'SLA Auto-Reassign',
        triggerCondition: 'TICKET_SLA_BREACH',
        actionType: 'SELF_HEAL_QUEUE',
        isEnabled: true,
        priority: 1,
      },
    ]);

    const res = await aiService.evaluateAndExecuteRules();
    expect(res.evaluatedRuleCount).toBe(1);
    expect(res.executions[0].status).toBe('COMPLETED');
  });
});
