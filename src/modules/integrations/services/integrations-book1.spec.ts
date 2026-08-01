import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyService } from './idempotency.service';
import { ApiGatewayService } from './api-gateway.service';
import { WebhookService } from './webhook.service';
import { IntegrationService } from './integration.service';
import { PaymentConnectorService } from './payment-connector.service';
import { MessagingConnectorService } from './messaging-connector.service';
import { AccountingConnectorService } from './accounting-connector.service';
import { MarketplaceConnectorService } from './marketplace-connector.service';
import { NotificationHubService } from './notification-hub.service';
import { SyncEngineService } from './sync-engine.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Integrations & Connectivity Unit Tests (Book 1)', () => {
  let idempotencyService: IdempotencyService;
  let apiGatewayService: ApiGatewayService;
  let webhookService: WebhookService;
  let integrationService: IntegrationService;
  let paymentConnector: PaymentConnectorService;
  let messagingConnector: MessagingConnectorService;
  let accountingConnector: AccountingConnectorService;
  let marketplaceConnector: MarketplaceConnectorService;
  let notificationHubService: NotificationHubService;
  let syncEngineService: SyncEngineService;

  const mockPrismaService = {
    idempotencyKey: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    idempotencyRequest: {
      create: jest.fn().mockResolvedValue({ id: 'req-1' }),
    },
    apiClient: {
      create: jest.fn().mockResolvedValue({ id: 'client-1' }),
      count: jest.fn().mockResolvedValue(5),
    },
    apiKey: {
      create: jest.fn().mockResolvedValue({ id: 'key-1' }),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
    },
    webhookEndpoint: {
      create: jest.fn().mockResolvedValue({ id: 'ep-1', secretKey: 'secret' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    webhookDelivery: {
      create: jest.fn().mockResolvedValue({ id: 'del-1' }),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    integrationProvider: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      createMany: jest.fn(),
    },
    integrationCredential: {
      upsert: jest.fn().mockResolvedValue({ id: 'cred-1', status: 'ACTIVE' }),
      update: jest.fn().mockResolvedValue({ id: 'cred-1' }),
    },
    integrationLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      count: jest.fn().mockResolvedValue(10),
    },
    notificationTemplate: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(3),
    },
    syncJob: {
      create: jest.fn().mockResolvedValue({ id: 'job-1' }),
      update: jest.fn().mockResolvedValue({ id: 'job-1', status: 'COMPLETED' }),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([]),
    },
    customer: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'c-1', firstName: 'John', lastName: 'Doe' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    invoice: {
      findUnique: jest.fn().mockResolvedValue({ id: 'inv-1', total: 150 }),
    },
    part: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'part-1', sku: 'SKU-1', name: 'Screen' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    journalEntry: {
      count: jest.fn().mockResolvedValue(12),
    },
    notification: {
      count: jest.fn().mockResolvedValue(20),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        ApiGatewayService,
        WebhookService,
        IntegrationService,
        PaymentConnectorService,
        MessagingConnectorService,
        AccountingConnectorService,
        MarketplaceConnectorService,
        NotificationHubService,
        SyncEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    idempotencyService = module.get<IdempotencyService>(IdempotencyService);
    apiGatewayService = module.get<ApiGatewayService>(ApiGatewayService);
    webhookService = module.get<WebhookService>(WebhookService);
    integrationService = module.get<IntegrationService>(IntegrationService);
    paymentConnector = module.get<PaymentConnectorService>(
      PaymentConnectorService,
    );
    messagingConnector = module.get<MessagingConnectorService>(
      MessagingConnectorService,
    );
    accountingConnector = module.get<AccountingConnectorService>(
      AccountingConnectorService,
    );
    marketplaceConnector = module.get<MarketplaceConnectorService>(
      MarketplaceConnectorService,
    );
    notificationHubService = module.get<NotificationHubService>(
      NotificationHubService,
    );
    syncEngineService = module.get<SyncEngineService>(SyncEngineService);
  });

  describe('IdempotencyService', () => {
    it('should generate hash and register new idempotency lock', async () => {
      mockPrismaService.idempotencyKey.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.idempotencyKey.create.mockResolvedValueOnce({
        id: 'key-1',
      });

      const res = await idempotencyService.evaluateIdempotency(
        'idem-123',
        '/test',
        { amount: 100 },
      );
      expect(res.isReplay).toBe(false);
    });

    it('should detect replay and return cached response', async () => {
      mockPrismaService.idempotencyKey.findUnique.mockResolvedValueOnce({
        id: 'key-1',
        isLocked: false,
        expiresAt: new Date(Date.now() + 100000),
        responseStatus: 200,
        responseBody: { success: true },
      });

      const res = await idempotencyService.evaluateIdempotency(
        'idem-123',
        '/test',
        { amount: 100 },
      );
      expect(res.isReplay).toBe(true);
      expect(res.responseBody).toEqual({ success: true });
    });
  });

  describe('ApiGatewayService', () => {
    it('should generate client and hashed API key', async () => {
      const res = await apiGatewayService.createApiKey('TestClient', 'user-1');
      expect(res.rawApiKey).toContain('tz_live_');
      expect(res.clientKey).toContain('client_');
    });
  });

  describe('WebhookService', () => {
    it('should calculate and verify HMAC SHA-256 signatures', () => {
      const payload = { event: 'ticket.created', id: 't-1' };
      const secret = 'whsec_secret123';
      const sig = webhookService.calculateSignature(payload, secret);
      expect(sig).toBeDefined();
      const valid = webhookService.verifySignature(payload, sig, secret);
      expect(valid).toBe(true);
    });
  });

  describe('IntegrationService', () => {
    it('should encrypt and decrypt credentials via AES-256-GCM', () => {
      const plain = 'secret-api-key-12345';
      const enc = integrationService.encryptSecret(plain);
      expect(enc).not.toEqual(plain);
      const dec = integrationService.decryptSecret(enc);
      expect(dec).toEqual(plain);
    });
  });

  describe('Connectors (Payment, Messaging, Accounting, Marketplace)', () => {
    it('should execute payment in sandbox mode', async () => {
      const res = await paymentConnector.processPayment(
        'STRIPE',
        150,
        'USD',
        'CREDIT_CARD',
        'SANDBOX',
      );
      expect(res.success).toBe(true);
      expect(res.environment).toBe('SANDBOX');
      expect(res.data.status).toBe('PAID');
    });

    it('should send SMS via messaging connector', async () => {
      const res = await messagingConnector.sendSms(
        '+1234567890',
        'Hello SMS',
        'SANDBOX',
      );
      expect(res.success).toBe(true);
      expect(res.data.recipientPhone).toBe('+1234567890');
    });

    it('should sync customer via accounting connector', async () => {
      const res = await accountingConnector.syncCustomer(
        'QUICKBOOKS',
        'c-1',
        'SANDBOX',
      );
      expect(res.success).toBe(true);
      expect(res.data.syncStatus).toBe('SYNCED');
    });

    it('should sync product via marketplace connector', async () => {
      const res = await marketplaceConnector.syncProduct(
        'SHOPIFY',
        'part-1',
        'SANDBOX',
      );
      expect(res.success).toBe(true);
      expect(res.data.syncStatus).toBe('SYNCED');
    });
  });

  describe('NotificationHubService', () => {
    it('should render template placeholders correctly', () => {
      const rendered = notificationHubService.renderTemplate(
        'Hello {{ name }}, ticket {{ id }} is ready',
        {
          name: 'Alex',
          id: 'TZ-101',
        },
      );
      expect(rendered).toBe('Hello Alex, ticket TZ-101 is ready');
    });
  });

  describe('SyncEngineService', () => {
    it('should trigger sync job and complete successfully', async () => {
      const res = await syncEngineService.triggerSync(
        'QUICKBOOKS',
        'FULL',
        'CUSTOMER',
        'SANDBOX',
      );
      expect(res.status).toBe('COMPLETED');
    });
  });
});
