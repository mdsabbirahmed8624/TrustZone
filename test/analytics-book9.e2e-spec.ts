import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as argon2 from 'argon2';

describe('Analytics Book 9 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = 'analytics-e2e@trustzone.care';
  const testPassword = 'Password123!';
  let token: string;
  let userId: string;
  let branchId: string;
  let scheduledReportId: string;

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

    // Cleanups
    await prisma.reportHistory.deleteMany({});
    await prisma.scheduledReport.deleteMany({});
    await prisma.kPIConfiguration.deleteMany({});
    await prisma.forecastHistory.deleteMany({});
    await prisma.alertAnalytics.deleteMany({});
    await prisma.analyticsSnapshot.deleteMany({});
    await prisma.businessMetric.deleteMany({});

    const oldUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    if (oldUser) {
      await prisma.user.delete({ where: { id: oldUser.id } });
    }

    const oldBranch = await prisma.branch.findFirst({
      where: { name: 'Analytics Test Branch' },
    });
    if (oldBranch) {
      await prisma.branch.delete({ where: { id: oldBranch.id } });
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name: 'Analytics Test Branch',
        address: '789 Test Rd',
        timezone: 'UTC',
        status: 'ACTIVE',
      },
    });
    branchId = branch.id;

    // Create user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Analyst',
        lastName: 'E2E',
        role: 'SUPER_ADMIN',
        branchId: branchId,
        isEmailVerified: true,
      },
    });
    userId = user.id;

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/mobile/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });
    token = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.reportHistory.deleteMany({});
    await prisma.scheduledReport.deleteMany({});
    await prisma.user.delete({ where: { id: userId } });
    await prisma.branch.delete({ where: { id: branchId } });

    await app.close();
  });

  describe('Dashboard Summaries', () => {
    it('GET /api/v1/dashboard/summary (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('revenue');
          expect(res.body.data).toHaveProperty('profit');
        });
    });
  });

  describe('KPI Engine', () => {
    it('GET /api/v1/kpi (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/kpi')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('firstTimeFixRatePercent');
        });
    });

    it('POST /api/v1/kpi/configure (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/kpi/configure')
        .set('Authorization', `Bearer ${token}`)
        .send({
          formulaKey: 'first_time_fix_rate',
          targetValue: 95.5,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.targetValue).toBe(95.5);
        });
    });
  });

  describe('Forecast Projections', () => {
    it('GET /api/v1/forecast/project (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/forecast/project')
        .query({ type: 'REVENUE' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('projectedSeries');
        });
    });
  });

  describe('Reports Engine', () => {
    it('POST /api/v1/reports/schedule (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/reports/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Executive Monthly BI Summary',
          reportType: 'EXECUTIVE',
          frequency: 'MONTHLY',
          recipients: ['exec@trustzone.care'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          scheduledReportId = res.body.data.id;
        });
    });

    it('GET /api/v1/reports/schedule (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/schedule')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('POST /api/v1/reports/:id/trigger (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/reports/${scheduledReportId}/trigger`)
        .set('Authorization', `Bearer ${token}`)
        .send({ format: 'PDF' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('fileUrl');
          expect(res.body.data.format).toBe('PDF');
        });
    });
  });
});
