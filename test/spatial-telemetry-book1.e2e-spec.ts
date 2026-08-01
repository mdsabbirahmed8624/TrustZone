import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 14 Book 1 Spatial Telemetry Grid & Edge Mesh Node Dispatch Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    spatialTelemetryGridBook1: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p14-spatial-1',
          gridNodeCode: 'GRID-NODE-SPATIAL-01',
          spatialCoordinates: 'X:120.4,Y:85.2,Z:44.1',
          deviceDiagnosticMode: '3D_HOLOGRAM_OVERLAY',
          latencyMs: 2.4,
          gridStatus: 'SYNCHRONIZED',
        },
      ]),
      upsert: jest.fn().mockResolvedValue({
        id: 'p14-spatial-1',
        gridNodeCode: 'GRID-NODE-SPATIAL-01',
        spatialCoordinates: 'X:120.4,Y:85.2,Z:44.1',
        deviceDiagnosticMode: '3D_HOLOGRAM_OVERLAY',
        latencyMs: 2.4,
        gridStatus: 'SYNCHRONIZED',
      }),
    },
    edgeMeshNodeDispatchBook1: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p14-edge-1',
          dispatchCode: 'EDGE-DISPATCH-NODE-8801',
          edgeRegionCode: 'EDGE-US-EAST-01',
          activeMeshNodes: 64,
          throughputGbps: 120.5,
          dispatchStrategy: 'NEAREST_EDGE_LOW_LATENCY',
          operationalStatus: 'ACTIVE_OPTIMAL',
        },
      ]),
      upsert: jest.fn().mockResolvedValue({
        id: 'p14-edge-1',
        dispatchCode: 'EDGE-DISPATCH-NODE-8801',
        edgeRegionCode: 'EDGE-US-EAST-01',
        activeMeshNodes: 64,
        throughputGbps: 120.5,
        dispatchStrategy: 'NEAREST_EDGE_LOW_LATENCY',
        operationalStatus: 'ACTIVE_OPTIMAL',
      }),
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
      exclude: [
        '/',
        'health',
        'api/v1/health',
        'api/v2/(.*)',
        'api/v13/(.*)',
        'api/v14/(.*)',
      ],
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v14/spatial-telemetry-book1 should return active spatial grid nodes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v14/spatial-telemetry-book1')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].gridNodeCode).toBe('GRID-NODE-SPATIAL-01');
  });

  it('POST /api/v14/spatial-telemetry-book1/register should register grid node', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v14/spatial-telemetry-book1/register')
      .send({
        gridNodeCode: 'GRID-NODE-SPATIAL-01',
      })
      .expect(201);

    expect(res.body.gridNodeCode).toBe('GRID-NODE-SPATIAL-01');
  });

  it('GET /api/v14/edge-mesh-dispatch-book1 should return edge node dispatches', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v14/edge-mesh-dispatch-book1')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].dispatchCode).toBe('EDGE-DISPATCH-NODE-8801');
  });

  it('POST /api/v14/edge-mesh-dispatch-book1/record should record edge dispatch', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v14/edge-mesh-dispatch-book1/record')
      .send({
        dispatchCode: 'EDGE-DISPATCH-NODE-8801',
        edgeRegionCode: 'EDGE-US-EAST-01',
      })
      .expect(201);

    expect(res.body.dispatchCode).toBe('EDGE-DISPATCH-NODE-8801');
  });
});
