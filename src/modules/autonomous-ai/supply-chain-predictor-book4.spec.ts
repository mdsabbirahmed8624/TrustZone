import { Test, TestingModule } from '@nestjs/testing';
import { SupplyChainPredictorBook4Service } from './services/supply-chain-predictor-book4.service';
import { SupplyChainPredictorBook4Controller } from './controllers/supply-chain-predictor-book4.controller';
import { QuantumIdentityMeshBook4Service } from './services/quantum-identity-mesh-book4.service';
import { QuantumIdentityMeshBook4Controller } from './controllers/quantum-identity-mesh-book4.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 4 — Supply-Chain Demand Predictor & Quantum Identity Mesh Ledger', () => {
  let scService: SupplyChainPredictorBook4Service;
  let scController: SupplyChainPredictorBook4Controller;
  let qIdService: QuantumIdentityMeshBook4Service;
  let qIdController: QuantumIdentityMeshBook4Controller;

  const mockPrismaService = {
    supplyChainPredictorBook4: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-sc-01',
        predictionCode: 'SC-PRED-P14-B4-01',
        partCategory: 'OLED_DISPLAY_ASSEMBLIES',
        predictedDemandQuantity: 450,
        reorderConfidenceScore: 0.985,
        replenishmentStatus: 'AUTO_REORDER_TRIGGERED',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    quantumIdentityMeshBook4: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-qid-01',
        didIdentifier: 'did:trustzone:quantum:mesh:node-8801',
        meshNodeRole: 'EDGE_TELEMETRY_ROUTER',
        cryptographicPublicKey: '0x04f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        verificationStatus: 'AUTHENTICATED_ACTIVE',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        SupplyChainPredictorBook4Controller,
        QuantumIdentityMeshBook4Controller,
      ],
      providers: [
        SupplyChainPredictorBook4Service,
        QuantumIdentityMeshBook4Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    scService = module.get(SupplyChainPredictorBook4Service);
    scController = module.get(SupplyChainPredictorBook4Controller);
    qIdService = module.get(QuantumIdentityMeshBook4Service);
    qIdController = module.get(QuantumIdentityMeshBook4Controller);
  });

  it('should be defined — SupplyChainPredictorBook4Service', () => {
    expect(scService).toBeDefined();
  });

  it('should be defined — SupplyChainPredictorBook4Controller', () => {
    expect(scController).toBeDefined();
  });

  it('should be defined — QuantumIdentityMeshBook4Service', () => {
    expect(qIdService).toBeDefined();
  });

  it('should be defined — QuantumIdentityMeshBook4Controller', () => {
    expect(qIdController).toBeDefined();
  });

  it('should predict supply chain demand', async () => {
    const result = await scService.predictDemand({
      predictionCode: 'SC-PRED-P14-B4-01',
    });
    expect(result).toBeDefined();
    expect(result.predictionCode).toBe('SC-PRED-P14-B4-01');
    expect(
      mockPrismaService.supplyChainPredictorBook4.upsert,
    ).toHaveBeenCalled();
  });

  it('should verify quantum identity node', async () => {
    const result = await qIdService.verifyNodeIdentity({
      didIdentifier: 'did:trustzone:quantum:mesh:node-8801',
    });
    expect(result).toBeDefined();
    expect(result.didIdentifier).toBe('did:trustzone:quantum:mesh:node-8801');
    expect(
      mockPrismaService.quantumIdentityMeshBook4.upsert,
    ).toHaveBeenCalled();
  });

  it('should get predictions via controller', async () => {
    await scController.findAll();
    expect(
      mockPrismaService.supplyChainPredictorBook4.findMany,
    ).toHaveBeenCalled();
  });

  it('should get identities via controller', async () => {
    await qIdController.findAll();
    expect(
      mockPrismaService.quantumIdentityMeshBook4.findMany,
    ).toHaveBeenCalled();
  });
});
