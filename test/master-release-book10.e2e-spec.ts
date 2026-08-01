import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 10 Master ERP Release & AI Ethics Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    masterERPReleaseCertification: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'm-1',
          masterReleaseCode: 'TRUSTZONE-ERP-MASTER-GA-RELEASE',
          totalBooksCompleted: 10,
        },
      ]),
    },
    aIGovernanceEthicsAudit: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'eth-1',
          policyCode: 'ETHICS-POL-AI-01',
          auditStatus: 'COMPLIANT',
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

  it('GET /api/v1/enterprise-bi/master-certifications should return master ERP release certifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/master-certifications')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].totalBooksCompleted).toBe(10);
  });

  it('GET /api/v1/autonomous-ai/ethics-audits should return AI ethics audit scorecards', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/ethics-audits')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].auditStatus).toBe('COMPLIANT');
  });
});
