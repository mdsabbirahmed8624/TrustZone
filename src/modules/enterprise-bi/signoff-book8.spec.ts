import { Test, TestingModule } from '@nestjs/testing';
import { SignoffBook8Service } from './services/signoff-book8.service';
import { AutonomousAIBook8Service } from '../autonomous-ai/services/autonomous-ai-book8.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 8 Unit Tests (Executive Platform Sign-Off & AI Safety Boundaries)', () => {
  let signoffService: SignoffBook8Service;
  let aiService: AutonomousAIBook8Service;

  const mockPrisma = {
    enterprisePlatformSignoff: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'so-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aISafetyBoundaryVerification: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'sb-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignoffBook8Service,
        AutonomousAIBook8Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    signoffService = module.get<SignoffBook8Service>(SignoffBook8Service);
    aiService = module.get<AutonomousAIBook8Service>(AutonomousAIBook8Service);
    jest.clearAllMocks();
  });

  it('should execute executive platform sign-off with VP and CTO approvals', async () => {
    const signoff = await signoffService.executePlatformSignoff({
      releaseCode: 'TRUSTZONE-ERP-V12-FINAL',
      versionTag: 'v12.8.0-book8-final',
    });

    expect(signoff.vpEngineeringSignoff).toBe(true);
    expect(signoff.ctoSignoff).toBe(true);
    expect(signoff.auditPassed).toBe(true);
  });

  it('should verify AI safety boundary threshold and pass when under limit', async () => {
    const verification = await aiService.verifySafetyBoundary({
      ruleId: 'r-1',
      safetyCheckCode: 'SAFE-BOUND-CREDIT-LIMIT-01',
      maxActionThreshold: 50000.0,
      evaluatedValue: 12500.0,
    });

    expect(verification.safetyStatus).toBe('PASSED');
  });
});
