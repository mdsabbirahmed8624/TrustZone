import { Test, TestingModule } from '@nestjs/testing';
import { MasterReleaseBook10Service } from './services/master-release-book10.service';
import { AutonomousAIBook10Service } from '../autonomous-ai/services/autonomous-ai-book10.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 10 Unit Tests (Master ERP Release Certification & AI Ethics Audits)', () => {
  let masterService: MasterReleaseBook10Service;
  let aiService: AutonomousAIBook10Service;

  const mockPrisma = {
    masterERPReleaseCertification: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'm-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aIGovernanceEthicsAudit: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'eth-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterReleaseBook10Service,
        AutonomousAIBook10Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    masterService = module.get<MasterReleaseBook10Service>(
      MasterReleaseBook10Service,
    );
    aiService = module.get<AutonomousAIBook10Service>(
      AutonomousAIBook10Service,
    );
    jest.clearAllMocks();
  });

  it('should issue grand master ERP platform release certification for 10 books', async () => {
    const cert = await masterService.certifyMasterRelease({
      masterReleaseCode: 'TRUSTZONE-ERP-MASTER-GA-RELEASE',
    });

    expect(cert.totalBooksCompleted).toBe(10);
    expect(cert.productionGAApproved).toBe(true);
  });

  it('should audit AI ethics policy and mark COMPLIANT when score >= 90%', async () => {
    const audit = await aiService.auditEthicsPolicy({
      policyCode: 'ETHICS-POL-AI-01',
      policyTitle: 'Algorithmic Bias & Fair Treatment Policy',
      complianceScorePercent: 98.5,
    });

    expect(audit.auditStatus).toBe('COMPLIANT');
    expect(audit.complianceScorePercent).toBe(98.5);
  });
});
