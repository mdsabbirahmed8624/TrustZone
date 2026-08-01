import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseSettlementBook7Service } from './services/franchise-settlement-book7.service';
import { SelfOptimizationBook7Service } from '../autonomous-ai/services/self-optimization-book7.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 7 Unit Tests (Franchise Royalty Settlement & AI Self-Optimization)', () => {
  let settlementService: FranchiseSettlementBook7Service;
  let optimizationService: SelfOptimizationBook7Service;

  const mockPrisma = {
    franchiseRoyaltySettlementBook7: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'settle-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    autonomousSelfOptimizationAnalyticsBook7: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'opt-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FranchiseSettlementBook7Service,
        SelfOptimizationBook7Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    settlementService = module.get<FranchiseSettlementBook7Service>(
      FranchiseSettlementBook7Service,
    );
    optimizationService = module.get<SelfOptimizationBook7Service>(
      SelfOptimizationBook7Service,
    );
    jest.clearAllMocks();
  });

  it('should process franchise royalty settlement Book 7', async () => {
    const settlement = await settlementService.processSettlement({
      settlementCode: 'SETTLE-FRAN-2026-Q3-01',
      franchiseOrgId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(settlement.escrowStatus).toBe('ESCROW_RELEASED');
    expect(settlement.netRoyaltyAmount).toBe(12500.0);
  });

  it('should record autonomous AI self-optimization analytics log Book 7', async () => {
    const opt = await optimizationService.recordOptimizationAnalytics({
      optimizationCode: 'OPT-ANALYTICS-LLM-01',
      targetModel: 'LLM_INFERENCE_ENGINE',
    });

    expect(opt.evaluationStatus).toBe('PASSED');
    expect(opt.efficiencyGainPercent).toBe(21.4);
  });
});
