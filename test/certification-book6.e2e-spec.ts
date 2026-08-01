import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 6 Milestone Certification & Live Telemetry Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    globalMilestoneCertification: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cert-1',
          milestoneCode: 'PHASE-12-FINAL-GA-RELEASE',
          status: 'APPROVED_AND_CERTIFIED',
        },
      ]),
    },
    liveSystemTelemetryLog: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'tel-1',
          serviceName: 'TRUSTZONE_ERP_API',
          throughputRps: 1450.0,
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

  it('GET /api/v1/enterprise-bi/certifications should return milestone release certifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/certifications')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].status).toBe('APPROVED_AND_CERTIFIED');
  });

  it('GET /api/v1/enterprise-bi/telemetry should return live system telemetry logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/telemetry')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].serviceName).toBe('TRUSTZONE_ERP_API');
  });
});
