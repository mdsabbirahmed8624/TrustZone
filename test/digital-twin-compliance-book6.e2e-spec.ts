import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 6 — Digital Twin & Compliance E2E', () => {
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

  it('GET /api/v14/digital-twin-simulation-book6 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/digital-twin-simulation-book6')
      .expect(200);
  });

  it('POST /api/v14/digital-twin-simulation-book6/execute should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/digital-twin-simulation-book6/execute')
      .send({ simulationCode: `TWIN-SIM-E2E-${Date.now()}` })
      .expect(201);
  });

  it('GET /api/v14/predictive-compliance-governance-book6 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/predictive-compliance-governance-book6')
      .expect(200);
  });

  it('POST /api/v14/predictive-compliance-governance-book6/assess should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/predictive-compliance-governance-book6/assess')
      .send({ complianceCode: `COMPLY-GOV-E2E-${Date.now()}` })
      .expect(201);
  });
});
