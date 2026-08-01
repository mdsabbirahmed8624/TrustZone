import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 7 - Enterprise Support, Help Desk, Warranty & SLA (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testCustomerId: string;
  let testTicketId: string;
  let testWarrantyId: string;
  let testClaimId: string;
  let testComplaintId: string;

  const testEmail = `support-admin-${Date.now()}@test.com`;
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
        firstName: 'Support',
        lastName: 'Director',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    // Create Test Customer
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Robert',
        lastName: 'Downey',
        email: `robert-${Date.now()}@test.com`,
        phone: '1234567890',
      },
    });
    testCustomerId = customer.id;

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.supportAnalytics.deleteMany({});
      await prisma.satisfactionSurvey.deleteMany({});
      await prisma.customerFeedback.deleteMany({});
      await prisma.customerComplaint.deleteMany({});
      await prisma.fAQ.deleteMany({});
      await prisma.knowledgeArticle.deleteMany({});
      await prisma.knowledgeCategory.deleteMany({});
      await prisma.escalationHistory.deleteMany({});
      await prisma.sLAHistory.deleteMany({});
      await prisma.sLA.deleteMany({});
      await prisma.ticketTimeline.deleteMany({});
      await prisma.ticketAssignment.deleteMany({});
      await prisma.ticketAttachment.deleteMany({});
      await prisma.ticketComment.deleteMany({});
      await prisma.supportTicket.deleteMany({});
      await prisma.warrantyClaim.deleteMany({});
      await prisma.warranty.deleteMany({
        where: { customerId: testCustomerId },
      });
      await prisma.customer
        .delete({ where: { id: testCustomerId } })
        .catch(() => null);
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
    await app.close();
  });

  describe('Support Tickets & Help Desk (/api/v1/support/tickets)', () => {
    it('POST /api/v1/support/tickets - should create support ticket', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Screen Replacement Warranty Query',
          description:
            'Customer asking if screen replacement carries 6 months warranty.',
          priority: 'HIGH',
          customerId: testCustomerId,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.ticketNumber).toBeDefined();
      testTicketId = res.body.id;
    });

    it('GET /api/v1/support/tickets - should list support tickets', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/support/tickets/:id/comments - should add comment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/support/tickets/${testTicketId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'Verified receipt. 6-month warranty applies.',
          isInternal: false,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
    });

    it('POST /api/v1/support/tickets/:id/assign - should assign ticket', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/support/tickets/${testTicketId}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assignedToId: testUserId,
          reason: 'Assigned to Support Lead',
        })
        .expect(200);

      expect(res.body.assignedToId).toBe(testUserId);
    });
  });

  describe('Warranty & SLA Management (/api/v1/support/warranty & /api/v1/support/sla)', () => {
    it('POST /api/v1/support/warranty/register - should register warranty', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/warranty/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: testCustomerId,
          warrantyCode: `WAR-E2E-${Date.now()}`,
          durationMonths: 6,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testWarrantyId = res.body.id;
    });

    it('POST /api/v1/support/warranty/claim - should submit warranty claim', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/warranty/claim')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          warrantyId: testWarrantyId,
          claimReason: 'Touch screen ghost touch issue',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testClaimId = res.body.id;
    });

    it('POST /api/v1/support/warranty/claim/:id/process - should process warranty claim', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/support/warranty/claim/${testClaimId}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'APPROVED',
          resolutionNotes: 'Replacement touch panel approved.',
        })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('POST /api/v1/support/sla - should configure SLA target', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/sla')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'HIGH',
          targetResponseHours: 2,
          targetResolutionHours: 12,
        })
        .expect(200);

      expect(res.body.priority).toBe('HIGH');
    });

    it('POST /api/v1/support/escalations/:id - should escalate ticket', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/support/escalations/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          escalatedTo: 'Head of Support',
          reason: 'Urgent customer request',
          level: 2,
        })
        .expect(200);

      expect(res.body.level).toBe(2);
    });
  });

  describe('Knowledge Base & CSAT Feedback (/api/v1/support/knowledge & /api/v1/support/feedback)', () => {
    it('POST /api/v1/support/knowledge/articles - should create KB article', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/knowledge/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Display Replacement Terms & Warranty Policy',
          content:
            'All original OLED display replacements carry 6 months full warranty.',
          category: 'Warranty Policy',
          tags: ['OLED', 'Screen', 'Warranty'],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
    });

    it('GET /api/v1/support/knowledge/articles - should search KB articles', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/support/knowledge/articles?q=OLED')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/v1/support/complaints - should submit customer complaint', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/complaints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: testCustomerId,
          subject: 'Delayed response on warranty claim',
          details: 'Wait time exceeded 24 hours.',
          severity: 'HIGH',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testComplaintId = res.body.id;
    });

    it('POST /api/v1/support/feedback/surveys - should submit CSAT survey', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/support/feedback/surveys')
        .send({
          customerId: testCustomerId,
          rating: 5,
          npsScore: 10,
          feedbackText: 'Super fast response once assigned!',
        })
        .expect(201);

      expect(res.body.rating).toBe(5);
    });

    it('GET /api/v1/support/analytics/dashboard - should return executive support metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/support/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.overview.totalTickets).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.slaCompliancePercentage).toBeDefined();
    });
  });
});
