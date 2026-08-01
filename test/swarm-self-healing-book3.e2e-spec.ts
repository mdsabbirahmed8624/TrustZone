import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 3 AI Swarm Self-Healing Engine & Zero-Trust Micro-Segmentation (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    swarmSelfHealingAgent: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'agent-1',
          agentCode: 'SWARM-AGENT-RECOVERY-01',
          targetService: 'PAYMENT_GATEWAY_V2',
        },
      ]),
    },
    zeroTrustMicroSegmentationPolicy: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'pol-1',
          policyId: 'ZTRUST-SEG-PAY-TO-DB',
          workloadGroup: 'FINANCE_CORE',
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

  it('GET /api/v1/autonomous-ai/swarm-agents should return self-healing swarm agents', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/swarm-agents')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].agentCode).toBe('SWARM-AGENT-RECOVERY-01');
  });

  it('GET /api/v1/iam-security/micro-segmentation-policies should return micro-segmentation policies', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/iam-security/micro-segmentation-policies')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].workloadGroup).toBe('FINANCE_CORE');
  });
});
