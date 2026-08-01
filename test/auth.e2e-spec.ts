import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clear test database tables specifically for the integration test user to ensure test isolation
    const testEmail = 'integration@test.com';
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.sessionLog.deleteMany({ where: { userId: user.id } });
      await prisma.customer.deleteMany({ where: { email: testEmail } });
      await prisma.user.delete({ where: { email: testEmail } });
    }
  });

  afterAll(async () => {
    // Cleanup records after test run
    const testEmail = 'integration@test.com';
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.sessionLog.deleteMany({ where: { userId: user.id } });
      await prisma.customer.deleteMany({ where: { email: testEmail } });
      await prisma.user.delete({ where: { email: testEmail } });
    }
    await app.close();
  });

  const testUser = {
    email: 'integration@test.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+15550199',
  };

  let verificationToken: string;
  let accessToken: string;
  let refreshToken: string;

  describe('Registration & Email Verification', () => {
    it('POST /api/v1/auth/register (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data).toHaveProperty('verificationToken');
          verificationToken = res.body.data.verificationToken;
        });
    });

    it('POST /api/v1/auth/register (Duplicate Email Conflict)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('CONFLICT');
        });
    });

    it('POST /api/v1/auth/verify-email (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Login & Token Management', () => {
    it('POST /api/v1/auth/login (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          accessToken = res.body.data.accessToken;
          refreshToken = res.body.data.refreshToken;
        });
    });

    it('POST /api/v1/auth/refresh (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          // Update tokens with rotated versions
          accessToken = res.body.data.accessToken;
          refreshToken = res.body.data.refreshToken;
        });
    });

    it('GET /api/v1/auth/sessions (Success with Auth)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.length).toBe(1);
        });
    });

    it('POST /api/v1/auth/logout (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});
