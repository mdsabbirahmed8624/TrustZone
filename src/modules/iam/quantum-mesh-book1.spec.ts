import { Test, TestingModule } from '@nestjs/testing';
import { QuantumMeshBook1Service } from './services/quantum-mesh-book1.service';
import { RoboticsDispatchBook1Service } from '../inventory/services/robotics-dispatch-book1.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 1 Unit Tests (Quantum Mesh Key Governance & Autonomous Robotics Dispatch)', () => {
  let quantumService: QuantumMeshBook1Service;
  let roboticsService: RoboticsDispatchBook1Service;

  const mockPrisma = {
    quantumResistantMeshKey: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'qkey-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    autonomousRoboticsDispatch: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'disp-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuantumMeshBook1Service,
        RoboticsDispatchBook1Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    quantumService = module.get<QuantumMeshBook1Service>(
      QuantumMeshBook1Service,
    );
    roboticsService = module.get<RoboticsDispatchBook1Service>(
      RoboticsDispatchBook1Service,
    );
    jest.clearAllMocks();
  });

  it('should register quantum-resistant zero-trust encryption mesh key', async () => {
    const key = await quantumService.registerMeshKey({
      keyId: 'QKEY-MESH-US-EAST-01',
      meshNodeId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(key.algorithm).toBe('CRYSTALS-Kyber-1024');
    expect(key.status).toBe('ACTIVE');
  });

  it('should create autonomous robotics drone supply-chain dispatch record', async () => {
    const dispatch = await roboticsService.createRoboticsDispatch({
      dispatchId: 'DISPATCH-ROBOT-8801',
      roboticsUnitCode: 'ROBOT-AGV-04',
      destinationWarehouseId: '123e4567-e89b-12d3-a456-426614174001',
      partsPayload: { displayModules: 50, lithiumBatteries: 20 },
    });

    expect(dispatch.dispatchStatus).toBe('IN_TRANSIT');
    expect(dispatch.roboticsUnitCode).toBe('ROBOT-AGV-04');
  });
});
