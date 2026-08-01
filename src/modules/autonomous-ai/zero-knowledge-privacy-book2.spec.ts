import { Test, TestingModule } from '@nestjs/testing';
import { ZeroKnowledgePrivacyBook2Service } from './services/zero-knowledge-privacy-book2.service';
import { ZeroKnowledgePrivacyBook2Controller } from './controllers/zero-knowledge-privacy-book2.controller';
import { NeuromorphicAiBook2Service } from './services/neuromorphic-ai-book2.service';
import { NeuromorphicAiBook2Controller } from './controllers/neuromorphic-ai-book2.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 2 — Zero-Knowledge Privacy Ledger & Neuromorphic AI Processing', () => {
  let zkService: ZeroKnowledgePrivacyBook2Service;
  let zkController: ZeroKnowledgePrivacyBook2Controller;
  let neuroService: NeuromorphicAiBook2Service;
  let neuroController: NeuromorphicAiBook2Controller;

  const mockPrismaService = {
    zeroKnowledgePrivacyLedgerBook2: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-zk-01',
        proofCode: 'ZK-PROOF-P14-B2-01',
        zkCircuitType: 'ZK_SNARK_GROTH16',
        verificationStatus: 'VERIFIED_VALID',
        proofHash: '0x8f4a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        verificationTimeMs: 1.2,
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    neuromorphicAiProcessingBook2: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-neuro-01',
        jobCode: 'NEURO-AI-JOB-9901',
        snnArchitecture: 'LOIHI_SPIKING_NEURAL_MESH',
        powerConsumptionWatts: 0.45,
        inferenceLatencyUs: 85.0,
        processingStatus: 'COMPLETED_OPTIMAL',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        ZeroKnowledgePrivacyBook2Controller,
        NeuromorphicAiBook2Controller,
      ],
      providers: [
        ZeroKnowledgePrivacyBook2Service,
        NeuromorphicAiBook2Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    zkService = module.get(ZeroKnowledgePrivacyBook2Service);
    zkController = module.get(ZeroKnowledgePrivacyBook2Controller);
    neuroService = module.get(NeuromorphicAiBook2Service);
    neuroController = module.get(NeuromorphicAiBook2Controller);
  });

  it('should be defined — ZeroKnowledgePrivacyBook2Service', () => {
    expect(zkService).toBeDefined();
  });

  it('should be defined — ZeroKnowledgePrivacyBook2Controller', () => {
    expect(zkController).toBeDefined();
  });

  it('should be defined — NeuromorphicAiBook2Service', () => {
    expect(neuroService).toBeDefined();
  });

  it('should be defined — NeuromorphicAiBook2Controller', () => {
    expect(neuroController).toBeDefined();
  });

  it('should verify zero-knowledge proof transaction', async () => {
    const result = await zkService.verifyZkProof({
      proofCode: 'ZK-PROOF-P14-B2-01',
    });
    expect(result).toBeDefined();
    expect(result.proofCode).toBe('ZK-PROOF-P14-B2-01');
    expect(
      mockPrismaService.zeroKnowledgePrivacyLedgerBook2.upsert,
    ).toHaveBeenCalled();
  });

  it('should execute neuromorphic AI inference job', async () => {
    const result = await neuroService.executeNeuromorphicJob({
      jobCode: 'NEURO-AI-JOB-9901',
    });
    expect(result).toBeDefined();
    expect(result.jobCode).toBe('NEURO-AI-JOB-9901');
    expect(
      mockPrismaService.neuromorphicAiProcessingBook2.upsert,
    ).toHaveBeenCalled();
  });

  it('should get ZK proofs via controller', async () => {
    await zkController.findAll();
    expect(
      mockPrismaService.zeroKnowledgePrivacyLedgerBook2.findMany,
    ).toHaveBeenCalled();
  });

  it('should get neuromorphic jobs via controller', async () => {
    await neuroController.findAll();
    expect(
      mockPrismaService.neuromorphicAiProcessingBook2.findMany,
    ).toHaveBeenCalled();
  });
});
