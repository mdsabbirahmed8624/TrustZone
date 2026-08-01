import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 5 Production GA Audit & AI Tuning (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    enterpriseSystemAudit: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'aud-1',
          auditScope: 'PHASE_12_FINAL_GA',
          complianceStatus: 'PASSED',
        },
      ]),
    },
    aIOptimizationTuning: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'tune-1',
          modelName: 'CAPACITY_MATCHING_V2',
          accuracyScore: 96.4,
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

  it('GET /api/v1/enterprise-bi/system-audits should return GA system audit logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/system-audits')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].complianceStatus).toBe('PASSED');
  });

  it('GET /api/v1/autonomous-ai/tuning should return AI model tuning list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/tuning')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].modelName).toBe('CAPACITY_MATCHING_V2');
  });
});
