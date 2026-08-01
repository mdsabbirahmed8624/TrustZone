import { Test, TestingModule } from '@nestjs/testing';
import { LeadManagementService } from './lead-management.service';
import { OpportunityService } from './opportunity.service';
import { PipelineService } from './pipeline.service';
import { SalesAutomationService } from './sales-automation.service';
import { CampaignService } from './campaign.service';
import { CustomerJourneyService } from './customer-journey.service';
import { SegmentationService } from './segmentation.service';
import { CommunicationService } from './communication.service';
import { ReminderService } from './reminder.service';
import { CRMAnalyticsService } from './crm-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Enterprise CRM 2.0 Unit Tests (Book 5)', () => {
  let leadService: LeadManagementService;
  let opportunityService: OpportunityService;
  let pipelineService: PipelineService;
  let salesAutomationService: SalesAutomationService;
  let campaignService: CampaignService;
  let journeyService: CustomerJourneyService;
  let segmentationService: SegmentationService;
  let communicationService: CommunicationService;
  let reminderService: ReminderService;
  let analyticsService: CRMAnalyticsService;

  const mockPrismaService = {
    lead: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'lead-1',
        firstName: 'John',
        lastName: 'Doe',
        leadScore: 70,
        rating: 'HOT',
        status: 'NEW',
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(5),
      findUnique: jest.fn().mockResolvedValue({
        id: 'lead-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        status: 'NEW',
        tags: [],
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'lead-1', status: 'CONVERTED' }),
    },
    leadActivity: {
      create: jest.fn().mockResolvedValue({ id: 'act-1' }),
    },
    customer: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'cust-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'cust-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        loyaltyPoints: 100,
        tickets: [],
        feedbacks: [],
        communications: [],
        warranties: [],
      }),
      count: jest.fn().mockResolvedValue(20),
    },
    opportunityStage: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'stage-1',
        name: 'Proposal',
        probability: 50,
      }),
    },
    opportunity: {
      create: jest.fn().mockResolvedValue({
        id: 'opp-1',
        title: 'Corporate Fleet Deal',
        amount: 5000,
        expectedRevenue: 2500,
        probability: 50,
        stageId: 'stage-1',
        status: 'OPEN',
      }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'opp-1', amount: 5000, stageId: 'stage-1' }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'opp-1', status: 'WON', probability: 100 }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    salesPipeline: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'pipe-1',
        name: 'Standard Pipeline',
        stages: [
          {
            id: 'stage-1',
            name: 'Lead Qualified',
            displayOrder: 1,
            probability: 10,
          },
        ],
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'pipe-1',
        name: 'Standard Pipeline',
        stages: [
          {
            id: 'stage-1',
            name: 'Lead Qualified',
            displayOrder: 1,
            probability: 10,
          },
        ],
      }),
    },
    salesTask: {
      create: jest.fn().mockImplementation((args) =>
        Promise.resolve({
          id: 'task-1',
          title: args.data.title,
          status: 'PENDING',
          priority: args.data.priority || 'MEDIUM',
        }),
      ),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'task-1', status: 'COMPLETED' }),
    },
    campaign: {
      create: jest.fn().mockResolvedValue({
        id: 'camp-1',
        name: 'Summer Repair Sale',
        channel: 'EMAIL',
        status: 'DRAFT',
        budget: 500,
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'camp-1',
        name: 'Summer Repair Sale',
        channel: 'EMAIL',
        status: 'ACTIVE',
        budget: 500,
        actualCost: 300,
        revenueGenerated: 1500,
        members: [{ id: 'm-1', status: 'SENT' }],
      }),
      update: jest.fn().mockResolvedValue({ id: 'camp-1', status: 'ACTIVE' }),
      count: jest.fn().mockResolvedValue(2),
    },
    campaignMember: {
      createMany: jest.fn().mockResolvedValue({ count: 10 }),
      updateMany: jest.fn().mockResolvedValue({ count: 10 }),
    },
    marketingTemplate: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'tmpl-1', name: 'Discount Email' }),
    },
    customerJourney: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'j-1',
        customerId: 'cust-1',
        lifecycleStage: 'ACTIVE',
        lifetimeValue: 500,
        touchpoints: [],
      }),
    },
    customerTouchpoint: {
      create: jest.fn().mockResolvedValue({
        id: 'tp-1',
        channel: 'REPAIR_TICKET',
        title: 'iPhone Screen Repair',
      }),
    },
    customerSegment: {
      upsert: jest.fn().mockResolvedValue({ id: 'seg-1', name: 'VIPs' }),
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: 'seg-1', name: 'High Value VIPs' }]),
      update: jest.fn().mockResolvedValue({ id: 'seg-1', memberCount: 5 }),
      count: jest.fn().mockResolvedValue(4),
    },
    communicationHistory: {
      create: jest.fn().mockResolvedValue({
        id: 'comm-1',
        channel: 'SMS',
        content: 'Repair ready for pickup',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    followUpReminder: {
      create: jest.fn().mockResolvedValue({
        id: 'rem-1',
        title: 'Call back customer',
        status: 'PENDING',
      }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 'rem-1', status: 'SENT' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadManagementService,
        OpportunityService,
        PipelineService,
        SalesAutomationService,
        CampaignService,
        CustomerJourneyService,
        SegmentationService,
        CommunicationService,
        ReminderService,
        CRMAnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    leadService = module.get<LeadManagementService>(LeadManagementService);
    opportunityService = module.get<OpportunityService>(OpportunityService);
    pipelineService = module.get<PipelineService>(PipelineService);
    salesAutomationService = module.get<SalesAutomationService>(
      SalesAutomationService,
    );
    campaignService = module.get<CampaignService>(CampaignService);
    journeyService = module.get<CustomerJourneyService>(CustomerJourneyService);
    segmentationService = module.get<SegmentationService>(SegmentationService);
    communicationService =
      module.get<CommunicationService>(CommunicationService);
    reminderService = module.get<ReminderService>(ReminderService);
    analyticsService = module.get<CRMAnalyticsService>(CRMAnalyticsService);
  });

  describe('LeadManagement & Opportunity', () => {
    it('should create a lead with auto scoring', async () => {
      const lead = await leadService.createLead({
        firstName: 'John',
        lastName: 'Doe',
        company: 'Apple Inc',
        email: 'john@test.com',
        phone: '1234567890',
        estimatedValue: 1500,
      });

      expect(lead.leadScore).toBeGreaterThanOrEqual(70);
      expect(lead.rating).toBe('HOT');
    });

    it('should convert a lead into a customer and opportunity', async () => {
      const res = await leadService.convertLead('lead-1', {
        createOpportunity: true,
        stageId: 'stage-1',
      });
      expect(res.customer.id).toBe('cust-1');
      expect(res.lead.status).toBe('CONVERTED');
    });

    it('should create an opportunity with expected revenue calculation', async () => {
      const opp = await opportunityService.createOpportunity({
        title: 'Corporate Fleet Deal',
        amount: 5000,
        stageId: 'stage-1',
      });

      expect(opp.amount).toBe(5000);
      expect(opp.expectedRevenue).toBe(2500); // 50% of 5000
    });
  });

  describe('Pipeline & Sales Automation', () => {
    it('should return Kanban Board view', async () => {
      const board = await pipelineService.getKanbanBoard();
      expect(board.stages.length).toBeGreaterThan(0);
    });

    it('should trigger stage automation task', async () => {
      const task = await salesAutomationService.triggerStageAutomation(
        'opp-1',
        'Quote Sent',
      );
      expect(task.priority).toBe('HIGH');
    });
  });

  describe('Campaigns & ROI Analytics', () => {
    it('should calculate campaign ROI metrics', async () => {
      const stats = await campaignService.getCampaignAnalytics('camp-1');
      expect(stats.roiPercentage).toBe(400); // ((1500 - 300) / 300) * 100
    });
  });

  describe('Customer Journey & Segmentation', () => {
    it('should fetch 360 customer journey', async () => {
      const j = await journeyService.getCustomerJourney('cust-1');
      expect(j.customerId).toBe('cust-1');
    });

    it('should evaluate dynamic customer segments', async () => {
      const segs = await segmentationService.evaluateSegments();
      expect(segs.length).toBeGreaterThan(0);
    });
  });

  describe('CRM Analytics', () => {
    it('should return executive CRM dashboard analytics', async () => {
      const dash = await analyticsService.getDashboardAnalytics();
      expect(dash.overview.totalLeads).toBe(5);
      expect(dash.aiInsights.predictedMonthlyRevenue).toBeDefined();
    });
  });
});
