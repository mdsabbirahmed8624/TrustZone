import { Test, TestingModule } from '@nestjs/testing';
import { SwarmSelfHealingBook3Service } from './services/swarm-self-healing-book3.service';
import { MicroSegmentationBook3Service } from '../iam-security/services/micro-segmentation-book3.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 3 Unit Tests (AI Swarm Self-Healing Engine & Zero-Trust Micro-Segmentation)', () => {
  let swarmService: SwarmSelfHealingBook3Service;
  let microService: MicroSegmentationBook3Service;

  const mockPrisma = {
    swarmSelfHealingAgent: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'agent-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    zeroTrustMicroSegmentationPolicy: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'pol-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwarmSelfHealingBook3Service,
        MicroSegmentationBook3Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    swarmService = module.get<SwarmSelfHealingBook3Service>(
      SwarmSelfHealingBook3Service,
    );
    microService = module.get<MicroSegmentationBook3Service>(
      MicroSegmentationBook3Service,
    );
    jest.clearAllMocks();
  });

  it('should register autonomous AI self-healing swarm agent', async () => {
    const agent = await swarmService.registerSwarmAgent({
      agentCode: 'SWARM-AGENT-RECOVERY-01',
      swarmClusterId: 'SWARM-CLUSTER-US-EAST',
      targetService: 'PAYMENT_GATEWAY_V2',
    });

    expect(agent.status).toBe('HEALTHY');
    expect(agent.remediationAction).toBe('AUTO_FAILOVER');
  });

  it('should create zero-trust micro-segmentation security policy', async () => {
    const policy = await microService.createMicroSegmentationPolicy({
      policyId: 'ZTRUST-SEG-PAY-TO-DB',
      workloadGroup: 'FINANCE_CORE',
      sourceSegment: 'WEB_TIER',
      targetSegment: 'DB_TIER',
    });

    expect(policy.enforcementMode).toBe('STRICT_ENFORCE');
    expect(policy.status).toBe('ACTIVE');
  });
});
