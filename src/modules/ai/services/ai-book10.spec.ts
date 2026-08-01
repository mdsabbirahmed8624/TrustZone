import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PredictionService } from './prediction.service';
import { RecommendationService } from './recommendation.service';
import { MaintenancePredictionService } from './maintenance-prediction.service';
import { TechnicianRecommendationService } from './technician-recommendation.service';
import { InventoryIntelligenceService } from './inventory-intelligence.service';
import { ProcurementIntelligenceService } from './procurement-intelligence.service';
import { CustomerInsightService } from './customer-insight.service';
import { KnowledgeEngineService } from './knowledge-engine.service';
import { AutomationEngineService } from './automation-engine.service';

describe('AI & Predictions Unit Tests (Book 10)', () => {
  let predictionService: PredictionService;
  let recommendationService: RecommendationService;
  let maintenanceService: MaintenancePredictionService;
  let techService: TechnicianRecommendationService;
  let inventoryService: InventoryIntelligenceService;
  let procurementService: ProcurementIntelligenceService;
  let customerService: CustomerInsightService;
  let knowledgeService: KnowledgeEngineService;
  let automationService: AutomationEngineService;

  const mockPrismaService = {
    ticket: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    part: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    inventoryItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    inventoryMovement: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    purchaseOrderItem: {
      findMany: jest.fn(),
    },
    customerFeedback: {
      findMany: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    repairPrediction: {
      create: jest.fn(),
    },
    predictionHistory: {
      create: jest.fn(),
    },
    recommendationHistory: {
      create: jest.fn(),
    },
    customerInsight: {
      upsert: jest.fn(),
    },
    demandForecast: {
      create: jest.fn(),
    },
    knowledgeArticle: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    knowledgeSearch: {
      create: jest.fn(),
    },
    automationRule: {
      findMany: jest.fn(),
    },
    automationExecution: {
      create: jest.fn(),
    },
    deviceDiagnostic: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionService,
        RecommendationService,
        MaintenancePredictionService,
        TechnicianRecommendationService,
        InventoryIntelligenceService,
        ProcurementIntelligenceService,
        CustomerInsightService,
        KnowledgeEngineService,
        AutomationEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    predictionService = module.get<PredictionService>(PredictionService);
    recommendationService = module.get<RecommendationService>(
      RecommendationService,
    );
    maintenanceService = module.get<MaintenancePredictionService>(
      MaintenancePredictionService,
    );
    techService = module.get<TechnicianRecommendationService>(
      TechnicianRecommendationService,
    );
    inventoryService = module.get<InventoryIntelligenceService>(
      InventoryIntelligenceService,
    );
    procurementService = module.get<ProcurementIntelligenceService>(
      ProcurementIntelligenceService,
    );
    customerService = module.get<CustomerInsightService>(
      CustomerInsightService,
    );
    knowledgeService = module.get<KnowledgeEngineService>(
      KnowledgeEngineService,
    );
    automationService = module.get<AutomationEngineService>(
      AutomationEngineService,
    );

    jest.clearAllMocks();
  });

  describe('PredictionService', () => {
    it('should predict Apple device screen replacement fault', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        device: { brand: 'Apple', model: 'iPhone 13' },
      });
      mockPrismaService.repairPrediction.create.mockImplementation(
        ({ data }) => ({ id: 'pred-1', ...data }),
      );

      const res = await predictionService.predictFault('ticket-1');
      expect(res.probableFault).toBe('Screen Assembly Assembly Replacement');
      expect(res.estimatedComplexity).toBe('MEDIUM');
      expect(res.confidenceScore).toBe(89.2);
    });

    it('should predict generic battery replacement fault', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-2',
        device: { brand: 'Samsung', model: 'Galaxy S21' },
      });
      mockPrismaService.repairPrediction.create.mockImplementation(
        ({ data }) => ({ id: 'pred-2', ...data }),
      );

      const res = await predictionService.predictFault('ticket-2');
      expect(res.probableFault).toBe('Battery Replacement');
      expect(res.estimatedComplexity).toBe('LOW');
    });
  });

  describe('RecommendationService', () => {
    it('should recommend compatible alternatives for a part', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue({
        id: 'part-1',
        name: 'iPhone 13 Battery',
        category: 'Battery',
        brandCompatibility: 'Apple',
        minimumStockBuffer: 5,
      });
      mockPrismaService.part.findMany.mockResolvedValue([
        { id: 'part-2', name: 'iPhone 13 Pro Battery' },
      ]);
      mockPrismaService.recommendationHistory.create.mockImplementation(
        ({ data }) => ({ id: 'rec-1', ...data }),
      );

      const res = await recommendationService.recommendParts('part-1');
      expect((res.recommendationData as any).compatibleAlternatives).toContain(
        'iPhone 13 Pro Battery',
      );
    });
  });

  describe('MaintenancePredictionService', () => {
    it('should predict high battery degradation risk', async () => {
      mockPrismaService.deviceDiagnostic.findMany.mockResolvedValue([
        { batteryHealth: 90, screenStatus: 'GOOD' },
      ]);
      mockPrismaService.predictionHistory.create.mockImplementation(
        ({ data }) => ({ id: 'maint-1', ...data }),
      );

      const res = await maintenanceService.predictDeviceFailures('device-1');
      expect(res.predictionType).toBe('BATTERY_DEGRADATION');
      expect(res.confidenceLevel).toBe(88.4);
    });
  });

  describe('TechnicianRecommendationService', () => {
    it('should score and recommend the technician with the least workload', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        branchId: 'branch-1',
        device: { brand: 'Apple' },
      });
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'tech-1',
          firstName: 'John',
          lastName: 'Doe',
          role: 'TECHNICIAN',
        },
      ]);
      mockPrismaService.ticket.count.mockResolvedValue(1); // 1 active job
      mockPrismaService.recommendationHistory.create.mockImplementation(
        ({ data }) => ({ id: 'tech-rec-1', ...data }),
      );

      const res = await techService.recommendTechnician('ticket-1');
      expect((res.recommendationData as any).bestCandidate.name).toBe(
        'John Doe',
      );
      expect((res.recommendationData as any).bestCandidate.score).toBe(90);
    });
  });

  describe('InventoryIntelligenceService', () => {
    it('should forecast future part demand', async () => {
      mockPrismaService.inventoryMovement.findMany.mockResolvedValue([
        { quantityDelta: -10, type: 'OUT' },
      ]);
      mockPrismaService.demandForecast.create.mockImplementation(
        ({ data }) => ({ id: 'forecast-1', ...data }),
      );

      const res = await inventoryService.predictDemand('part-1');
      expect(res.projectedDemand).toBe(2); // (10 / 6) * 1.15 rounded = 2
    });
  });

  describe('ProcurementIntelligenceService', () => {
    it('should recommend preferred suppliers based on cost averages', async () => {
      mockPrismaService.purchaseOrderItem.findMany.mockResolvedValue([
        {
          quantity: 5,
          unitCost: 10,
          purchaseOrder: {
            supplier: { id: 'supplier-1', name: 'Supplier A' },
          },
        },
      ]);
      mockPrismaService.recommendationHistory.create.mockImplementation(
        ({ data }) => ({ id: 'proc-rec-1', ...data }),
      );

      const res = await procurementService.recommendPreferredSupplier('part-1');
      expect((res.recommendationData as any).preferredSupplier.name).toBe(
        'Supplier A',
      );
    });
  });

  describe('CustomerInsightService', () => {
    it('should calculate customer insights and churn probability', async () => {
      mockPrismaService.ticket.count.mockResolvedValue(5);
      mockPrismaService.customerFeedback.findMany.mockResolvedValue([
        { rating: 5 },
      ]);
      mockPrismaService.ticket.findMany.mockResolvedValue([]);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);
      mockPrismaService.customerInsight.upsert.mockImplementation(
        ({ create }) => ({ id: 'insight-1', ...create }),
      );

      const res = await customerService.calculateInsights('cust-1');
      expect(res.churnRisk).toBe(0); // 100 - 5 * 20 = 0
      expect(res.satisfactionScore).toBe(5);
    });
  });

  describe('KnowledgeEngineService', () => {
    it('should search for matching articles and log query', async () => {
      mockPrismaService.knowledgeArticle.findMany.mockResolvedValue([
        { id: 'art-1', title: 'How to fix iPhone Screen' },
      ]);
      mockPrismaService.knowledgeSearch.create.mockResolvedValue({
        id: 'search-log-1',
      });

      const res = await knowledgeService.searchArticles(
        'iPhone Screen',
        'user-1',
      );
      expect(res[0].title).toContain('How to fix iPhone Screen');
    });
  });

  describe('AutomationEngineService', () => {
    it('should trigger rule executions and record history log', async () => {
      mockPrismaService.automationRule.findMany.mockResolvedValue([
        {
          id: 'rule-1',
          name: 'Low Stock Alert',
          triggerEvent: 'STOCK_BELOW_THRESHOLD',
          conditions: [],
        },
      ]);
      mockPrismaService.automationExecution.create.mockResolvedValue({
        id: 'exec-1',
      });

      const res = await automationService.triggerRuleEvaluation(
        'STOCK_BELOW_THRESHOLD',
        { partId: 'part-1' },
      );
      expect(res.rulesEvaluated).toBe(1);
      expect(res.executions[0].status).toBe('SUCCESS');
    });
  });
});
