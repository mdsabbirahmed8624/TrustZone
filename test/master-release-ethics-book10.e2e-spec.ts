import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 10 — Master Platform Release & AI Ethics E2E', () => {
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

  it('GET /api/v14/ai-governance-ethics-book10 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/ai-governance-ethics-book10')
      .expect(200);
  });

  it('POST /api/v14/ai-governance-ethics-book10/audit should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/ai-governance-ethics-book10/audit')
      .send({
        policyCode: `ETHICS-POLICY-E2E-${Date.now()}`,
        policyTitle: 'RESPONSIBLE_AI_CHARTER',
        complianceScorePercent: 99.5,
      })
      .expect(201);
  });

  it('GET /api/v14/master-platform-release-book10 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/master-platform-release-book10')
      .expect(200);
  });

  it('POST /api/v14/master-platform-release-book10/certify should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/master-platform-release-book10/certify')
      .send({ masterReleaseCode: `MASTER-RELEASE-E2E-${Date.now()}` })
      .expect(201);
  });
});
