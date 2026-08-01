import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 5 GA Performance Tuning & Cross-Cloud Telemetry Audit (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    autonomousGaPerformanceTuningJob: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'job-1',
          jobCode: 'GA-TUNING-JOB-01',
          evaluatedComponent: 'DB_QUERY_INDEXING',
        },
      ]),
    },
    crossCloudTelemetryAudit: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'audit-1',
          telemetryId: 'XCLOUD-TEL-AWS-US-EAST',
          cloudProvider: 'AWS',
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

  it('GET /api/v1/autonomous-ai/ga-tuning-jobs should return GA performance tuning jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/ga-tuning-jobs')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].evaluatedComponent).toBe('DB_QUERY_INDEXING');
  });

  it('GET /api/v1/iam-security/cross-cloud-telemetry should return cross-cloud telemetry audits', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/iam-security/cross-cloud-telemetry')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].cloudProvider).toBe('AWS');
  });
});
