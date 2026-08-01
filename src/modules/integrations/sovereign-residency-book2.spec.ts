import { Test, TestingModule } from '@nestjs/testing';
import { SovereignResidencyBook2Service } from './services/sovereign-residency-book2.service';
import { FederatedLearningBook2Service } from '../autonomous-ai/services/federated-learning-book2.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 2 Unit Tests (Sovereign Data Residency & Federated AI Learning Engine)', () => {
  let residencyService: SovereignResidencyBook2Service;
  let federatedService: FederatedLearningBook2Service;

  const mockPrisma = {
    sovereignDataResidencyPolicy: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'res-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    federatedLearningJob: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'fed-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SovereignResidencyBook2Service,
        FederatedLearningBook2Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    residencyService = module.get<SovereignResidencyBook2Service>(
      SovereignResidencyBook2Service,
    );
    federatedService = module.get<FederatedLearningBook2Service>(
      FederatedLearningBook2Service,
    );
    jest.clearAllMocks();
  });

  it('should create multi-cloud sovereign data residency policy', async () => {
    const policy = await residencyService.createResidencyPolicy({
      policyCode: 'RESIDENCY-EU-GERMANY-01',
      regionZone: 'eu-central-1',
      jurisdictionCountry: 'DE',
    });

    expect(policy.complianceStatus).toBe('COMPLIANT');
    expect(policy.jurisdictionCountry).toBe('DE');
  });

  it('should create privacy-preserving AI federated learning job', async () => {
    const job = await federatedService.createFederatedJob({
      jobId: 'FED-JOB-REPAIR-V4',
      modelName: 'DIAGNOSTIC_NN_PRIVACY_V4',
    });

    expect(job.status).toBe('AGGREGATING');
    expect(job.modelName).toBe('DIAGNOSTIC_NN_PRIVACY_V4');
  });
});
