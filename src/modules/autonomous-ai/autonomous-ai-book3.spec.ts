import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseBook3Service } from '../franchise/services/franchise-book3.service';
import { AutonomousAIBook3Service } from './services/autonomous-ai-book3.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 3 Unit Tests (Workload Capacity & Portal Config)', () => {
  let franchiseService: FranchiseBook3Service;
  let aiService: AutonomousAIBook3Service;

  const mockPrisma = {
    franchise: {
      findUnique: jest.fn().mockResolvedValue({ id: 'f-1' }),
    },
    franchiseePortalConfig: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'pc-1', ...create }),
        ),
      findUnique: jest.fn(),
    },
    crossClusterReplicationLog: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'crl-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aIWorkloadAllocation: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'wa-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    selfHealingWorkflowIncident: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'inc-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FranchiseBook3Service,
        AutonomousAIBook3Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    franchiseService = module.get<FranchiseBook3Service>(FranchiseBook3Service);
    aiService = module.get<AutonomousAIBook3Service>(AutonomousAIBook3Service);
    jest.clearAllMocks();
  });

  it('should upsert franchise white-label portal configuration', async () => {
    mockPrisma.franchise.findUnique.mockResolvedValueOnce({ id: 'f-1' });

    const res = await franchiseService.upsertPortalConfig({
      franchiseId: 'f-1',
      primaryColor: '#1e293b',
      featureToggles: { billing: true },
    });

    expect(res.primaryColor).toBe('#1e293b');
  });

  it('should log cluster replication status with automatic lag status classification', async () => {
    const res = await franchiseService.logReplicationSync({
      clusterId: 'c-1',
      sourceRegion: 'us-east-1',
      targetRegion: 'eu-west-1',
      replicationLagMs: 1500,
      replicatedRecordsCount: 500,
    });

    expect(res.status).toBe('LAG_WARNING');
  });

  it('should calculate workload allocation optimization score', async () => {
    const res = await aiService.allocateTechnicianWorkload({
      branchId: 'b-1',
      technicianId: 't-1',
      predictedCapacityHours: 8.0,
      allocatedWorkloadHours: 8.0,
      recommendations: ['Optimal bench matching'],
    });

    expect(res.optimizationScore).toBe(100);
  });

  it('should log self-healing incident resolution', async () => {
    const inc = await aiService.logSelfHealingIncident({
      incidentCode: 'INC-2026-999',
      rootCause: 'Deadlock in queue worker',
      resolutionAction: 'Restarted consumer worker thread pool',
    });

    expect(inc.status).toBe('RESOLVED');
  });
});
