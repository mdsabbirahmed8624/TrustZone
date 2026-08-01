import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 15 Book 1 — Global Multi-Cloud Sovereign Mesh E2E', () => {
  let app: INestApplication;

  const mockPrismaService = {
    globalMultiCloudSovereignMeshBook1: {
      upsert: jest.fn().mockResolvedValue({
        id: 'mesh-uuid-001',
        meshCode: 'GRID-MESH-P15-B1-01',
        cloudProvider: 'AWS_GCP_AZURE_HYBRID',
        sovereigntyRegion: 'EU_GDPR_SOVEREIGN',
        activeNodesCount: 64,
        healthScorePercent: 99.99,
        meshStatus: 'ONLINE_HEALTHY',
        lastSyncedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'mesh-uuid-001',
          meshCode: 'GRID-MESH-P15-B1-01',
          cloudProvider: 'AWS_GCP_AZURE_HYBRID',
          sovereigntyRegion: 'EU_GDPR_SOVEREIGN',
          activeNodesCount: 64,
          healthScorePercent: 99.99,
          meshStatus: 'ONLINE_HEALTHY',
          lastSyncedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    autonomousLoadBalancingGridBook1: {
      upsert: jest.fn().mockResolvedValue({
        id: 'grid-uuid-001',
        gridCode: 'GRID-BALANCER-P15-B1-01',
        trafficRps: 25000,
        latencyMs: 1.8,
        routingStrategy: 'GEO_LATENCY_SOVEREIGN_OPTIMIZED',
        balancedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'grid-uuid-001',
          gridCode: 'GRID-BALANCER-P15-B1-01',
          trafficRps: 25000,
          latencyMs: 1.8,
          routingStrategy: 'GEO_LATENCY_SOVEREIGN_OPTIMIZED',
          balancedAt: new Date(),
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

  it('GET /api/v15/global-multicloud-mesh-book1 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/global-multicloud-mesh-book1')
      .expect(200);
  });

  it('POST /api/v15/global-multicloud-mesh-book1/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/global-multicloud-mesh-book1/register')
      .send({
        meshCode: 'GRID-MESH-P15-B1-01',
        cloudProvider: 'AWS_GCP_AZURE_HYBRID',
      })
      .expect(201);
  });

  it('GET /api/v15/autonomous-load-balancing-book1 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/autonomous-load-balancing-book1')
      .expect(200);
  });

  it('POST /api/v15/autonomous-load-balancing-book1/balance should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/autonomous-load-balancing-book1/balance')
      .send({ gridCode: 'GRID-BALANCER-P15-B1-01' })
      .expect(201);
  });
});
