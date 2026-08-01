import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 8 Executive Release Sign-off & AI Safety Boundary Verification (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    executiveSignoffBook8: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'signoff-1',
          signoffCode: 'SIGNOFF-P13-B8-EXEC-01',
          approvalStatus: 'APPROVED',
        },
      ]),
    },
    aiSafetyBoundaryBook8: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'safety-1',
          verificationCode: 'SAFETY-VERIFY-LLM-01',
          targetModel: 'AUTONOMOUS_REPAIR_ADVISOR',
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

  it('GET /api/v1/enterprise-bi/executive-signoffs-book8 should return executive sign-offs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/enterprise-bi/executive-signoffs-book8')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].approvalStatus).toBe('APPROVED');
  });

  it('GET /api/v1/autonomous-ai/safety-boundaries-book8 should return safety boundary verifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/safety-boundaries-book8')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].targetModel).toBe('AUTONOMOUS_REPAIR_ADVISOR');
  });
});
