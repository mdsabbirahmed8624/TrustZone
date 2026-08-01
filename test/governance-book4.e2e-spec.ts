import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 4 Governance, DR & Predictive Maintenance Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    masterDataGovernanceRule: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'mdm-1',
          ruleCode: 'MDM-CUST-DEDUP-01',
          entityType: 'CUSTOMER',
        },
      ]),
    },
    disasterRecoveryAudit: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'dr-1', regionCluster: 'EU-CENTRAL-1', drillResult: 'PASSED' },
        ]),
    },
    globalSLABenchmark: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    predictiveMaintenanceSchedule: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'pm-1', predictedFailureRiskScore: 84.5, status: 'SCHEDULED' },
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

  it('GET /api/v1/enterprise-bi/mdm-rules should return master data governance rules', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/mdm-rules')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].ruleCode).toBe('MDM-CUST-DEDUP-01');
  });

  it('GET /api/v1/enterprise-bi/dr-audits should return disaster recovery audit drills', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/dr-audits')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].drillResult).toBe('PASSED');
  });

  it('GET /api/v1/autonomous-ai/predictive-maintenance should return predictive maintenance jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/predictive-maintenance')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
