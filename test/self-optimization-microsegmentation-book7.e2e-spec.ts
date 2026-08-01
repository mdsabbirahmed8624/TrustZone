import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 7 — Self-Optimization & Microsegmentation E2E', () => {
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

  it('GET /api/v14/self-optimization-book7 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/self-optimization-book7')
      .expect(200);
  });

  it('POST /api/v14/self-optimization-book7/record should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/self-optimization-book7/record')
      .send({
        optimizationCode: `OPT-ANALYTICS-E2E-${Date.now()}`,
        targetModel: 'LLM_INFERENCE_ENGINE',
      })
      .expect(201);
  });

  it('GET /api/v14/sovereign-microsegmentation-book7 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/sovereign-microsegmentation-book7')
      .expect(200);
  });

  it('POST /api/v14/sovereign-microsegmentation-book7/enforce should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/sovereign-microsegmentation-book7/enforce')
      .send({ segmentCode: `SOV-SEG-E2E-${Date.now()}` })
      .expect(201);
  });
});
