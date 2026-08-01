import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneBook9Service } from './services/milestone-book9.service';
import { AutonomousAIBook9Service } from '../autonomous-ai/services/autonomous-ai-book9.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 9 Unit Tests (Milestone Completion Certificate & AI Model Drift)', () => {
  let milestoneService: MilestoneBook9Service;
  let aiService: AutonomousAIBook9Service;

  const mockPrisma = {
    milestoneCompletionCertificate: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'cert-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aIModelDriftMonitoring: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'drift-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestoneBook9Service,
        AutonomousAIBook9Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    milestoneService = module.get<MilestoneBook9Service>(MilestoneBook9Service);
    aiService = module.get<AutonomousAIBook9Service>(AutonomousAIBook9Service);
    jest.clearAllMocks();
  });

  it('should issue official Phase 12 milestone completion certificate', async () => {
    const cert = await milestoneService.issueMilestoneCertificate({
      certificateCode: 'CERT-PHASE-12-COMPLETE',
    });

    expect(cert.completedBooksCount).toBe(9);
    expect(cert.completionStatus).toBe('MILESTONE_SUCCESSFULLY_COMPLETED');
  });

  it('should record AI model drift score and feature attribution', async () => {
    const drift = await aiService.recordModelDrift({
      modelId: 'm-1',
      modelName: 'REV_PREDICT_V2',
      conceptDriftScore: 0.08,
      featureAttribution: { grossSales: 0.85, regionalTier: 0.15 },
    });

    expect(drift.retrainingStatus).toBe('STABLE');
    expect(drift.conceptDriftScore).toBe(0.08);
  });
});
