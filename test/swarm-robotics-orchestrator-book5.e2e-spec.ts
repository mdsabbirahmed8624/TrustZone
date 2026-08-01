import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 5 — Swarm Robotics Fleet Orchestrator & Generative AI Cross-Cloud Tuning Engine (E2E)', () => {
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

  it('GET /api/v14/swarm-robotics-orchestrator-book5 — should return list of fleets', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/swarm-robotics-orchestrator-book5')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/swarm-robotics-orchestrator-book5/dispatch — should dispatch fleet', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/swarm-robotics-orchestrator-book5/dispatch')
      .send({
        fleetCode: 'SWARM-ROBOT-P14-B5-01',
        robotUnitType: 'AUTONOMOUS_REPAIR_ARM',
        activeUnitsCount: 24,
        taskAllocationStatus: 'OPTIMAL_DISPATCHED',
        fleetEfficiencyScore: 0.994,
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.fleetCode).toBe('SWARM-ROBOT-P14-B5-01');
  });

  it('GET /api/v14/generative-ai-tuning-engine-book5 — should return list of tuning jobs', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v14/generative-ai-tuning-engine-book5')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/v14/generative-ai-tuning-engine-book5/execute — should execute tuning job', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v14/generative-ai-tuning-engine-book5/execute')
      .send({
        tuningJobCode: 'GENAI-TUNE-P14-B5-01',
        targetModelArchitecture: 'TRUSTZONE_LLM_70B_QUANTIZED',
        executionCloudTarget: 'HYBRID_GCP_AWS_QUANTUM',
        hyperparameterScore: 0.989,
        jobExecutionStatus: 'TRAINING_CONVERGED',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.tuningJobCode).toBe('GENAI-TUNE-P14-B5-01');
  });
});
