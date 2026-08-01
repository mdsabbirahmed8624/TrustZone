import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 9 Milestone Completion Certificates & AI Model Drift Monitoring (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    milestoneCompletionCertificateBook9: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cert-1',
          certificateCode: 'CERT-P13-MILESTONE-09',
          certificationStatus: 'PASSED_CERTIFIED',
        },
      ]),
    },
    aiModelDriftMonitoringBook9: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'drift-1',
          monitoringCode: 'DRIFT-MONITOR-LLM-01',
          targetModel: 'AUTONOMOUS_SWARM_HEALER',
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

  it('GET /api/v1/enterprise-bi/milestone-certificates-book9 should return milestone certificates', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/milestone-certificates-book9')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].certificationStatus).toBe('PASSED_CERTIFIED');
  });

  it('GET /api/v1/autonomous-ai/model-drifts-book9 should return model drift audits', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/model-drifts-book9')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].targetModel).toBe('AUTONOMOUS_SWARM_HEALER');
  });
});
