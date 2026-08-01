import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 4 — Supply-Chain Predictor & Quantum Identity Mesh Engine (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v14/supply-chain-predictor-book4 — should return list of predictions', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/supply-chain-predictor-book4')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/supply-chain-predictor-book4/predict — should predict demand', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/supply-chain-predictor-book4/predict')
      .send({
        predictionCode: 'SC-PRED-P14-B4-01',
        partCategory: 'OLED_DISPLAY_ASSEMBLIES',
        predictedDemandQuantity: 450,
        reorderConfidenceScore: 0.985,
        replenishmentStatus: 'AUTO_REORDER_TRIGGERED',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.predictionCode).toBe('SC-PRED-P14-B4-01');
  });

  it('GET /api/v14/quantum-identity-mesh-book4 — should return list of identities', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/quantum-identity-mesh-book4')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/quantum-identity-mesh-book4/verify — should verify node identity', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/quantum-identity-mesh-book4/verify')
      .send({
        didIdentifier: 'did:trustzone:quantum:mesh:node-8801',
        meshNodeRole: 'EDGE_TELEMETRY_ROUTER',
        cryptographicPublicKey: '0x04f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        verificationStatus: 'AUTHENTICATED_ACTIVE',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.didIdentifier).toBe(
      'did:trustzone:quantum:mesh:node-8801',
    );
  });
});
