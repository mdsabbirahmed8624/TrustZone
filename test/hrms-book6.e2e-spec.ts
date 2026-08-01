import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 6 - Enterprise HRM, Attendance, Payroll & Recruitment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testJobId: string;
  let testApplicantId: string;
  let testInterviewId: string;

  const testEmail = `hr-admin-${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create SUPER_ADMIN user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'HR',
        lastName: 'Director',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.hRAnnouncement.deleteMany({});
      await prisma.interviewFeedback.deleteMany({});
      await prisma.interview.deleteMany({});
      await prisma.applicant.deleteMany({});
      await prisma.recruitmentJob.deleteMany({});
      await prisma.reward.deleteMany({});
      await prisma.employeeGoal.deleteMany({});
      await prisma.payrollItem.deleteMany({});
      await prisma.payroll.deleteMany({});
      await prisma.salaryStructure.deleteMany({});
      await prisma.leaveRequest.deleteMany({});
      await prisma.leaveBalance.deleteMany({});
      await prisma.attendanceCorrection.deleteMany({});
      await prisma.attendance.deleteMany({});
      await prisma.employeeProfile.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
    await app.close();
  });

  describe('Employee Management (/api/v1/hr/employees)', () => {
    it('POST /api/v1/hr/employees/profile - should upsert employee profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/employees/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          department: 'Mobile Engineering',
          designation: 'Lead Technician',
          employeeNumber: 'EMP-9901',
          skills: ['Micro-Soldering', 'iOS Diagnostics'],
        })
        .expect(200);

      expect(res.body.department).toBe('Mobile Engineering');
      expect(res.body.employeeNumber).toBe('EMP-9901');
    });

    it('GET /api/v1/hr/employees - should list employee profiles', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Attendance & Leave (/api/v1/hr/attendance & /api/v1/hr/leaves)', () => {
    it('POST /api/v1/hr/attendance/check-in - should record GPS check-in', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/attendance/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          latitude: 23.8103,
          longitude: 90.4125,
          biometricVerification: true,
        })
        .expect(200);

      expect(res.body.status).toBeDefined();
    });

    it('POST /api/v1/hr/leaves/balance/init - should initialize leave balance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/leaves/balance/init')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaveType: 'ANNUAL',
          yearlyEntitlement: 14,
        })
        .expect(200);

      expect(res.body.yearlyEntitlement).toBe(14);
    });

    it('POST /api/v1/hr/leaves/request - should submit leave request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/leaves/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: '2026-08-01',
          endDate: '2026-08-02',
          leaveType: 'ANNUAL',
          reason: 'Vacation',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('pending');
    });
  });

  describe('Payroll & Salary Structure (/api/v1/hr/payroll)', () => {
    it('POST /api/v1/hr/payroll/structure - should setup salary structure', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/payroll/structure')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          basicSalary: 4500,
          housingAllowance: 800,
          transportAllowance: 300,
          taxPercentage: 10,
        })
        .expect(200);

      expect(Number(res.body.basicSalary)).toBe(4500);
    });

    it('POST /api/v1/hr/payroll/process - should process monthly payroll batch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/payroll/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ month: '2026-07' })
        .expect(200);

      expect(res.body.payroll.status).toBe('APPROVED');
    });
  });

  describe('Recruitment & Interviews (/api/v1/hr/recruitment)', () => {
    it('POST /api/v1/hr/recruitment/jobs - should create job opening', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/recruitment/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Master Micro-Soldering Specialist',
          department: 'Mobile Engineering',
          description: 'Seeking expert technician for logic board repair.',
          openings: 2,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testJobId = res.body.id;
    });

    it('POST /api/v1/hr/recruitment/jobs/:id/apply - should apply for job opening', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hr/recruitment/jobs/${testJobId}/apply`)
        .send({
          fullName: 'David Miller',
          email: 'david.miller@test.com',
          phone: '9876543210',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testApplicantId = res.body.id;
    });

    it('POST /api/v1/hr/recruitment/applicants/:id/interview - should schedule interview', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hr/recruitment/applicants/${testApplicantId}/interview`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          interviewDate: '2026-07-25T10:00:00Z',
          interviewerName: 'Tech Lead John',
          mode: 'ONLINE',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testInterviewId = res.body.id;
    });

    it('POST /api/v1/hr/recruitment/interviews/:id/feedback - should submit interview feedback', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hr/recruitment/interviews/${testInterviewId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 5,
          comments: 'Excellent board repair skills.',
          decision: 'HIRE',
        })
        .expect(200);

      expect(res.body.decision).toBe('HIRE');
    });
  });

  describe('Announcements & Analytics (/api/v1/hr/announcements & /api/v1/hr/analytics)', () => {
    it('POST /api/v1/hr/announcements - should publish HR announcement', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/hr/announcements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Q3 Townhall Meeting',
          content: 'All hands meeting scheduled for next Monday at 10 AM.',
          priority: 'URGENT',
        })
        .expect(201);

      expect(res.body.title).toBe('Q3 Townhall Meeting');
    });

    it('GET /api/v1/hr/analytics/dashboard - should return executive HR dashboard metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/hr/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.overview.totalEmployees).toBeGreaterThanOrEqual(1);
      expect(res.body.turnoverRate).toBeDefined();
    });
  });
});
