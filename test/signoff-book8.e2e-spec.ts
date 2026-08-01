import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 8 Platform Sign-Off & AI Safety Boundary Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    enterprisePlatformSignoff: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'so-1',
          releaseCode: 'TRUSTZONE-ERP-V12-FINAL',
          vpEngineeringSignoff: true,
          ctoSignoff: true,
        },
      ]),
    },
    aISafetyBoundaryVerification: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'sb-1',
          safetyCheckCode: 'SAFE-BOUND-CREDIT-LIMIT-01',
          safetyStatus: 'PASSED',
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

  it('GET /api/v1/enterprise-bi/platform-signoffs should return platform sign-off logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/platform-signoffs')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].vpEngineeringSignoff).toBe(true);
  });

  it('GET /api/v1/autonomous-ai/safety-boundaries should return AI safety boundary verification logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/safety-boundaries')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].safetyStatus).toBe('PASSED');
  });
});
