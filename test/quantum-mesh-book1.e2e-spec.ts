import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 1 Quantum Mesh Governance & Autonomous Robotics Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    quantumResistantMeshKey: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'qkey-1',
          keyId: 'QKEY-MESH-US-EAST-01',
          algorithm: 'CRYSTALS-Kyber-1024',
        },
      ]),
    },
    autonomousRoboticsDispatch: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'disp-1',
          dispatchId: 'DISPATCH-ROBOT-8801',
          roboticsUnitCode: 'ROBOT-AGV-04',
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

  it('GET /api/v1/iam/quantum-mesh-keys should return quantum-resistant mesh keys', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/iam/quantum-mesh-keys')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].algorithm).toBe('CRYSTALS-Kyber-1024');
  });

  it('GET /api/v1/inventory/robotics-dispatches should return robotics drone dispatches', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/inventory/robotics-dispatches')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].roboticsUnitCode).toBe('ROBOT-AGV-04');
  });
});
