import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 14 Book 8 — AI Safety & Executive Sign-off E2E', () => {
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

  it('GET /api/v14/ai-safety-boundary-book8 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/ai-safety-boundary-book8')
      .expect(200);
  });

  it('POST /api/v14/ai-safety-boundary-book8/verify should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/ai-safety-boundary-book8/verify')
      .send({
        verificationCode: `SAFETY-VERIFY-E2E-${Date.now()}`,
        targetModel: 'TRUSTZONE_LLM_70B',
      })
      .expect(201);
  });

  it('GET /api/v14/executive-signoff-book8 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v14/executive-signoff-book8')
      .expect(200);
  });

  it('POST /api/v14/executive-signoff-book8/signoff should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v14/executive-signoff-book8/signoff')
      .send({ signoffCode: `SIGNOFF-E2E-${Date.now()}` })
      .expect(201);
  });
});
