import { Test, TestingModule } from '@nestjs/testing';
import { MasterPlatformReleaseBook10Service } from './services/master-platform-release-book10.service';
import { MasterPlatformReleaseBook10Controller } from './controllers/master-platform-release-book10.controller';
import { AiGovernanceEthicsBook10Service } from '../autonomous-ai/services/ai-governance-ethics-book10.service';
import { AiGovernanceEthicsBook10Controller } from '../autonomous-ai/controllers/ai-governance-ethics-book10.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 10 — Master Platform Release & AI Governance Ethics', () => {
  let masterReleaseService: MasterPlatformReleaseBook10Service;
  let masterReleaseController: MasterPlatformReleaseBook10Controller;
  let ethicsService: AiGovernanceEthicsBook10Service;
  let ethicsController: AiGovernanceEthicsBook10Controller;

  const mockPrismaService = {
    masterPlatformReleaseCertificationBook10: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-release',
        masterReleaseCode: 'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
        versionTag: 'v13.10.0-book10-final',
        phaseTitle: 'PHASE_13_QUANTUM_RESISTANT_ENTERPRISE_ERP',
        totalBooksCompleted: 10,
        productionGAApproved: true,
        certifiedBy: 'GLOBAL_EXECUTIVE_BOARD',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aiGovernanceEthicsComplianceBook10: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-ethics',
        policyCode: 'ETHICS-P13-POLICY-01',
        policyTitle: 'RESPONSIBLE_AI_DEPLOYMENT_CHARTER',
        complianceScorePercent: 99.5,
        auditStatus: 'COMPLIANT',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        MasterPlatformReleaseBook10Controller,
        AiGovernanceEthicsBook10Controller,
      ],
      providers: [
        MasterPlatformReleaseBook10Service,
        AiGovernanceEthicsBook10Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    masterReleaseService = module.get(MasterPlatformReleaseBook10Service);
    masterReleaseController = module.get(MasterPlatformReleaseBook10Controller);
    ethicsService = module.get(AiGovernanceEthicsBook10Service);
    ethicsController = module.get(AiGovernanceEthicsBook10Controller);
  });

  it('should be defined — MasterPlatformReleaseBook10Service', () => {
    expect(masterReleaseService).toBeDefined();
  });

  it('should be defined — MasterPlatformReleaseBook10Controller', () => {
    expect(masterReleaseController).toBeDefined();
  });

  it('should be defined — AiGovernanceEthicsBook10Service', () => {
    expect(ethicsService).toBeDefined();
  });

  it('should be defined — AiGovernanceEthicsBook10Controller', () => {
    expect(ethicsController).toBeDefined();
  });

  it('should certify master platform release', async () => {
    const result = await masterReleaseService.certifyMasterRelease({
      masterReleaseCode: 'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
    });
    expect(result).toBeDefined();
    expect(result.masterReleaseCode).toBe(
      'TRUSTZONE-ERP-P13-MASTER-GA-RELEASE',
    );
    expect(
      mockPrismaService.masterPlatformReleaseCertificationBook10.upsert,
    ).toHaveBeenCalled();
  });

  it('should audit AI governance ethics policy with COMPLIANT status', async () => {
    const result = await ethicsService.auditEthicsPolicy({
      policyCode: 'ETHICS-P13-POLICY-01',
      policyTitle: 'RESPONSIBLE_AI_DEPLOYMENT_CHARTER',
      complianceScorePercent: 99.5,
    });
    expect(result).toBeDefined();
    expect(result.policyCode).toBe('ETHICS-P13-POLICY-01');
    expect(
      mockPrismaService.aiGovernanceEthicsComplianceBook10.upsert,
    ).toHaveBeenCalled();
  });

  it('should get master platform certifications via controller', async () => {
    await masterReleaseController.findAll();
    expect(
      mockPrismaService.masterPlatformReleaseCertificationBook10.findMany,
    ).toHaveBeenCalled();
  });

  it('should get ethics audits via controller', async () => {
    await ethicsController.findAll();
    expect(
      mockPrismaService.aiGovernanceEthicsComplianceBook10.findMany,
    ).toHaveBeenCalled();
  });
});
