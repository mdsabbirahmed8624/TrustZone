import { Test, TestingModule } from '@nestjs/testing';
import { AiModelDriftBook9Service } from './services/ai-model-drift-book9.service';
import { AiModelDriftBook9Controller } from './controllers/ai-model-drift-book9.controller';
import { MilestoneCompletionBook9Service } from './services/milestone-completion-book9.service';
import { MilestoneCompletionBook9Controller } from './controllers/milestone-completion-book9.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 9 — AI Model Drift Monitoring & Milestone Completion Certificates', () => {
  let driftService: AiModelDriftBook9Service;
  let driftController: AiModelDriftBook9Controller;
  let certService: MilestoneCompletionBook9Service;
  let certController: MilestoneCompletionBook9Controller;

  const mockPrismaService = {
    aiModelDriftMonitoringBook9: {
      upsert: jest.fn().mockResolvedValue({
        id: 'drift-uuid-001',
        monitoringCode: 'DRIFT-MONITOR-P14-B9-01',
        targetModel: 'AUTONOMOUS_SWARM_HEALER',
        driftScore: 0.012,
        anomalyStatus: 'STABLE_NO_DRIFT',
        monitoredAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'drift-uuid-001',
          monitoringCode: 'DRIFT-MONITOR-P14-B9-01',
          targetModel: 'AUTONOMOUS_SWARM_HEALER',
          driftScore: 0.012,
          anomalyStatus: 'STABLE_NO_DRIFT',
          monitoredAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    autonomousMilestoneCompletionBook9: {
      create: jest.fn().mockResolvedValue({
        id: 'cert-uuid-001',
        completionCode: 'COMPLETION-P14-B9-01',
        milestoneTitle: 'PHASE_14_AUTONOMOUS_ENTERPRISE_OPERATIONS',
        certifiedByRole: 'CHIEF_ENTERPRISE_ARCHITECT',
        completionStatus: 'PASSED_CERTIFIED',
        verifiedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cert-uuid-001',
          completionCode: 'COMPLETION-P14-B9-01',
          milestoneTitle: 'PHASE_14_AUTONOMOUS_ENTERPRISE_OPERATIONS',
          certifiedByRole: 'CHIEF_ENTERPRISE_ARCHITECT',
          completionStatus: 'PASSED_CERTIFIED',
          verifiedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        AiModelDriftBook9Controller,
        MilestoneCompletionBook9Controller,
      ],
      providers: [
        AiModelDriftBook9Service,
        MilestoneCompletionBook9Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    driftService = module.get<AiModelDriftBook9Service>(
      AiModelDriftBook9Service,
    );
    driftController = module.get<AiModelDriftBook9Controller>(
      AiModelDriftBook9Controller,
    );
    certService = module.get<MilestoneCompletionBook9Service>(
      MilestoneCompletionBook9Service,
    );
    certController = module.get<MilestoneCompletionBook9Controller>(
      MilestoneCompletionBook9Controller,
    );
  });

  // Instantiation tests
  it('should be defined — AiModelDriftBook9Service', () => {
    expect(driftService).toBeDefined();
  });

  it('should be defined — AiModelDriftBook9Controller', () => {
    expect(driftController).toBeDefined();
  });

  it('should be defined — MilestoneCompletionBook9Service', () => {
    expect(certService).toBeDefined();
  });

  it('should be defined — MilestoneCompletionBook9Controller', () => {
    expect(certController).toBeDefined();
  });

  // Service method tests
  it('should record AI model drift audit', async () => {
    const result = await driftService.recordDriftAudit({
      monitoringCode: 'DRIFT-MONITOR-P14-B9-01',
      targetModel: 'AUTONOMOUS_SWARM_HEALER',
    });
    expect(result).toBeDefined();
    expect(result.monitoringCode).toBe('DRIFT-MONITOR-P14-B9-01');
    expect(result.anomalyStatus).toBe('STABLE_NO_DRIFT');
  });

  it('should certify Phase 14 milestone completion', async () => {
    const result = await certService.certifyMilestoneCompletion({
      completionCode: 'COMPLETION-P14-B9-01',
    });
    expect(result).toBeDefined();
    expect(result.completionCode).toBe('COMPLETION-P14-B9-01');
    expect(result.completionStatus).toBe('PASSED_CERTIFIED');
  });

  // Controller list delegation tests
  it('should list model drift audits via controller', async () => {
    const result = await driftController.getDriftAudits();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list milestone certificates via controller', async () => {
    const result = await certController.getCertificates();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
