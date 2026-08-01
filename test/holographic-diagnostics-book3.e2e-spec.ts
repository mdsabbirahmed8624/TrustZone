import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 3 — Holographic Diagnostics & Quantum Edge Security Policy Engine (E2E)', () => {
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

  it('GET /api/v14/holographic-diagnostics-book3 — should return list of diagnostic sessions', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/holographic-diagnostics-book3')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/holographic-diagnostics-book3/start — should start holographic session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/holographic-diagnostics-book3/start')
      .send({
        sessionCode: 'HOLO-DIAG-P14-B3-01',
        hologramResolution: '8K_SPATIAL_VOXEL',
        spatialTrackingFps: 120,
        thermalInfraredDeltaC: 4.2,
        diagnosticStatus: 'ACTIVE_STREAMING',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.sessionCode).toBe('HOLO-DIAG-P14-B3-01');
  });

  it('GET /api/v14/quantum-edge-security-book3 — should return list of security policies', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/quantum-edge-security-book3')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/quantum-edge-security-book3/enforce — should enforce quantum security policy', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/quantum-edge-security-book3/enforce')
      .send({
        policyCode: 'Q-EDGE-POL-1403',
        encryptionAlgorithm: 'CRYPTONIGHT_LITHIUM_ML_KEM',
        enforcementScope: 'GLOBAL_EDGE_MESH_NODES',
        zeroTrustStatus: 'STRICT_ENFORCED',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.policyCode).toBe('Q-EDGE-POL-1403');
  });
});
