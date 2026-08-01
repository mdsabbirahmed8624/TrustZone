import { Test, TestingModule } from '@nestjs/testing';
import { Phase15MasterPlatformReleaseBook10Service } from './services/phase15-master-release-book10.service';
import { Phase15MasterPlatformReleaseBook10Controller } from './controllers/phase15-master-release-book10.controller';
import { Phase15AIGovernanceEthicsComplianceBook10Service } from './services/phase15-ai-governance-book10.service';
import { Phase15AIGovernanceEthicsComplianceBook10Controller } from './controllers/phase15-ai-governance-book10.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 15 Book 10 — Master Platform Release & AI Governance Ethics Compliance', () => {
  let releaseService: Phase15MasterPlatformReleaseBook10Service;
  let releaseController: Phase15MasterPlatformReleaseBook10Controller;
  let govService: Phase15AIGovernanceEthicsComplianceBook10Service;
  let govController: Phase15AIGovernanceEthicsComplianceBook10Controller;

  const mockPrismaService = {
    phase15MasterPlatformReleaseBook10: {
      upsert: jest.fn().mockResolvedValue({
        id: 'p15-release-uuid-001',
        masterReleaseCode: 'P15-MASTER-RELEASE-BOOK10-01',
        overallPhase15HealthScore: 100.0,
        totalAutonomousBooksVerified: 10,
        globalMeshUptimePercent: 99.999,
        releaseStatus: 'PHASE_15_PRODUCTION_READY',
        lastVerifiedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p15-release-uuid-001',
          masterReleaseCode: 'P15-MASTER-RELEASE-BOOK10-01',
          overallPhase15HealthScore: 100.0,
          totalAutonomousBooksVerified: 10,
          globalMeshUptimePercent: 99.999,
          releaseStatus: 'PHASE_15_PRODUCTION_READY',
          lastVerifiedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    phase15AIGovernanceEthicsComplianceBook10: {
      upsert: jest.fn().mockResolvedValue({
        id: 'p15-gov-uuid-001',
        governanceRecordCode: 'AI-GOVERNANCE-P15-B10-01',
        aiSafetyPolicyAlignmentPercent: 100.0,
        modelDriftRiskIndex: 0.0,
        auditedModelsCount: 128,
        governanceStatus: 'ETHICS_COMPLIANT_CERTIFIED',
        lastAuditedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p15-gov-uuid-001',
          governanceRecordCode: 'AI-GOVERNANCE-P15-B10-01',
          aiSafetyPolicyAlignmentPercent: 100.0,
          modelDriftRiskIndex: 0.0,
          auditedModelsCount: 128,
          governanceStatus: 'ETHICS_COMPLIANT_CERTIFIED',
          lastAuditedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        Phase15MasterPlatformReleaseBook10Controller,
        Phase15AIGovernanceEthicsComplianceBook10Controller,
      ],
      providers: [
        Phase15MasterPlatformReleaseBook10Service,
        Phase15AIGovernanceEthicsComplianceBook10Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    releaseService = module.get<Phase15MasterPlatformReleaseBook10Service>(
      Phase15MasterPlatformReleaseBook10Service,
    );
    releaseController =
      module.get<Phase15MasterPlatformReleaseBook10Controller>(
        Phase15MasterPlatformReleaseBook10Controller,
      );
    govService = module.get<Phase15AIGovernanceEthicsComplianceBook10Service>(
      Phase15AIGovernanceEthicsComplianceBook10Service,
    );
    govController =
      module.get<Phase15AIGovernanceEthicsComplianceBook10Controller>(
        Phase15AIGovernanceEthicsComplianceBook10Controller,
      );
  });

  // Instantiation tests
  it('should be defined — Phase15MasterPlatformReleaseBook10Service', () => {
    expect(releaseService).toBeDefined();
  });

  it('should be defined — Phase15MasterPlatformReleaseBook10Controller', () => {
    expect(releaseController).toBeDefined();
  });

  it('should be defined — Phase15AIGovernanceEthicsComplianceBook10Service', () => {
    expect(govService).toBeDefined();
  });

  it('should be defined — Phase15AIGovernanceEthicsComplianceBook10Controller', () => {
    expect(govController).toBeDefined();
  });

  // Service method tests
  it('should register Phase 15 Master Platform Release', async () => {
    const result = await releaseService.registerMasterRelease({
      masterReleaseCode: 'P15-MASTER-RELEASE-BOOK10-01',
    });
    expect(result).toBeDefined();
    expect(result.masterReleaseCode).toBe('P15-MASTER-RELEASE-BOOK10-01');
    expect(result.releaseStatus).toBe('PHASE_15_PRODUCTION_READY');
  });

  it('should register Phase 15 AI Governance record', async () => {
    const result = await govService.registerGovernanceRecord({
      governanceRecordCode: 'AI-GOVERNANCE-P15-B10-01',
    });
    expect(result).toBeDefined();
    expect(result.governanceRecordCode).toBe('AI-GOVERNANCE-P15-B10-01');
    expect(result.aiSafetyPolicyAlignmentPercent).toBe(100.0);
  });

  // Controller list delegation tests
  it('should list master releases via controller', async () => {
    const result = await releaseController.getMasterReleases();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list governance records via controller', async () => {
    const result = await govController.getGovernanceRecords();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
