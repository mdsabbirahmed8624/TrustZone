import { Test, TestingModule } from '@nestjs/testing';
import { TemplateEngineService } from './services/template-engine.service';
import { NotificationOrchestratorService } from './services/notification-orchestrator.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { PushProviderFactory } from './providers/push-provider.factory';
import { ConfigService } from '@nestjs/config';
import { AttachmentStorageService } from './services/attachment-storage.service';
import { RedisLockService } from './services/redis-lock.service';
import { MonitoringDashboardService } from './services/monitoring-dashboard.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { AiNotificationGeneratorService } from './services/ai-generator.service';
import { OtelService } from './services/otel.service';
import { EventBusService } from './services/event-bus.service';
describe('Notification and Real-time Core Platforms', () => {
  let templateEngine: TemplateEngineService;
  let orchestrator: NotificationOrchestratorService;
  let prisma: PrismaService;

  const mockPrisma = {
    notificationTemplate: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'notif-1', ...args.data }),
        ),
      update: jest.fn(),
      count: jest.fn(),
    },
    notificationPreference: {
      findUnique: jest.fn(),
    },
    pushDevice: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
    },
    notificationAnalytics: {
      create: jest.fn(),
    },
    notificationRetry: {
      create: jest.fn(),
    },
    deviceEvent: {
      create: jest.fn(),
    },
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockGateway = {
    server: {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    },
  };

  const mockPushFactory = {
    getProvider: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateEngineService,
        NotificationOrchestratorService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: RealtimeGateway, useValue: mockGateway },
        { provide: PushProviderFactory, useValue: mockPushFactory },
        { provide: ConfigService, useValue: { get: () => 'key' } },
      ],
    }).compile();

    templateEngine = module.get<TemplateEngineService>(TemplateEngineService);
    orchestrator = module.get<NotificationOrchestratorService>(
      NotificationOrchestratorService,
    );
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('Template Compiler Engine', () => {
    it('should correctly replace variables in layout text', () => {
      const template =
        'Hello {{firstName}}, your ticket #{{ticketId}} has been resolved.';
      const res = templateEngine.compile(template, {
        firstName: 'Alice',
        ticketId: '987',
      });
      expect(res).toBe('Hello Alice, your ticket #987 has been resolved.');
    });

    it('should handle conditionals matching truthy variables', () => {
      const template =
        'Dear Customer, {{#if amount}}your invoice total is ${{amount}}{{/if}} thanks!';
      const res = templateEngine.compile(template, { amount: 150 });
      expect(res).toBe('Dear Customer, your invoice total is $150 thanks!');
    });

    it('should strip conditional text if variable is missing or falsy', () => {
      const template = 'Hello {{#if amount}}your total is {{amount}}{{/if}}!';
      const res = templateEngine.compile(template, {});
      expect(res).toBe('Hello !');
    });
  });

  describe('Notification Channel Orchestrator', () => {
    it('should fall back from WEBSOCKET to PUSH if user is offline', async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValueOnce({
        id: 'temp-1',
        code: 'TEST_ALERT',
        titleLayout: 'Title',
        bodyLayout: 'Body',
        channel: 'WEBSOCKET',
      });
      mockPrisma.notificationPreference.findUnique.mockResolvedValueOnce(null);
      mockRedis.get.mockResolvedValueOnce(null); // User is offline
      mockPrisma.pushDevice.findMany.mockResolvedValueOnce([
        {
          id: 'device-1',
          provider: 'FCM',
          pushToken: 'token-1',
          deviceFingerprint: 'fp-1',
        },
      ]);

      const res = await orchestrator.sendNotification(
        'user-1',
        'TEST_ALERT',
        {},
      );
      expect(res).toBeDefined();
      expect(res.channel).toBe('PUSH'); // Fell back
    });

    it('should respect muted category user preferences', async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValueOnce({
        id: 'temp-1',
        code: 'TEST_ALERT',
        titleLayout: 'Title',
        bodyLayout: 'Body',
        channel: 'WEBSOCKET',
      });
      mockPrisma.notificationPreference.findUnique.mockResolvedValueOnce({
        mutedCategories: ['TEST_ALERT'],
      });

      const res = await orchestrator.sendNotification(
        'user-1',
        'TEST_ALERT',
        {},
      );
      expect(res).toBeNull(); // Muted
    });
  });

  describe('Enterprise Dashboard, Storage, AI drafts, Lock, Scheduler, and Event Bus', () => {
    let storage: AttachmentStorageService;
    let lock: RedisLockService;
    let dashboard: MonitoringDashboardService;
    let scheduler: NotificationSchedulerService;
    let aiGenerator: AiNotificationGeneratorService;
    let otel: OtelService;
    let eventBus: EventBusService;

    beforeEach(() => {
      const configServiceMock = { get: jest.fn().mockReturnValue('LOCAL') };
      storage = new AttachmentStorageService(configServiceMock as any);
      lock = new RedisLockService(mockRedis as any);
      dashboard = new MonitoringDashboardService(mockPrisma as any);
      scheduler = new NotificationSchedulerService(mockPrisma as any);
      aiGenerator = new AiNotificationGeneratorService();
      otel = new OtelService(mockRedis as any);
      eventBus = new EventBusService(mockRedis as any);
    });

    it('should upload file buffer using Storage provider', async () => {
      const url = await storage.storeAttachment(
        Buffer.from('hello pdf'),
        'invoice.pdf',
        'application/pdf',
      );
      expect(url).toContain('invoice.pdf');
    });

    it('should acquire and release Redis Lock successfully', async () => {
      mockRedis.set.mockResolvedValueOnce('OK');
      const acquired = await lock.acquireLock('job-key');
      expect(acquired).toBe(true);

      mockRedis.del.mockResolvedValueOnce(1);
      await lock.releaseLock('job-key');
    });

    it('should detect duplicate notification using hash comparison', async () => {
      mockRedis.get.mockResolvedValueOnce('1');
      const isDuplicate = await lock.isDuplicateNotification(
        'user-1',
        'content-hash-abc',
      );
      expect(isDuplicate).toBe(true);
    });

    it('should calculate live metrics and SLAs correctly', async () => {
      mockPrisma.notification.count.mockResolvedValue(10);
      const live = await dashboard.getLiveDeliveryMetrics();
      expect(live.totalSent).toBe(10);
    });

    it('should generate draft message using AI generator foundation', async () => {
      const draft = await aiGenerator.generateNotificationDraft(
        'Please draft a repair completed alert',
      );
      expect(draft.title).toContain('Repair Completed');
    });

    it('should schedule notification using scheduler parser', async () => {
      const dateStr = new Date(Date.now() + 100000).toISOString();
      const job = await scheduler.scheduleNotification(
        'user-1',
        'REPAIR_ALERT',
        {},
        dateStr,
      );
      expect(job).toBeDefined();
    });
  });
});
