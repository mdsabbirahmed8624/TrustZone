import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 15 Book 5 — Spatial Telemetry Edge Mesh & Zero-Trust Microsegmentation E2E', () => {
  let app: INestApplication;

  const mockPrismaService = {
    autonomousSpatialTelemetryEdgeMeshBook5: {
      upsert: jest.fn().mockResolvedValue({
        id: 'spatial-uuid-001',
        spatialMeshCode: 'SPATIAL-TELEMETRY-P15-B5-01',
        edgeNodeLatencyMs: 0.18,
        spatialTelemetryBandwidthGbps: 100.0,
        meshGeoRegions: 64,
        meshStatus: 'SPATIAL_ACTIVE_OPTIMAL',
        lastTelemetryAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'spatial-uuid-001',
          spatialMeshCode: 'SPATIAL-TELEMETRY-P15-B5-01',
          edgeNodeLatencyMs: 0.18,
          spatialTelemetryBandwidthGbps: 100.0,
          meshGeoRegions: 64,
          meshStatus: 'SPATIAL_ACTIVE_OPTIMAL',
          lastTelemetryAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    selfOptimizingZeroTrustMicrosegmentationBook5: {
      upsert: jest.fn().mockResolvedValue({
        id: 'microsegment-uuid-001',
        microsegmentCode: 'MICROSEGMENT-P15-B5-01',
        isolationSecurityPolicy: 'ZERO_TRUST_STRICT_ENCLAVE',
        threatMitigationSpeedMs: 45,
        complianceSecurityScore: 100.0,
        segmentStatus: 'ENCLAVE_ISOLATED_ACTIVE',
        lastPolicyEnforcedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'microsegment-uuid-001',
          microsegmentCode: 'MICROSEGMENT-P15-B5-01',
          isolationSecurityPolicy: 'ZERO_TRUST_STRICT_ENCLAVE',
          threatMitigationSpeedMs: 45,
          complianceSecurityScore: 100.0,
          segmentStatus: 'ENCLAVE_ISOLATED_ACTIVE',
          lastPolicyEnforcedAt: new Date(),
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

  it('GET /api/v15/spatial-telemetry-edgemesh-book5 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/spatial-telemetry-edgemesh-book5')
      .expect(200);
  });

  it('POST /api/v15/spatial-telemetry-edgemesh-book5/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/spatial-telemetry-edgemesh-book5/register')
      .send({
        spatialMeshCode: 'SPATIAL-TELEMETRY-P15-B5-01',
      })
      .expect(201);
  });

  it('GET /api/v15/self-optimization-microsegmentation-book5 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/self-optimization-microsegmentation-book5')
      .expect(200);
  });

  it('POST /api/v15/self-optimization-microsegmentation-book5/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/self-optimization-microsegmentation-book5/register')
      .send({ microsegmentCode: 'MICROSEGMENT-P15-B5-01' })
      .expect(201);
  });
});
