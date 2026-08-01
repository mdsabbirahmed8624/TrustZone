import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 2 - Enterprise Workflow Automation & Scheduler (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

  const testEmail = `workflow-admin-${Date.now()}@test.com`;
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

    // Create verified SUPER_ADMIN user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Workflow',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    // Login user
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
      await prisma.reminder.deleteMany({});
      await prisma.approvalHistory.deleteMany({});
      await prisma.approvalRequest.deleteMany({});
      await prisma.escalationRule.deleteMany({});
      await prisma.businessRule.deleteMany({});
      await prisma.jobExecution.deleteMany({});
      await prisma.backgroundJob.deleteMany({});
      await prisma.scheduledTask.deleteMany({});
      await prisma.workflowLog.deleteMany({});
      await prisma.workflowExecution.deleteMany({});
      await prisma.workflowVersion.deleteMany({});
      await prisma.workflowDefinition.deleteMany({});
      await prisma.user
        .delete({ where: { email: testEmail } })
        .catch(() => null);
    }
    await app.close();
  });

  describe('Workflows Endpoints (/api/v1/workflows)', () => {
    let defId: string;

    it('POST /api/v1/workflows/definitions - should create workflow definition', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workflows/definitions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E2E Repair Workflow',
          module: 'TICKETS',
          triggerRule: { event: 'TICKET_CREATED' },
          steps: [{ name: 'Validate Intake', type: 'ACTION' }],
        })
        .expect(201);

      defId = res.body.id;
      expect(defId).toBeDefined();
      expect(res.body.name).toBe('E2E Repair Workflow');
    });

    it('POST /api/v1/workflows/:defId/publish - should publish workflow version', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/workflows/${defId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          versionNumber: 1,
          graphDefinition: { nodes: [{ name: 'Intake Node', type: 'ACTION' }] },
        })
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
    });

    it('POST /api/v1/workflows/:defId/execute - should execute workflow graph instance', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/workflows/${defId}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          triggerEvent: 'TICKET_CREATED',
          recordId: 'rec-100',
          variables: { priority: 'HIGH' },
        })
        .expect(200);

      expect(res.body.execution.status).toBe('COMPLETED');
      expect(res.body.stepLogs.length).toBeGreaterThan(0);
    });
  });

  describe('Background Jobs Endpoints (/api/v1/jobs)', () => {
    let jobId: string;

    it('POST /api/v1/jobs/enqueue - should enqueue background job with priority', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/jobs/enqueue')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobType: 'GENERATE_INVOICE_PDF',
          payload: { invoiceId: 'inv-99' },
          priority: 'HIGH',
        })
        .expect(201);

      jobId = res.body.id;
      expect(jobId).toBeDefined();
      expect(res.body.priority).toBe('HIGH');
    });

    it('POST /api/v1/jobs/process-next - should process next pending job', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/jobs/process-next')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ queueName: 'DEFAULT' })
        .expect(200);

      expect(res.body.status).toBe('COMPLETED');
    });

    it('GET /api/v1/jobs/health - should return worker health metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/jobs/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.workerNodeStatus).toBe('HEALTHY');
      expect(res.body.completedJobs).toBeGreaterThan(0);
    });
  });

  describe('Scheduler & Events Endpoints (/api/v1/scheduler & /api/v1/events)', () => {
    it('POST /api/v1/scheduler/tasks - should register cron task', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/scheduler/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskName: 'Daily Inventory Sync Task',
          cronExpression: '0 2 * * *',
          actionType: 'SYNC_INVENTORY',
        })
        .expect(201);

      expect(res.body.taskName).toBe('Daily Inventory Sync Task');
    });

    it('GET /api/v1/scheduler/calendar - should return job calendar', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/scheduler/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.totalScheduledTasks).toBeGreaterThan(0);
    });

    it('POST /api/v1/events/emit - should emit domain event and trigger automation', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/events/emit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          event: 'INVENTORY_LOW',
          payload: { partId: 'p-1', currentStock: 2 },
        })
        .expect(200);

      expect(res.body.event).toBe('INVENTORY_LOW');
      expect(res.body.automationJobId).toBeDefined();
    });
  });

  describe('Approvals & Reminders Endpoints (/api/v1/approvals & /api/v1/reminders)', () => {
    let approvalId: string;

    it('POST /api/v1/approvals/submit - should submit approval request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/approvals/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          resourceModule: 'EXPENSE',
          resourceId: 'exp-500',
          approvalType: 'SINGLE',
        })
        .expect(201);

      approvalId = res.body.id;
      expect(approvalId).toBeDefined();
      expect(res.body.status).toBe('PENDING');
    });

    it('POST /api/v1/approvals/:id/decision - should approve decision', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/approvals/${approvalId}/decision`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          decision: 'APPROVE',
          comments: 'Approved by E2E admin',
        })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('POST /api/v1/reminders/schedule - should schedule multi-channel reminder', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/reminders/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipient: 'user@test.com',
          channel: 'EMAIL',
          subject: 'SLA Alert',
          message: 'Your ticket SLA is approaching threshold',
          sendAt: new Date(Date.now() + 60000).toISOString(),
        })
        .expect(201);

      expect(res.body.channel).toBe('EMAIL');
    });
  });
});
