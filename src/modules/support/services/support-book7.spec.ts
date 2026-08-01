import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { WarrantyService } from './warranty.service';
import { SLAService } from './sla.service';
import { EscalationService } from './escalation.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ComplaintService } from './complaint.service';
import { FeedbackService } from './feedback.service';
import { SurveyService } from './survey.service';
import { SupportAnalyticsService } from './support-analytics.service';
import { HelpDeskService } from './help-desk.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Enterprise Support Platform Unit Tests (Book 7)', () => {
  let ticketService: TicketService;
  let warrantyService: WarrantyService;
  let slaService: SLAService;
  let escalationService: EscalationService;
  let kbService: KnowledgeBaseService;
  let complaintService: ComplaintService;
  let feedbackService: FeedbackService;
  let surveyService: SurveyService;
  let analyticsService: SupportAnalyticsService;
  let helpDeskService: HelpDeskService;

  const mockPrismaService = {
    supportTicket: {
      create: jest.fn().mockResolvedValue({
        id: 'tkt-1',
        ticketNumber: 'TKT-1001',
        subject: 'Display Issue',
        status: 'OPEN',
        priority: 'MEDIUM',
        channel: 'WEB_PORTAL',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'tkt-1',
        ticketNumber: 'TKT-1001',
        subject: 'Display Issue',
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: new Date(),
      }),
      update: jest.fn().mockResolvedValue({
        id: 'tkt-1',
        ticketNumber: 'TKT-1001',
        status: 'RESOLVED',
        assignedToId: 'agent-1',
        isSlaBreached: false,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(10),
    },
    ticketTimeline: {
      create: jest.fn().mockResolvedValue({ id: 'tl-1', eventType: 'CREATED' }),
    },
    ticketComment: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'cm-1', comment: 'Checking display panel' }),
    },
    warranty: {
      create: jest.fn().mockResolvedValue({
        id: 'war-1',
        warrantyCode: 'WAR-8821',
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() + 864000000),
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'war-1',
        warrantyCode: 'WAR-8821',
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() + 864000000),
      }),
    },
    warrantyClaim: {
      create: jest.fn().mockResolvedValue({
        id: 'clm-1',
        claimNumber: 'CLM-5501',
        status: 'UNDER_REVIEW',
      }),
      update: jest.fn().mockResolvedValue({ id: 'clm-1', status: 'APPROVED' }),
      count: jest.fn().mockResolvedValue(2),
    },
    sLA: {
      upsert: jest.fn().mockResolvedValue({
        id: 'sla-1',
        priority: 'HIGH',
        targetResponseHours: 2,
        targetResolutionHours: 12,
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'sla-1',
        priority: 'HIGH',
        targetResponseHours: 2,
        targetResolutionHours: 12,
      }),
    },
    sLAHistory: {
      create: jest.fn().mockResolvedValue({ id: 'slah-1', isBreached: false }),
    },
    escalationHistory: {
      create: jest.fn().mockResolvedValue({ id: 'esc-1', level: 1 }),
    },
    knowledgeCategory: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'kc-1', name: 'Troubleshooting' }),
    },
    knowledgeArticle: {
      create: jest.fn().mockResolvedValue({
        id: 'art-1',
        title: 'How to Reset Device',
        category: 'Troubleshooting',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    fAQ: {
      upsert: jest.fn().mockResolvedValue({
        id: 'faq-1',
        question: 'What is repair warranty?',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    customerComplaint: {
      create: jest.fn().mockResolvedValue({
        id: 'cmp-1',
        complaintNumber: 'CMP-101',
        status: 'SUBMITTED',
      }),
      update: jest.fn().mockResolvedValue({ id: 'cmp-1', status: 'RESOLVED' }),
    },
    customerFeedback: {
      create: jest.fn().mockResolvedValue({ id: 'fb-1', rating: 5 }),
    },
    satisfactionSurvey: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'sur-1', rating: 5, npsScore: 10 }),
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([{ rating: 5, npsScore: 10 }]),
    },
    ticketAssignment: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'ta-1', assignedTo: 'agent-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        WarrantyService,
        SLAService,
        EscalationService,
        KnowledgeBaseService,
        ComplaintService,
        FeedbackService,
        SurveyService,
        SupportAnalyticsService,
        HelpDeskService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    ticketService = module.get<TicketService>(TicketService);
    warrantyService = module.get<WarrantyService>(WarrantyService);
    slaService = module.get<SLAService>(SLAService);
    escalationService = module.get<EscalationService>(EscalationService);
    kbService = module.get<KnowledgeBaseService>(KnowledgeBaseService);
    complaintService = module.get<ComplaintService>(ComplaintService);
    feedbackService = module.get<FeedbackService>(FeedbackService);
    surveyService = module.get<SurveyService>(SurveyService);
    analyticsService = module.get<SupportAnalyticsService>(
      SupportAnalyticsService,
    );
    helpDeskService = module.get<HelpDeskService>(HelpDeskService);
  });

  describe('Ticket & Help Desk Services', () => {
    it('should create support ticket and add comment', async () => {
      const tkt = await ticketService.createTicket({
        subject: 'Display Issue',
        description: 'Screen flickering',
      });
      const comment = await ticketService.addComment(
        tkt.id,
        'Checking display connector',
        'Tech Lead',
      );
      expect(tkt.subject).toBe('Display Issue');
      expect(comment.comment).toBeDefined();
    });

    it('should assign ticket to support agent', async () => {
      const res = await helpDeskService.assignTicket(
        'tkt-1',
        'agent-1',
        'High load queue',
      );
      expect(res.assignedToId).toBe('agent-1');
    });
  });

  describe('SLA, Escalation & Warranty Services', () => {
    it('should evaluate ticket SLA target compliance', async () => {
      const res = await slaService.evaluateTicketSLA('tkt-1');
      expect(res.isBreached).toBe(false);
    });

    it('should escalate ticket to manager', async () => {
      const esc = await escalationService.escalateTicket(
        'tkt-1',
        'Support Lead',
        'No response in 2h',
        1,
      );
      expect(esc.level).toBe(1);
    });

    it('should register warranty and submit claim', async () => {
      const war = await warrantyService.registerWarranty({
        warrantyCode: 'WAR-8821',
        durationMonths: 12,
      });
      const claim = await warrantyService.submitClaim(
        war.id,
        'Screen dead pixels',
      );
      expect(claim.status).toBe('UNDER_REVIEW');
    });
  });

  describe('Knowledge Base, Complaint & CSAT Analytics', () => {
    it('should create KB article and search FAQs', async () => {
      const art = await kbService.createArticle({
        title: 'How to Reset Device',
        content: 'Hold power button',
        category: 'Troubleshooting',
      });
      expect(art.title).toBe('How to Reset Device');
    });

    it('should submit customer complaint and CSAT survey', async () => {
      const cmp = await complaintService.submitComplaint(
        'cust-1',
        'Delayed repair',
        'Device not returned on time',
      );
      const sur = await surveyService.submitSurvey('cust-1', 5, 10);
      expect(cmp.status).toBe('SUBMITTED');
      expect(sur.rating).toBe(5);
    });

    it('should return executive support analytics metrics', async () => {
      const dash = await analyticsService.getExecutiveDashboard();
      expect(dash.overview.totalTickets).toBe(10);
      expect(dash.overview.slaCompliancePercentage).toBeDefined();
    });
  });
});
