import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 15 Book 3 — Sovereign Quantum Identity & Neuromorphic Edge Diagnostics E2E', () => {
  let app: INestApplication;

  const mockPrismaService = {
    sovereignQuantumIdentityFederationBook3: {
      upsert: jest.fn().mockResolvedValue({
        id: 'identity-uuid-001',
        identityCode: 'DID-SOVEREIGN-P15-B3-01',
        quantumAlgorithm: 'CRYSTALS_DILITHIUM_KYBER',
        identityProvider: 'TRUSTZONE_SOVEREIGN_IDP',
        verifiableCredentialCount: 4500,
        identityStatus: 'VERIFIED_ACTIVE',
        lastAuthenticatedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'identity-uuid-001',
          identityCode: 'DID-SOVEREIGN-P15-B3-01',
          quantumAlgorithm: 'CRYSTALS_DILITHIUM_KYBER',
          identityProvider: 'TRUSTZONE_SOVEREIGN_IDP',
          verifiableCredentialCount: 4500,
          identityStatus: 'VERIFIED_ACTIVE',
          lastAuthenticatedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    neuromorphicEdgeDiagnosticsMeshBook3: {
      upsert: jest.fn().mockResolvedValue({
        id: 'neuro-uuid-001',
        meshNodeCode: 'NEURO-EDGE-NODE-P15-B3-01',
        spikeNeuralLatencyMs: 0.42,
        diagnosticAccuracyPercent: 99.98,
        hardwareAcceleratedEngine: 'TENSOR_NEUROMORPHIC_NPU',
        meshStatus: 'ACTIVE_HEALTHY',
        lastDiagnosedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'neuro-uuid-001',
          meshNodeCode: 'NEURO-EDGE-NODE-P15-B3-01',
          spikeNeuralLatencyMs: 0.42,
          diagnosticAccuracyPercent: 99.98,
          hardwareAcceleratedEngine: 'TENSOR_NEUROMORPHIC_NPU',
          meshStatus: 'ACTIVE_HEALTHY',
          lastDiagnosedAt: new Date(),
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

  it('GET /api/v15/sovereign-quantum-identity-book3 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/sovereign-quantum-identity-book3')
      .expect(200);
  });

  it('POST /api/v15/sovereign-quantum-identity-book3/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/sovereign-quantum-identity-book3/register')
      .send({
        identityCode: 'DID-SOVEREIGN-P15-B3-01',
        quantumAlgorithm: 'CRYSTALS_DILITHIUM_KYBER',
      })
      .expect(201);
  });

  it('GET /api/v15/neuromorphic-edge-diagnostics-book3 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/neuromorphic-edge-diagnostics-book3')
      .expect(200);
  });

  it('POST /api/v15/neuromorphic-edge-diagnostics-book3/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/neuromorphic-edge-diagnostics-book3/register')
      .send({ meshNodeCode: 'NEURO-EDGE-NODE-P15-B3-01' })
      .expect(201);
  });
});
