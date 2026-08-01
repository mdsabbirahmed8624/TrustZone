import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 10 Master Platform Release & AI Governance Ethics Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    masterPlatformReleaseCertificationBook10: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p13-m-1',
          masterReleaseCode: 'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
          versionTag: 'v13.10.0-book10-final',
          phaseTitle: 'PHASE_13_QUANTUM_RESISTANT_ENTERPRISE_ERP',
          totalBooksCompleted: 10,
          productionGAApproved: true,
          certifiedBy: 'GLOBAL_EXECUTIVE_BOARD',
        },
      ]),
      upsert: jest.fn().mockResolvedValue({
        id: 'p13-m-1',
        masterReleaseCode: 'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
        versionTag: 'v13.10.0-book10-final',
        phaseTitle: 'PHASE_13_QUANTUM_RESISTANT_ENTERPRISE_ERP',
        totalBooksCompleted: 10,
        productionGAApproved: true,
        certifiedBy: 'GLOBAL_EXECUTIVE_BOARD',
      }),
    },
    aiGovernanceEthicsComplianceBook10: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p13-eth-1',
          policyCode: 'ETHICS-P13-POLICY-01',
          policyTitle: 'RESPONSIBLE_AI_DEPLOYMENT_CHARTER',
          complianceScorePercent: 99.5,
          auditStatus: 'COMPLIANT',
          auditedByRole: 'CHIEF_AI_ETHICS_OFFICER',
        },
      ]),
      upsert: jest.fn().mockResolvedValue({
        id: 'p13-eth-1',
        policyCode: 'ETHICS-P13-POLICY-01',
        policyTitle: 'RESPONSIBLE_AI_DEPLOYMENT_CHARTER',
        complianceScorePercent: 99.5,
        auditStatus: 'COMPLIANT',
        auditedByRole: 'CHIEF_AI_ETHICS_OFFICER',
      }),
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
      exclude: ['/', 'health', 'api/v1/health', 'api/v2/(.*)', 'api/v13/(.*)'],
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v13/master-platform-release-book10 should return master platform release certifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v13/master-platform-release-book10')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].totalBooksCompleted).toBe(10);
    expect(res.body[0].masterReleaseCode).toBe(
      'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
    );
  });

  it('POST /api/v13/master-platform-release-book10/certify should issue release certification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v13/master-platform-release-book10/certify')
      .send({
        masterReleaseCode: 'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
      })
      .expect(201);

    expect(res.body.masterReleaseCode).toBe(
      'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
    );
  });

  it('GET /api/v13/ai-governance-ethics-book10 should return AI ethics compliance audits', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v13/ai-governance-ethics-book10')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].auditStatus).toBe('COMPLIANT');
  });

  it('POST /api/v13/ai-governance-ethics-book10/audit should audit ethics policy', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v13/ai-governance-ethics-book10/audit')
      .send({
        policyCode: 'ETHICS-P13-POLICY-01',
        policyTitle: 'RESPONSIBLE_AI_DEPLOYMENT_CHARTER',
        complianceScorePercent: 99.5,
      })
      .expect(201);

    expect(res.body.auditStatus).toBe('COMPLIANT');
  });
});
