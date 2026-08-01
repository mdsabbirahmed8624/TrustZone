import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 2 — Zero-Knowledge Privacy & Neuromorphic AI Engine (E2E)', () => {
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

  it('GET /api/v14/zero-knowledge-privacy-book2 — should return list of zk proofs', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/zero-knowledge-privacy-book2')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/zero-knowledge-privacy-book2/verify — should verify zk proof', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/zero-knowledge-privacy-book2/verify')
      .send({
        proofCode: 'ZK-PROOF-P14-B2-01',
        zkCircuitType: 'ZK_SNARK_GROTH16',
        verificationStatus: 'VERIFIED_VALID',
        proofHash: '0x8f4a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        verificationTimeMs: 1.2,
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.proofCode).toBe('ZK-PROOF-P14-B2-01');
  });

  it('GET /api/v14/neuromorphic-ai-book2 — should return list of neuromorphic jobs', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/neuromorphic-ai-book2')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/neuromorphic-ai-book2/execute — should execute neuromorphic job', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/neuromorphic-ai-book2/execute')
      .send({
        jobCode: 'NEURO-AI-JOB-9901',
        snnArchitecture: 'LOIHI_SPIKING_NEURAL_MESH',
        powerConsumptionWatts: 0.45,
        inferenceLatencyUs: 85.0,
        processingStatus: 'COMPLETED_OPTIMAL',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.jobCode).toBe('NEURO-AI-JOB-9901');
  });
});
