import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Enterprise Platform (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    franchise: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'f-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'f-1',
          name: 'Texas Franchise',
          code: 'TX-01',
          settlements: [],
        },
      ]),
      count: jest.fn().mockResolvedValue(5),
    },
    franchiseAgreement: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'fa-1', ...data }),
        ),
    },
    franchiseSettlement: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'fs-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({
        _sum: { grossRevenue: 100000, royaltyAmount: 5000, netPayout: 95000 },
      }),
    },
    branch: {
      count: jest.fn().mockResolvedValue(10),
    },
    income: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 50000 } }),
    },
    expense: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 30000 } }),
    },
    sale: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 70000 } }),
    },
    enterpriseBIReport: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'bi-1', ...data }),
        ),
      findFirst: jest
        .fn()
        .mockResolvedValue({ totalRevenue: 120000, totalExpense: 30000 }),
    },
    multiRegionConfig: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'mr-1', ...create }),
        ),
    },
    ticket: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
    },
    branchInventory: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    autonomousAIOperation: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'op-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(10),
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

  it('GET /api/v1/franchise should return list of franchises', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/franchise')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/v1/enterprise-bi/forecast should return executive forecast timeline', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/forecast?months=6')
      .expect(200);

    expect(res.body.forecastHorizonMonths).toBe(6);
    expect(Array.isArray(res.body.timeline)).toBe(true);
  });

  it('GET /api/v1/autonomous-ai/summary should return AI autonomous operations status', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/summary')
      .expect(200);

    expect(res.body.status).toBe('ACTIVE');
  });
});
