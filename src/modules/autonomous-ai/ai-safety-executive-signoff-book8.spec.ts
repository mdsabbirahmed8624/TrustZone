import { Test, TestingModule } from '@nestjs/testing';
import { AiSafetyBoundaryBook8Service } from './services/ai-safety-boundary-book8.service';
import { AiSafetyBoundaryBook8Controller } from './controllers/ai-safety-boundary-book8.controller';
import { ExecutiveSignoffBook8Service } from './services/executive-signoff-book8.service';
import { ExecutiveSignoffBook8Controller } from './controllers/executive-signoff-book8.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 8 — AI Safety Boundary Verification & Executive Sign-off', () => {
  let safetyService: AiSafetyBoundaryBook8Service;
  let safetyController: AiSafetyBoundaryBook8Controller;
  let signoffService: ExecutiveSignoffBook8Service;
  let signoffController: ExecutiveSignoffBook8Controller;

  const mockPrismaService = {
    aiSafetyBoundaryBook8: {
      upsert: jest.fn().mockResolvedValue({
        id: 'safety-uuid-001',
        verificationCode: 'SAFETY-VERIFY-P14-B8-01',
        targetModel: 'TRUSTZONE_LLM_70B',
        safetyBoundaryStatus: 'PASSED_COMPLIANT',
        guardrailScore: 99.8,
        verifiedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'safety-uuid-001',
          verificationCode: 'SAFETY-VERIFY-P14-B8-01',
          targetModel: 'TRUSTZONE_LLM_70B',
          safetyBoundaryStatus: 'PASSED_COMPLIANT',
          guardrailScore: 99.8,
          verifiedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    executiveSignoffBook8: {
      create: jest.fn().mockResolvedValue({
        id: 'signoff-uuid-001',
        signoffCode: 'SIGNOFF-P14-B8-EXEC-01',
        releaseVersion: '14.8.0-GA',
        signoffRole: 'CHIEF_TECHNOLOGY_OFFICER',
        approvalStatus: 'APPROVED',
        signedOffAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'signoff-uuid-001',
          signoffCode: 'SIGNOFF-P14-B8-EXEC-01',
          releaseVersion: '14.8.0-GA',
          signoffRole: 'CHIEF_TECHNOLOGY_OFFICER',
          approvalStatus: 'APPROVED',
          signedOffAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        AiSafetyBoundaryBook8Controller,
        ExecutiveSignoffBook8Controller,
      ],
      providers: [
        AiSafetyBoundaryBook8Service,
        ExecutiveSignoffBook8Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    safetyService = module.get<AiSafetyBoundaryBook8Service>(
      AiSafetyBoundaryBook8Service,
    );
    safetyController = module.get<AiSafetyBoundaryBook8Controller>(
      AiSafetyBoundaryBook8Controller,
    );
    signoffService = module.get<ExecutiveSignoffBook8Service>(
      ExecutiveSignoffBook8Service,
    );
    signoffController = module.get<ExecutiveSignoffBook8Controller>(
      ExecutiveSignoffBook8Controller,
    );
  });

  // Instantiation tests
  it('should be defined — AiSafetyBoundaryBook8Service', () => {
    expect(safetyService).toBeDefined();
  });

  it('should be defined — AiSafetyBoundaryBook8Controller', () => {
    expect(safetyController).toBeDefined();
  });

  it('should be defined — ExecutiveSignoffBook8Service', () => {
    expect(signoffService).toBeDefined();
  });

  it('should be defined — ExecutiveSignoffBook8Controller', () => {
    expect(signoffController).toBeDefined();
  });

  // Service method tests
  it('should verify AI safety boundary', async () => {
    const result = await safetyService.verifySafetyBoundary({
      verificationCode: 'SAFETY-VERIFY-P14-B8-01',
      targetModel: 'TRUSTZONE_LLM_70B',
    });
    expect(result).toBeDefined();
    expect(result.verificationCode).toBe('SAFETY-VERIFY-P14-B8-01');
    expect(result.safetyBoundaryStatus).toBe('PASSED_COMPLIANT');
  });

  it('should approve executive release sign-off', async () => {
    const result = await signoffService.approveReleaseSignoff({
      signoffCode: 'SIGNOFF-P14-B8-EXEC-01',
    });
    expect(result).toBeDefined();
    expect(result.signoffCode).toBe('SIGNOFF-P14-B8-EXEC-01');
    expect(result.approvalStatus).toBe('APPROVED');
  });

  // Controller list delegation tests
  it('should list safety boundaries via controller', async () => {
    const result = await safetyController.getSafetyBoundaries();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list executive sign-offs via controller', async () => {
    const result = await signoffController.getSignoffs();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
