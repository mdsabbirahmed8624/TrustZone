import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as argon2 from 'argon2';

describe('AI & Predictions Book 10 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = 'ai-e2e@trustzone.care';
  const testPassword = 'Password123!';
  let token: string;
  let userId: string;
  let branchId: string;
  let customerId: string;
  let deviceId: string;
  let ticketId: string;
  let partId: string;
  let automationRuleId: string;

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
    await prisma.predictionHistory.deleteMany({});
    await prisma.recommendationHistory.deleteMany({});
    await prisma.knowledgeSearch.deleteMany({});
    await prisma.knowledgeArticle.deleteMany({});
    await prisma.customerInsight.deleteMany({});
    await prisma.demandForecast.deleteMany({});
    await prisma.repairPrediction.deleteMany({});
    await prisma.aIAuditLog.deleteMany({});
    await prisma.automationExecution.deleteMany({});
    await prisma.automationRule.deleteMany({});

    const oldUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    if (oldUser) {
      await prisma.user.delete({ where: { id: oldUser.id } });
    }

    const oldBranch = await prisma.branch.findFirst({
      where: { name: 'AI Test Branch' },
    });
    if (oldBranch) {
      await prisma.branch.delete({ where: { id: oldBranch.id } });
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name: 'AI Test Branch',
        address: '101 AI Way',
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
        firstName: 'AI Scientist',
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

    // Seed customer, device, ticket
    const customer = await prisma.customer.create({
      data: {
        firstName: 'AI Customer',
        lastName: 'Test',
        email: 'ai-cust@test.com',
        phone: '1234567890',
        dueBalance: 0,
      },
    });
    customerId = customer.id;

    const device = await prisma.device.create({
      data: {
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        serialNumber: 'SN-AI-E2E-14',
        customerId: customerId,
      },
    });
    deviceId = device.id;

    const ticket = await prisma.ticket.create({
      data: {
        customerId: customerId,
        deviceId: deviceId,
        branchId: branchId,
        diagnosisNotes: 'Cracked screen, low battery backup',
        status: 'booked',
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
    ticketId = ticket.id;

    // Seed Part
    const part = await prisma.part.create({
      data: {
        sku: 'SKU-AI-PART-TEST',
        name: 'iPhone 14 Pro OLED Display Panel',
        category: 'Display',
        brandCompatibility: 'Apple',
        modelCompatibility: ['iPhone 14 Pro'],
        basePrice: 199.99,
        minimumStockBuffer: 3,
      },
    });
    partId = part.id;

    // Seed Automation Rule
    const rule = await prisma.automationRule.create({
      data: {
        name: 'E2E Test Low Stock Notification',
        triggerEvent: 'STOCK_BELOW_THRESHOLD',
        conditions: [],
        actions: [],
        priority: 'HIGH',
        enabled: true,
      },
    });
    automationRuleId = rule.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.predictionHistory.deleteMany({});
    await prisma.recommendationHistory.deleteMany({});
    await prisma.knowledgeSearch.deleteMany({});
    await prisma.knowledgeArticle.deleteMany({});
    await prisma.customerInsight.deleteMany({});
    await prisma.demandForecast.deleteMany({});
    await prisma.repairPrediction.deleteMany({});
    await prisma.automationExecution.deleteMany({});
    await prisma.automationRule.deleteMany({});
    await prisma.ticket.deleteMany({ where: { id: ticketId } });
    await prisma.device.deleteMany({ where: { id: deviceId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
    await prisma.part.deleteMany({ where: { id: partId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.branch.deleteMany({ where: { id: branchId } });

    await app.close();
  });

  describe('Predictions endpoints', () => {
    it('POST /api/v1/predictions/fault/:ticketId', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/predictions/fault/${ticketId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.probableFault).toContain('Screen');
    });

    it('POST /api/v1/predictions/failures/:deviceId', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/predictions/failures/${deviceId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.predictionType).toBe('BATTERY_DEGRADATION');
    });

    it('GET /api/v1/predictions/customer/:customerId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/predictions/customer/${customerId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.satisfactionScore).toBeDefined();
    });
  });

  describe('Recommendations endpoints', () => {
    it('GET /api/v1/recommendations/parts/:partId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/recommendations/parts/${partId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendationType).toBe('SPARE_PARTS');
    });

    it('GET /api/v1/recommendations/tech/:ticketId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/recommendations/tech/${ticketId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendationType).toBe('TECHNICIAN_ASSIGNMENT');
    });

    it('GET /api/v1/recommendations/demand/:partId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/recommendations/demand/${partId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.projectedDemand).toBeDefined();
    });

    it('GET /api/v1/recommendations/supplier/:partId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/recommendations/supplier/${partId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendationType).toBe('PROCUREMENT_QUANTITY');
    });
  });

  describe('Knowledge endpoints', () => {
    it('POST /api/v1/knowledge/articles and GET /api/v1/knowledge/search', async () => {
      const artRes = await request(app.getHttpServer())
        .post('/api/v1/knowledge/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'iPhone Screen Replacement SOP',
          content:
            '1. Disassemble screen, 2. Unplug connector, 3. Put new screen.',
          tags: ['Apple', 'Screen', 'Repair'],
          category: 'SOP',
        })
        .expect(201);

      expect(artRes.body.success).toBe(true);

      const searchRes = await request(app.getHttpServer())
        .get('/api/v1/knowledge/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ query: 'Screen' })
        .expect(200);

      expect(searchRes.body.success).toBe(true);
      expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Automation Trigger endpoints', () => {
    it('POST /api/v1/automation/eval/trigger', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/automation/eval/trigger')
        .set('Authorization', `Bearer ${token}`)
        .send({
          event: 'STOCK_BELOW_THRESHOLD',
          payload: { partId },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rulesEvaluated).toBeGreaterThanOrEqual(1);
    });
  });
});
