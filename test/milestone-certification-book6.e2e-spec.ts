import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 6 Global Milestone Certification & Live Telemetry Stream Audit (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    globalMilestoneCertificationBook6: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cert-1',
          certCode: 'CERT-P13-B6-GA-01',
          phaseBookTitle: 'PHASE_13_BOOK_6_ENTERPRISE_GA',
        },
      ]),
    },
    liveTelemetryStreamAuditBook6: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'stream-1',
          streamId: 'STREAM-AUDIT-IAM-01',
          sourceService: 'IAM_SECURITY_SERVICE',
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

  it('GET /api/v1/system-audit/milestone-certifications-book6 should return milestone certifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/system-audit/milestone-certifications-book6')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].phaseBookTitle).toBe('PHASE_13_BOOK_6_ENTERPRISE_GA');
  });

  it('GET /api/v1/system-audit/live-telemetry-streams-book6 should return live telemetry stream audits', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/system-audit/live-telemetry-streams-book6')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].sourceService).toBe('IAM_SECURITY_SERVICE');
  });
});
