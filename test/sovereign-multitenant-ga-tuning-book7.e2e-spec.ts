import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 15 Book 7 — Sovereign Multi-Tenant & Cross-Cloud GA Tuning E2E', () => {
  let app: INestApplication;

  const mockPrismaService = {
    sovereignMultiTenantMicrosegmentationBook7: {
      upsert: jest.fn().mockResolvedValue({
        id: 'tenant-uuid-001',
        tenantSegmentCode: 'TENANT-SEGMENT-P15-B7-01',
        tenantEnclaveIsolationScore: 100.0,
        tenantCrossNoiseLeakagePercent: 0.0,
        tenantActiveCount: 256,
        segmentStatus: 'TENANT_ISOLATED_STRICT',
        lastIsolatedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'tenant-uuid-001',
          tenantSegmentCode: 'TENANT-SEGMENT-P15-B7-01',
          tenantEnclaveIsolationScore: 100.0,
          tenantCrossNoiseLeakagePercent: 0.0,
          tenantActiveCount: 256,
          segmentStatus: 'TENANT_ISOLATED_STRICT',
          lastIsolatedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    globalCrossCloudGATuningGridBook7: {
      upsert: jest.fn().mockResolvedValue({
        id: 'crosscloud-uuid-001',
        crossCloudTuningCode: 'CROSSCLOUD-GA-P15-B7-01',
        crossCloudSyncLatencyMs: 0.95,
        geneticAlgorithmFitnessScore: 99.97,
        supportedCloudProviders: 5,
        gridStatus: 'CROSSCLOUD_OPTIMAL_ACTIVE',
        lastGAOptimizationAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'crosscloud-uuid-001',
          crossCloudTuningCode: 'CROSSCLOUD-GA-P15-B7-01',
          crossCloudSyncLatencyMs: 0.95,
          geneticAlgorithmFitnessScore: 99.97,
          supportedCloudProviders: 5,
          gridStatus: 'CROSSCLOUD_OPTIMAL_ACTIVE',
          lastGAOptimizationAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v15/sovereign-multitenant-book7 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/sovereign-multitenant-book7')
      .expect(200);
  });

  it('POST /api/v15/sovereign-multitenant-book7/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/sovereign-multitenant-book7/register')
      .send({
        tenantSegmentCode: 'TENANT-SEGMENT-P15-B7-01',
      })
      .expect(201);
  });

  it('GET /api/v15/ga-tuning-crosscloud-book7 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/ga-tuning-crosscloud-book7')
      .expect(200);
  });

  it('POST /api/v15/ga-tuning-crosscloud-book7/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/ga-tuning-crosscloud-book7/register')
      .send({ crossCloudTuningCode: 'CROSSCLOUD-GA-P15-B7-01' })
      .expect(201);
  });
});
