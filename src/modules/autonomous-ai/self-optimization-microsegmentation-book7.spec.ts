import { Test, TestingModule } from '@nestjs/testing';
import { SelfOptimizationBook7Service } from './services/self-optimization-book7.service';
import { SelfOptimizationBook7Controller } from './controllers/self-optimization-book7.controller';
import { SovereignMicrosegmentationBook7Service } from './services/sovereign-microsegmentation-book7.service';
import { SovereignMicrosegmentationBook7Controller } from './controllers/sovereign-microsegmentation-book7.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 7 — Autonomous Self-Optimization Analytics & Sovereign Microsegmentation', () => {
  let optService: SelfOptimizationBook7Service;
  let optController: SelfOptimizationBook7Controller;
  let microService: SovereignMicrosegmentationBook7Service;
  let microController: SovereignMicrosegmentationBook7Controller;

  const mockPrismaService = {
    autonomousSelfOptimizationAnalyticsBook7: {
      upsert: jest.fn().mockResolvedValue({
        id: 'opt-uuid-001',
        optimizationCode: 'OPT-ANALYTICS-P14-B7-01',
        targetModel: 'LLM_INFERENCE_ENGINE',
        hyperParameterConfigJson: '{"learningRate": 0.001, "batchSize": 64}',
        efficiencyGainPercent: 21.4,
        evaluationStatus: 'PASSED',
        evaluatedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'opt-uuid-001',
          optimizationCode: 'OPT-ANALYTICS-P14-B7-01',
          targetModel: 'LLM_INFERENCE_ENGINE',
          hyperParameterConfigJson: '{"learningRate": 0.001, "batchSize": 64}',
          efficiencyGainPercent: 21.4,
          evaluationStatus: 'PASSED',
          evaluatedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    sovereignMicrosegmentationBook7: {
      create: jest.fn().mockResolvedValue({
        id: 'micro-uuid-001',
        segmentCode: 'SOV-SEG-P14-B7-01',
        workloadGroup: 'ENTERPRISE_ROBOTICS',
        sourceSegment: 'EDGE_INGRESS',
        targetSegment: 'QUANTUM_DB_TIER',
        allowedPortsJson: '[5432, 6379, 4000]',
        enforcementStatus: 'STRICT_ENFORCED',
        createdDate: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'micro-uuid-001',
          segmentCode: 'SOV-SEG-P14-B7-01',
          workloadGroup: 'ENTERPRISE_ROBOTICS',
          sourceSegment: 'EDGE_INGRESS',
          targetSegment: 'QUANTUM_DB_TIER',
          allowedPortsJson: '[5432, 6379, 4000]',
          enforcementStatus: 'STRICT_ENFORCED',
          createdDate: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        SelfOptimizationBook7Controller,
        SovereignMicrosegmentationBook7Controller,
      ],
      providers: [
        SelfOptimizationBook7Service,
        SovereignMicrosegmentationBook7Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    optService = module.get<SelfOptimizationBook7Service>(
      SelfOptimizationBook7Service,
    );
    optController = module.get<SelfOptimizationBook7Controller>(
      SelfOptimizationBook7Controller,
    );
    microService = module.get<SovereignMicrosegmentationBook7Service>(
      SovereignMicrosegmentationBook7Service,
    );
    microController = module.get<SovereignMicrosegmentationBook7Controller>(
      SovereignMicrosegmentationBook7Controller,
    );
  });

  // Instantiation tests
  it('should be defined — SelfOptimizationBook7Service', () => {
    expect(optService).toBeDefined();
  });

  it('should be defined — SelfOptimizationBook7Controller', () => {
    expect(optController).toBeDefined();
  });

  it('should be defined — SovereignMicrosegmentationBook7Service', () => {
    expect(microService).toBeDefined();
  });

  it('should be defined — SovereignMicrosegmentationBook7Controller', () => {
    expect(microController).toBeDefined();
  });

  // Business logic tests
  it('should record self-optimization analytics', async () => {
    const result = await optService.recordOptimizationAnalytics({
      optimizationCode: 'OPT-ANALYTICS-P14-B7-01',
      targetModel: 'LLM_INFERENCE_ENGINE',
    });
    expect(result).toBeDefined();
    expect(result.optimizationCode).toBe('OPT-ANALYTICS-P14-B7-01');
    expect(result.evaluationStatus).toBe('PASSED');
  });

  it('should enforce sovereign microsegmentation policy', async () => {
    const result = await microService.enforcePolicy({
      segmentCode: 'SOV-SEG-P14-B7-01',
    });
    expect(result).toBeDefined();
    expect(result.segmentCode).toBe('SOV-SEG-P14-B7-01');
    expect(result.enforcementStatus).toBe('STRICT_ENFORCED');
  });

  // Controller list Delegation tests
  it('should list self-optimization analytics via controller', async () => {
    const result = await optController.getOptimizationAnalytics();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list microsegmentation policies via controller', async () => {
    const result = await microController.getPolicies();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
