import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 9 Milestone Completion & AI Model Drift Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    milestoneCompletionCertificate: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cert-1',
          certificateCode: 'CERT-PHASE-12-COMPLETE',
          completedBooksCount: 9,
        },
      ]),
    },
    aIModelDriftMonitoring: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'drift-1',
          modelName: 'REV_PREDICT_V2',
          conceptDriftScore: 0.08,
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

  it('GET /api/v1/enterprise-bi/milestone-certificates should return milestone certificates', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/milestone-certificates')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].completedBooksCount).toBe(9);
  });

  it('GET /api/v1/autonomous-ai/model-drifts should return model drift scorecards', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/model-drifts')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].modelName).toBe('REV_PREDICT_V2');
  });
});
