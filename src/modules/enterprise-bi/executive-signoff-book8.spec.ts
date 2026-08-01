import { Test, TestingModule } from '@nestjs/testing';
import { ExecutiveSignoffBook8Service } from './services/executive-signoff-book8.service';
import { AiSafetyBoundaryBook8Service } from '../autonomous-ai/services/ai-safety-boundary-book8.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 8 Unit Tests (Executive Release Sign-off & AI Safety Boundary Verification)', () => {
  let signoffService: ExecutiveSignoffBook8Service;
  let safetyService: AiSafetyBoundaryBook8Service;

  const mockPrisma = {
    executiveSignoffBook8: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'signoff-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aiSafetyBoundaryBook8: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'safety-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutiveSignoffBook8Service,
        AiSafetyBoundaryBook8Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    signoffService = module.get<ExecutiveSignoffBook8Service>(
      ExecutiveSignoffBook8Service,
    );
    safetyService = module.get<AiSafetyBoundaryBook8Service>(
      AiSafetyBoundaryBook8Service,
    );
    jest.clearAllMocks();
  });

  it('should execute executive platform release sign-off Book 8', async () => {
    const signoff = await signoffService.executeSignoff({
      signoffCode: 'SIGNOFF-P13-B8-EXEC-01',
    });

    expect(signoff.approvalStatus).toBe('APPROVED');
    expect(signoff.signoffRole).toBe('CHIEF_TECHNOLOGY_OFFICER');
  });

  it('should verify autonomous AI safety boundary Book 8', async () => {
    const safety = await safetyService.verifySafetyBoundary({
      verificationCode: 'SAFETY-VERIFY-LLM-01',
      targetModel: 'AUTONOMOUS_REPAIR_ADVISOR',
    });

    expect(safety.safetyBoundaryStatus).toBe('PASSED_COMPLIANT');
    expect(safety.guardrailScore).toBe(99.8);
  });
});
