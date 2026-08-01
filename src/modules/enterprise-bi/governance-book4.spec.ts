import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceBook4Service } from './services/governance-book4.service';
import { AutonomousAIBook4Service } from '../autonomous-ai/services/autonomous-ai-book4.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 4 Unit Tests (Governance, DR & Maintenance)', () => {
  let governanceService: GovernanceBook4Service;
  let aiService: AutonomousAIBook4Service;

  const mockPrisma = {
    masterDataGovernanceRule: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'mdm-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    disasterRecoveryAudit: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'dr-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    globalSLABenchmark: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'sla-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    predictiveMaintenanceSchedule: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'pm-1', ...data }),
        ),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'pm-1', status: 'SCHEDULED' }),
      update: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'pm-1', status: 'COMPLETED' }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GovernanceBook4Service,
        AutonomousAIBook4Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    governanceService = module.get<GovernanceBook4Service>(
      GovernanceBook4Service,
    );
    aiService = module.get<AutonomousAIBook4Service>(AutonomousAIBook4Service);
    jest.clearAllMocks();
  });

  it('should upsert master data governance rule', async () => {
    const res = await governanceService.upsertMdmRule({
      entityType: 'CUSTOMER',
      ruleCode: 'MDM-CUST-DEDUP-01',
      validationPattern: '^.+@.+\\..+$',
    });

    expect(res.ruleCode).toBe('MDM-CUST-DEDUP-01');
  });

  it('should record DR audit drill with automatic RTO/RPO result classification', async () => {
    const audit = await governanceService.recordDrAudit({
      regionCluster: 'EU-CENTRAL-1',
      rtoTargetSeconds: 300,
      rtoAchievedSeconds: 150,
      rpoTargetSeconds: 60,
      rpoAchievedSeconds: 15,
    });

    expect(audit.drillResult).toBe('PASSED');
  });

  it('should evaluate SLA benchmark status', async () => {
    const sla = await governanceService.evaluateSlaBenchmark({
      tenantOrRegionCode: 'FRANCHISE-TX01',
      serviceCategory: 'SCREEN_REPAIR',
      achievedSlaPercentage: 99.4,
      evaluatedMonth: '2026-07',
    });

    expect(sla.complianceStatus).toBe('COMPLIANT');
  });

  it('should schedule and complete AI predictive maintenance', async () => {
    const scheduled = await aiService.schedulePredictiveMaintenance({
      assetId: 'a-1',
      branchId: 'b-1',
      predictedFailureRiskScore: 85.0,
      recommendedAction: 'Replace sensor',
      scheduledMaintenanceDate: new Date(),
    });
    expect(scheduled.status).toBe('SCHEDULED');

    const completed = await aiService.completeMaintenance('pm-1');
    expect(completed.status).toBe('COMPLETED');
  });
});
