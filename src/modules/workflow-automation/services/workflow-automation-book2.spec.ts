import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowEngineService } from './workflow-engine.service';
import { BackgroundJobService } from './background-job.service';
import { SchedulerEngineService } from './scheduler-engine.service';
import { EventAutomationService } from './event-automation.service';
import { RuleEngineService } from './rule-engine.service';
import { ApprovalService } from './approval.service';
import { ReminderService } from './reminder.service';
import { EscalationService } from './escalation.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Workflow Automation & Scheduler Unit Tests (Book 2)', () => {
  let workflowEngine: WorkflowEngineService;
  let backgroundJobService: BackgroundJobService;
  let schedulerEngine: SchedulerEngineService;
  let eventAutomation: EventAutomationService;
  let ruleEngine: RuleEngineService;
  let approvalService: ApprovalService;
  let reminderService: ReminderService;
  let escalationService: EscalationService;

  const mockPrismaService = {
    workflowDefinition: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'def-1', name: 'Service Ticket Workflow' }),
    },
    workflowVersion: {
      create: jest.fn().mockResolvedValue({ id: 'ver-1', versionNumber: 1 }),
      findFirst: jest.fn().mockResolvedValue({
        id: 'ver-1',
        versionNumber: 1,
        graphDefinition: { nodes: [{ name: 'Step 1' }] },
      }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'ver-1', versionNumber: 1 }),
      update: jest.fn().mockResolvedValue({ id: 'ver-1', status: 'PUBLISHED' }),
    },
    workflowExecution: {
      create: jest.fn().mockResolvedValue({ id: 'exec-1', status: 'RUNNING' }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'exec-1', status: 'COMPLETED' }),
      findUnique: jest.fn(),
    },
    workflowLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1', status: 'SUCCESS' }),
    },
    backgroundJob: {
      create: jest.fn().mockResolvedValue({
        id: 'job-1',
        status: 'PENDING',
        retryCount: 0,
        maxRetries: 3,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 'job-1', status: 'COMPLETED' }),
      count: jest.fn().mockResolvedValue(5),
    },
    jobExecution: {
      create: jest.fn().mockResolvedValue({ id: 'job-exec-1' }),
    },
    scheduledTask: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'task-1', taskName: 'Daily Report' }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 'task-1' }),
    },
    businessRule: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'rule-1', name: 'Stock Alert Rule' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    approvalRequest: {
      create: jest.fn().mockResolvedValue({
        id: 'appr-1',
        status: 'PENDING',
        stepNumber: 1,
        totalSteps: 1,
      }),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'APPROVED' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    approvalHistory: {
      create: jest.fn().mockResolvedValue({ id: 'hist-1' }),
    },
    reminder: {
      create: jest.fn().mockResolvedValue({ id: 'rem-1', status: 'PENDING' }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 'rem-1', status: 'SENT' }),
    },
    escalationRule: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'esc-1', name: 'PO Timeout Rule' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowEngineService,
        BackgroundJobService,
        SchedulerEngineService,
        EventAutomationService,
        RuleEngineService,
        ApprovalService,
        ReminderService,
        EscalationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    workflowEngine = module.get<WorkflowEngineService>(WorkflowEngineService);
    backgroundJobService =
      module.get<BackgroundJobService>(BackgroundJobService);
    schedulerEngine = module.get<SchedulerEngineService>(
      SchedulerEngineService,
    );
    eventAutomation = module.get<EventAutomationService>(
      EventAutomationService,
    );
    ruleEngine = module.get<RuleEngineService>(RuleEngineService);
    approvalService = module.get<ApprovalService>(ApprovalService);
    reminderService = module.get<ReminderService>(ReminderService);
    escalationService = module.get<EscalationService>(EscalationService);
  });

  describe('WorkflowEngineService', () => {
    it('should create definition and initial draft version', async () => {
      const res = await workflowEngine.createDefinition(
        'Repair Workflow',
        'TICKETS',
        {},
        [],
      );
      expect(res.name).toBe('Service Ticket Workflow');
    });

    it('should execute published workflow graph instance', async () => {
      const res = await workflowEngine.executeWorkflow(
        'def-1',
        'TICKET_CREATED',
        't-100',
      );
      expect(res.execution.status).toBe('COMPLETED');
    });
  });

  describe('BackgroundJobService', () => {
    it('should enqueue job with priority', async () => {
      const job = await backgroundJobService.enqueueJob(
        'SEND_EMAIL',
        { to: 'test@mail.com' },
        'DEFAULT',
        'HIGH',
      );
      expect(job.id).toBe('job-1');
    });
  });

  describe('SchedulerEngineService', () => {
    it('should register cron task', async () => {
      const task = await schedulerEngine.registerTask(
        'DailyReport',
        '0 0 * * *',
        'GENERATE_REPORT',
      );
      expect(task.taskName).toBe('Daily Report');
    });
  });

  describe('EventAutomationService & RuleEngineService', () => {
    it('should evaluate rules and emit domain event', async () => {
      const res = await eventAutomation.emitEvent('TICKET_CREATED', {
        ticketId: 't-1',
      });
      expect(res.event).toBe('TICKET_CREATED');
      expect(res.automationJobId).toBe('job-1');
    });
  });

  describe('ApprovalService', () => {
    it('should submit approval request', async () => {
      const req = await approvalService.submitRequest(
        'PURCHASE_ORDER',
        'po-101',
        'SINGLE',
      );
      expect(req.id).toBe('appr-1');
    });

    it('should process approve decision', async () => {
      mockPrismaService.approvalRequest.findUnique.mockResolvedValueOnce({
        id: 'appr-1',
        status: 'PENDING',
        stepNumber: 1,
        totalSteps: 1,
      });

      const res = await approvalService.processDecision(
        'appr-1',
        'APPROVE',
        'user-1',
        'Admin',
      );
      expect(res.status).toBe('APPROVED');
    });
  });

  describe('ReminderService & EscalationService', () => {
    it('should schedule multi-channel reminder', async () => {
      const rem = await reminderService.scheduleReminder(
        'test@test.com',
        'EMAIL',
        'Ticket updated',
        new Date(),
      );
      expect(rem.id).toBe('rem-1');
    });

    it('should create SLA escalation rule', async () => {
      const rule = await escalationService.createRule(
        'SLA Breach Rule',
        'TICKETS',
        24,
        'MANAGER',
      );
      expect(rule.id).toBe('esc-1');
    });
  });
});
