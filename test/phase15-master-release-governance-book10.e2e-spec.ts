import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 15 Book 10 — Master Platform Release & AI Governance E2E', () => {
  let app: INestApplication;

  const mockPrismaService = {
    phase15MasterPlatformReleaseBook10: {
      upsert: jest.fn().mockResolvedValue({
        id: 'p15-release-uuid-001',
        masterReleaseCode: 'P15-MASTER-RELEASE-BOOK10-01',
        overallPhase15HealthScore: 100.0,
        totalAutonomousBooksVerified: 10,
        globalMeshUptimePercent: 99.999,
        releaseStatus: 'PHASE_15_PRODUCTION_READY',
        lastVerifiedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p15-release-uuid-001',
          masterReleaseCode: 'P15-MASTER-RELEASE-BOOK10-01',
          overallPhase15HealthScore: 100.0,
          totalAutonomousBooksVerified: 10,
          globalMeshUptimePercent: 99.999,
          releaseStatus: 'PHASE_15_PRODUCTION_READY',
          lastVerifiedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    phase15AIGovernanceEthicsComplianceBook10: {
      upsert: jest.fn().mockResolvedValue({
        id: 'p15-gov-uuid-001',
        governanceRecordCode: 'AI-GOVERNANCE-P15-B10-01',
        aiSafetyPolicyAlignmentPercent: 100.0,
        modelDriftRiskIndex: 0.0,
        auditedModelsCount: 128,
        governanceStatus: 'ETHICS_COMPLIANT_CERTIFIED',
        lastAuditedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p15-gov-uuid-001',
          governanceRecordCode: 'AI-GOVERNANCE-P15-B10-01',
          aiSafetyPolicyAlignmentPercent: 100.0,
          modelDriftRiskIndex: 0.0,
          auditedModelsCount: 128,
          governanceStatus: 'ETHICS_COMPLIANT_CERTIFIED',
          lastAuditedAt: new Date(),
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

  it('GET /api/v15/phase15-master-release-book10 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/phase15-master-release-book10')
      .expect(200);
  });

  it('POST /api/v15/phase15-master-release-book10/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/phase15-master-release-book10/register')
      .send({
        masterReleaseCode: 'P15-MASTER-RELEASE-BOOK10-01',
      })
      .expect(201);
  });

  it('GET /api/v15/phase15-ai-governance-book10 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/phase15-ai-governance-book10')
      .expect(200);
  });

  it('POST /api/v15/phase15-ai-governance-book10/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/phase15-ai-governance-book10/register')
      .send({ governanceRecordCode: 'AI-GOVERNANCE-P15-B10-01' })
      .expect(201);
  });
});
