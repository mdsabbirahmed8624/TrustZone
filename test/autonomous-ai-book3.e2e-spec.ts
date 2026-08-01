import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 3 Autonomous AI & Cluster Replication Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    crossClusterReplicationLog: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'crl-1',
          clusterId: 'cluster-us-east',
          sourceRegion: 'us-east-1',
          targetRegion: 'eu-west-1',
          status: 'HEALTHY',
        },
      ]),
    },
    aIWorkloadAllocation: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'wa-1',
          branchId: 'b-1',
          technicianId: 't-1',
          optimizationScore: 98.5,
        },
      ]),
    },
    selfHealingWorkflowIncident: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'inc-1', incidentCode: 'INC-2026-001', status: 'RESOLVED' },
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

  it('GET /api/v1/franchise/replication-status should return replication sync statuses', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/franchise/replication-status')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('GET /api/v1/autonomous-ai/workload-allocations should return workload allocations', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/workload-allocations')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/v1/autonomous-ai/incidents should return self-healing incident logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/autonomous-ai/incidents')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].incidentCode).toBe('INC-2026-001');
  });
});
