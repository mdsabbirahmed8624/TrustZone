import { Test, TestingModule } from '@nestjs/testing';
import { SystemAuditBook5Service } from './services/system-audit-book5.service';
import { AutonomousAIBook5Service } from '../autonomous-ai/services/autonomous-ai-book5.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 5 Unit Tests (Production GA Audit & AI Model Tuning)', () => {
  let auditService: SystemAuditBook5Service;
  let aiService: AutonomousAIBook5Service;

  const mockPrisma = {
    enterpriseSystemAudit: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'aud-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aIOptimizationTuning: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'tune-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemAuditBook5Service,
        AutonomousAIBook5Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    auditService = module.get<SystemAuditBook5Service>(SystemAuditBook5Service);
    aiService = module.get<AutonomousAIBook5Service>(AutonomousAIBook5Service);
    jest.clearAllMocks();
  });

  it('should run production GA readiness system audit', async () => {
    const audit = await auditService.runProductionGaAudit({
      auditScope: 'PHASE_12_FINAL_GA',
    });

    expect(audit.complianceStatus).toBe('PASSED');
    expect(audit.securityPassScore).toBeGreaterThan(95);
  });

  it('should tune AI model hyperparameters and latency', async () => {
    const tuned = await aiService.tuneAiModel({
      modelName: 'CAPACITY_MATCHING_V2',
      hyperparameters: { learningRate: 0.001 },
      accuracyScore: 96.4,
      latencyMs: 14,
    });

    expect(tuned.accuracyScore).toBe(96.4);
    expect(tuned.latencyMs).toBe(14);
  });
});
