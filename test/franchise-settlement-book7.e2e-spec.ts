import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 7 Franchise Royalty Settlement & AI Self-Optimization (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    franchiseRoyaltySettlementBook7: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'settle-1',
          settlementCode: 'SETTLE-FRAN-2026-Q3-01',
          netRoyaltyAmount: 12500.0,
        },
      ]),
    },
    autonomousSelfOptimizationAnalyticsBook7: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'opt-1',
          optimizationCode: 'OPT-ANALYTICS-LLM-01',
          targetModel: 'LLM_INFERENCE_ENGINE',
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

  it('GET /api/v1/franchise/royalty-settlements-book7 should return royalty settlements', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/franchise/royalty-settlements-book7')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].netRoyaltyAmount).toBe(12500.0);
  });

  it('GET /api/v1/autonomous-ai/self-optimization-book7 should return self-optimization analytics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/self-optimization-book7')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].targetModel).toBe('LLM_INFERENCE_ENGINE');
  });
});
