import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 2 Sovereign Data Residency & Federated AI Learning Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    sovereignDataResidencyPolicy: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'res-1',
          policyCode: 'RESIDENCY-EU-GERMANY-01',
          jurisdictionCountry: 'DE',
        },
      ]),
    },
    federatedLearningJob: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'fed-1',
          jobId: 'FED-JOB-REPAIR-V4',
          modelName: 'DIAGNOSTIC_NN_PRIVACY_V4',
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

  it('GET /api/v1/integrations/sovereign-residency-policies should return data residency policies', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/integrations/sovereign-residency-policies')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].jurisdictionCountry).toBe('DE');
  });

  it('GET /api/v1/autonomous-ai/federated-learning-jobs should return federated learning jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/federated-learning-jobs')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].modelName).toBe('DIAGNOSTIC_NN_PRIVACY_V4');
  });
});
