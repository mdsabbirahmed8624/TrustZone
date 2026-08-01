import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneCompletionBook9Service } from './services/milestone-completion-book9.service';
import { AiModelDriftBook9Service } from '../autonomous-ai/services/ai-model-drift-book9.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 9 Unit Tests (Milestone Completion Certificate & AI Model Drift)', () => {
  let certService: MilestoneCompletionBook9Service;
  let driftService: AiModelDriftBook9Service;

  const mockPrisma = {
    milestoneCompletionCertificateBook9: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'cert-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aiModelDriftMonitoringBook9: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'drift-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestoneCompletionBook9Service,
        AiModelDriftBook9Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    certService = module.get<MilestoneCompletionBook9Service>(
      MilestoneCompletionBook9Service,
    );
    driftService = module.get<AiModelDriftBook9Service>(
      AiModelDriftBook9Service,
    );
    jest.clearAllMocks();
  });

  it('should issue Phase 13 milestone completion certificate Book 9', async () => {
    const cert = await certService.issueCertificate({
      certificateCode: 'CERT-P13-MILESTONE-09',
    });

    expect(cert.certificationStatus).toBe('PASSED_CERTIFIED');
    expect(cert.certifiedByRole).toBe('CHIEF_ENTERPRISE_ARCHITECT');
  });

  it('should record autonomous AI model drift monitoring audit Book 9', async () => {
    const drift = await driftService.recordDriftAudit({
      monitoringCode: 'DRIFT-MONITOR-LLM-01',
      targetModel: 'AUTONOMOUS_SWARM_HEALER',
    });

    expect(drift.anomalyStatus).toBe('STABLE_NO_DRIFT');
    expect(drift.driftScore).toBe(0.012);
  });
});
