import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 5 - Enterprise CRM 2.0 & Sales Pipeline (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testLeadId: string;
  let testPipelineId: string;
  let testStageId: string;
  let testOpportunityId: string;
  let testCampaignId: string;
  let testCustomerId: string;

  const testEmail = `crm-admin-${Date.now()}@test.com`;
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
        firstName: 'CRM',
        lastName: 'Admin',
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

    // Ensure Sales Pipeline & Stage
    const pipeline = await prisma.salesPipeline.create({
      data: {
        name: `Test Pipeline ${Date.now()}`,
        stages: {
          create: [
            { name: 'Qualified', displayOrder: 1, probability: 20 },
            { name: 'Proposal', displayOrder: 2, probability: 50 },
            { name: 'Closed Won', displayOrder: 3, probability: 100 },
          ],
        },
      },
      include: { stages: true },
    });
    testPipelineId = pipeline.id;
    testStageId = pipeline.stages[0].id;

    // Create test customer
    const cust = await prisma.customer.create({
      data: {
        firstName: 'CRM',
        lastName: 'Client',
        email: `client-${Date.now()}@test.com`,
        phone: '1234567890',
      },
    });
    testCustomerId = cust.id;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.communicationHistory.deleteMany({});
      await prisma.followUpReminder.deleteMany({});
      await prisma.customerTouchpoint.deleteMany({});
      await prisma.customerJourney.deleteMany({});
      await prisma.campaignMember.deleteMany({});
      await prisma.campaign.deleteMany({});
      await prisma.salesTask.deleteMany({});
      await prisma.opportunity.deleteMany({});
      await prisma.opportunityStage.deleteMany({});
      await prisma.salesPipeline.deleteMany({});
      await prisma.leadActivity.deleteMany({});
      await prisma.lead.deleteMany({});
      await prisma.customer.deleteMany({ where: { id: testCustomerId } });
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
    await app.close();
  });

  describe('Lead Management Endpoints (/api/v1/crm/leads)', () => {
    it('POST /api/v1/crm/leads - should capture new lead with auto scoring', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/crm/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Sarah',
          lastName: 'Connor',
          email: 'sarah@cyberdyne.com',
          company: 'Cyberdyne Systems',
          source: 'WEBSITE',
          estimatedValue: 2500,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.leadScore).toBeGreaterThanOrEqual(50);
      testLeadId = res.body.id;
    });

    it('GET /api/v1/crm/leads - should list leads with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/crm/leads/:id/convert - should convert lead to customer/opportunity', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/crm/leads/${testLeadId}/convert`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          createOpportunity: true,
          stageId: testStageId,
        })
        .expect(200);

      expect(res.body.customer.id).toBeDefined();
      expect(res.body.lead.status).toBe('CONVERTED');
      if (res.body.opportunityId) {
        testOpportunityId = res.body.opportunityId;
      }
    });
  });

  describe('Opportunities & Kanban Pipeline (/api/v1/crm/opportunities & /api/v1/crm/pipeline)', () => {
    it('POST /api/v1/crm/opportunities - should create opportunity', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/crm/opportunities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Fleet Screen Replacement Contract',
          amount: 8000,
          stageId: testStageId,
          customerId: testCustomerId,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(Number(res.body.expectedRevenue)).toBe(1600); // 20% probability
      if (!testOpportunityId) testOpportunityId = res.body.id;
    });

    it('GET /api/v1/crm/pipeline/kanban - should return Kanban Board', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/pipeline/kanban')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.stages).toBeDefined();
      expect(res.body.stages.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/crm/opportunities/:id/stage - should move opportunity stage', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/crm/opportunities/${testOpportunityId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stageId: testStageId })
        .expect(200);

      expect(res.body.id).toBe(testOpportunityId);
    });
  });

  describe('Campaigns & Communications (/api/v1/crm/campaigns & /api/v1/crm/communications)', () => {
    it('POST /api/v1/crm/campaigns - should create marketing campaign', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/crm/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Q3 Enterprise Repair Promo',
          channel: 'EMAIL',
          subject: 'Special 20% Off Corporate Repairs',
          budget: 1000,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Q3 Enterprise Repair Promo');
      testCampaignId = res.body.id;
    });

    it('POST /api/v1/crm/campaigns/:id/members - should add members to campaign', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/crm/campaigns/${testCampaignId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients: [
            { recipient: 'target@enterprise.com', name: 'Target User' },
          ],
        })
        .expect(200);

      expect(res.body.membersAdded).toBe(1);
    });

    it('POST /api/v1/crm/communications/log - should log multi-channel communication', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/crm/communications/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: testCustomerId,
          channel: 'SMS',
          content: 'Your device repair estimate is ready for review.',
        })
        .expect(201);

      expect(res.body.channel).toBe('SMS');
    });
  });

  describe('Customer Journey & Analytics (/api/v1/crm/journey & /api/v1/crm/analytics)', () => {
    it('GET /api/v1/crm/journey/customer/:id - should fetch 360 customer journey timeline', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/crm/journey/customer/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.customerId).toBe(testCustomerId);
      expect(res.body.lifecycleStage).toBeDefined();
    });

    it('GET /api/v1/crm/analytics/dashboard - should return executive CRM dashboard metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.overview.totalLeads).toBeGreaterThanOrEqual(1);
      expect(res.body.leadFunnel).toBeDefined();
    });
  });
});
