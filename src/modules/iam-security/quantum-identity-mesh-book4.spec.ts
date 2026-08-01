import { Test, TestingModule } from '@nestjs/testing';
import { QuantumIdentityMeshBook4Service } from './services/quantum-identity-mesh-book4.service';
import { SupplyChainPredictorBook4Service } from '../inventory/services/supply-chain-predictor-book4.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 4 Unit Tests (Quantum Identity Mesh & AI Supply-Chain Predictor)', () => {
  let identityService: QuantumIdentityMeshBook4Service;
  let supplyService: SupplyChainPredictorBook4Service;

  const mockPrisma = {
    quantumIdentityMeshLedger: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'ledg-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    autonomousSupplyChainPredictor: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'pred-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuantumIdentityMeshBook4Service,
        SupplyChainPredictorBook4Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    identityService = module.get<QuantumIdentityMeshBook4Service>(
      QuantumIdentityMeshBook4Service,
    );
    supplyService = module.get<SupplyChainPredictorBook4Service>(
      SupplyChainPredictorBook4Service,
    );
    jest.clearAllMocks();
  });

  it('should register quantum-safe zero-trust identity mesh ledger', async () => {
    const ledger = await identityService.registerIdentityLedger({
      ledgerCode: 'QID-LEDGER-US-NODE-01',
      identitySubject: 'USER-TECH-8820',
      verificationNodeId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(ledger.verificationStatus).toBe('VERIFIED');
    expect(ledger.meshSignatureAlgorithm).toBe('Falcon-1024-Signature');
  });

  it('should create autonomous AI supply-chain depletion prediction record', async () => {
    const pred = await supplyService.createSupplyChainPrediction({
      predictionId: 'PRED-SUPPLY-OLED-V2',
      partCategory: 'DISPLAY_MODULES',
      warehouseId: '123e4567-e89b-12d3-a456-426614174001',
    });

    expect(pred.automationStatus).toBe('REORDER_REQUISITIONED');
    expect(pred.predictedDepletionDays).toBe(5);
  });
});
