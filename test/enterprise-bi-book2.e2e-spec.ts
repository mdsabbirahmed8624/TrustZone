import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 2 Enterprise BI & AI Rules Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    currencyExchangeRate: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'fx-1',
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          exchangeRate: 0.92,
        },
      ]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    executiveBIForecast: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    globalConsolidatedLedger: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    autonomousAIRule: {
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
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health', 'api/v1/health', 'api/v2/(.*)'],
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/enterprise-bi/currency-rates should return exchange rates', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/currency-rates')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/v1/enterprise-bi/currency-convert should calculate conversion', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/currency-convert?amount=1000&from=USD&to=EUR')
      .expect(200);

    expect(res.body.convertedAmount).toBe(920);
  });

  it('GET /api/v1/autonomous-ai/rules should return autonomous AI rules list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/rules')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].ruleName).toBe('SLA Auto-Reassign');
  });
});
