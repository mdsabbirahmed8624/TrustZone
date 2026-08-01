import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

import * as argon2 from 'argon2';

describe('Phase 11 Book 1 - Enterprise Integrations & API Gateway (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

  const testEmail = `integration-admin-${Date.now()}@test.com`;
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

    // Create verified SUPER_ADMIN user directly in database
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Integration',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    // Login test user
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.integrationLog.deleteMany({});
      await prisma.webhookDelivery.deleteMany({});
      await prisma.webhookEndpoint.deleteMany({});
      await prisma.idempotencyRequest.deleteMany({});
      await prisma.idempotencyKey.deleteMany({});
      await prisma.apiKey.deleteMany({});
      await prisma.apiClient.deleteMany({});
      await prisma.syncJob.deleteMany({});
      await prisma.user
        .delete({ where: { email: testEmail } })
        .catch(() => null);
    }
    await app.close();
  });

  describe('API Gateway Endpoints (/api/v1/gateway)', () => {
    it('POST /api/v1/gateway/keys - should generate client & API Key', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/gateway/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Partner Application',
          scopes: ['read', 'write'],
          rateLimit: 150,
        })
        .expect(201);

      expect(res.body.rawApiKey).toBeDefined();
      expect(res.body.clientKey).toBeDefined();
    });

    it('GET /api/v1/gateway/health - should return system health status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gateway/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.gatewayStatus).toBe('ONLINE');
      expect(res.body.databaseStatus).toBe('HEALTHY');
    });

    it('GET /api/v1/gateway/analytics - should return usage metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gateway/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.totalClients).toBeDefined();
      expect(res.body.totalKeys).toBeDefined();
    });
  });

  describe('Integrations & Credentials Endpoints (/api/v1/integrations)', () => {
    it('GET /api/v1/integrations/providers - should list integration providers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/integrations/providers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/integrations/credentials - should configure sandbox credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/integrations/credentials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          providerCode: 'STRIPE',
          environment: 'SANDBOX',
          apiKey: 'pk_test_12345',
          apiSecret: 'sk_test_67890',
        })
        .expect(200);

      expect(res.body.providerCode).toBe('STRIPE');
      expect(res.body.environment).toBe('SANDBOX');
      expect(res.body.status).toBe('ACTIVE');
    });

    it('POST /api/v1/integrations/test - should test connection in sandbox mode', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/integrations/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          providerCode: 'STRIPE',
          environment: 'SANDBOX',
        })
        .expect(200);

      expect(res.body.connectionStatus).toBe('SUCCESSFUL');
    });
  });

  describe('Webhooks & Idempotency Endpoints (/api/v1/webhooks)', () => {
    let endpointId: string;

    it('POST /api/v1/webhooks/endpoints - should register webhook endpoint', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/endpoints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetUrl: 'https://webhook.site/test-target',
          events: ['ticket.created', 'invoice.paid'],
          description: 'Test Webhook Partner',
        })
        .expect(201);

      endpointId = res.body.id;
      expect(endpointId).toBeDefined();
      expect(res.body.secretKey).toBeDefined();
    });

    it('POST /api/v1/webhooks/dispatch - should dispatch event to subscribed endpoints', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/dispatch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          event: 'ticket.created',
          payload: { ticketId: 't-101', customerName: 'Alice' },
        })
        .expect(200);

      expect(res.body.dispatched).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/webhooks/incoming - should evaluate idempotency key and return cached response on replay', async () => {
      const idemKey = `idem-wh-${Date.now()}`;
      const payload = { event: 'payment.success', paymentId: 'p-100' };

      // First request (original execution)
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/webhooks/incoming')
        .set('x-idempotency-key', idemKey)
        .send(payload)
        .expect(200);

      expect(res1.body.received).toBe(true);

      // Duplicate request (replay detection)
      const res2 = await request(app.getHttpServer())
        .post('/api/v1/webhooks/incoming')
        .set('x-idempotency-key', idemKey)
        .send(payload)
        .expect(200);

      expect(res2.body.received).toBe(true);
    });
  });

  describe('Third-Party Connectors Endpoints (/api/v1/connectors)', () => {
    it('POST /api/v1/connectors/payments/process - should process payment with idempotency key', async () => {
      const idemKey = `idem-pay-${Date.now()}`;
      const payload = {
        providerCode: 'STRIPE',
        amount: 199.99,
        currency: 'USD',
        paymentMethod: 'CREDIT_CARD',
        environment: 'SANDBOX',
      };

      const res1 = await request(app.getHttpServer())
        .post('/api/v1/connectors/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-idempotency-key', idemKey)
        .send(payload)
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res1.body.data.status).toBe('PAID');

      // Replay check
      const res2 = await request(app.getHttpServer())
        .post('/api/v1/connectors/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-idempotency-key', idemKey)
        .send(payload)
        .expect(200);

      expect(res2.body.data.transactionId).toBe(res1.body.data.transactionId);
    });
  });

  describe('Notifications & Sync Endpoints (/api/v1/notification-hub & /api/v1/sync)', () => {
    it('POST /api/v1/notification-hub/templates - should upsert template', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/notification-hub/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TICKET_READY_SMS',
          name: 'Ticket Ready SMS Alert',
          channel: 'SMS',
          bodyTemplate:
            'Hi {{ name }}, ticket {{ ticketId }} is ready for pickup!',
        })
        .expect(201);

      expect(res.body.code).toBe('TICKET_READY_SMS');
    });

    it('POST /api/v1/sync/trigger - should trigger incremental sync job', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sync/trigger')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          providerCode: 'QUICKBOOKS',
          syncType: 'INCREMENTAL',
          entityType: 'CUSTOMER',
          environment: 'SANDBOX',
        })
        .expect(201);

      expect(res.body.status).toBe('COMPLETED');
    });

    it('GET /api/v1/sync/dashboard - should return sync metrics dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/sync/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.totalSyncJobs).toBeGreaterThan(0);
    });
  });
});
