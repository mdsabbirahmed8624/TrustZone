import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 9 — AI Model Drift & Milestone Completion E2E', () => {
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

  it('GET /api/v14/ai-model-drift-book9 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/ai-model-drift-book9')
      .expect(200);
  });

  it('POST /api/v14/ai-model-drift-book9/record should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/ai-model-drift-book9/record')
      .send({
        monitoringCode: `DRIFT-MONITOR-E2E-${Date.now()}`,
        targetModel: 'AUTONOMOUS_SWARM_HEALER',
      })
      .expect(201);
  });

  it('GET /api/v14/milestone-completion-book9 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/milestone-completion-book9')
      .expect(200);
  });

  it('POST /api/v14/milestone-completion-book9/certify should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/milestone-completion-book9/certify')
      .send({ completionCode: `COMPLETION-E2E-${Date.now()}` })
      .expect(201);
  });
});
