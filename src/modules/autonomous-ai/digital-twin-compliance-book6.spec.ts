import { Test, TestingModule } from '@nestjs/testing';
import { DigitalTwinSimulationBook6Service } from './services/digital-twin-simulation-book6.service';
import { DigitalTwinSimulationBook6Controller } from './controllers/digital-twin-simulation-book6.controller';
import { PredictiveComplianceGovernanceBook6Service } from './services/predictive-compliance-governance-book6.service';
import { PredictiveComplianceGovernanceBook6Controller } from './controllers/predictive-compliance-governance-book6.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 6 — Digital Twin Simulation & Predictive Compliance Governance', () => {
  let twinService: DigitalTwinSimulationBook6Service;
  let twinController: DigitalTwinSimulationBook6Controller;
  let complianceService: PredictiveComplianceGovernanceBook6Service;
  let complianceController: PredictiveComplianceGovernanceBook6Controller;

  const mockPrismaService = {
    digitalTwinSimulationBook6: {
      create: jest.fn().mockResolvedValue({
        id: 'twin-uuid-001',
        simulationCode: 'TWIN-SIM-P14-B6-01',
        twinEntityType: 'SHOP_FLOOR_REPLICA',
        simulationFidelity: 0.997,
        scenarioCount: 128,
        anomalyDetectedCount: 1,
        simulationStatus: 'CONVERGED',
        executedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'twin-uuid-001',
          simulationCode: 'TWIN-SIM-P14-B6-01',
          twinEntityType: 'SHOP_FLOOR_REPLICA',
          simulationFidelity: 0.997,
          scenarioCount: 128,
          anomalyDetectedCount: 1,
          simulationStatus: 'CONVERGED',
          executedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    predictiveComplianceGovernanceBook6: {
      create: jest.fn().mockResolvedValue({
        id: 'comply-uuid-001',
        complianceCode: 'COMPLY-GOV-P14-B6-01',
        regulatoryFramework: 'ISO_27001_GDPR_HIPAA',
        predictedRiskScore: 0.02,
        complianceStatus: 'FULLY_COMPLIANT',
        automatedRemediations: 2,
        auditTrailHash: 'sha256:abc123',
        assessedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'comply-uuid-001',
          complianceCode: 'COMPLY-GOV-P14-B6-01',
          regulatoryFramework: 'ISO_27001_GDPR_HIPAA',
          predictedRiskScore: 0.02,
          complianceStatus: 'FULLY_COMPLIANT',
          automatedRemediations: 2,
          auditTrailHash: 'sha256:abc123',
          assessedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        DigitalTwinSimulationBook6Controller,
        PredictiveComplianceGovernanceBook6Controller,
      ],
      providers: [
        DigitalTwinSimulationBook6Service,
        PredictiveComplianceGovernanceBook6Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    twinService = module.get<DigitalTwinSimulationBook6Service>(
      DigitalTwinSimulationBook6Service,
    );
    twinController = module.get<DigitalTwinSimulationBook6Controller>(
      DigitalTwinSimulationBook6Controller,
    );
    complianceService = module.get<PredictiveComplianceGovernanceBook6Service>(
      PredictiveComplianceGovernanceBook6Service,
    );
    complianceController =
      module.get<PredictiveComplianceGovernanceBook6Controller>(
        PredictiveComplianceGovernanceBook6Controller,
      );
  });

  // Service definition tests
  it('should be defined — DigitalTwinSimulationBook6Service', () => {
    expect(twinService).toBeDefined();
  });

  it('should be defined — DigitalTwinSimulationBook6Controller', () => {
    expect(twinController).toBeDefined();
  });

  it('should be defined — PredictiveComplianceGovernanceBook6Service', () => {
    expect(complianceService).toBeDefined();
  });

  it('should be defined — PredictiveComplianceGovernanceBook6Controller', () => {
    expect(complianceController).toBeDefined();
  });

  // Service method tests
  it('should execute digital twin simulation', async () => {
    const result = await twinService.executeSimulation({
      simulationCode: 'TWIN-SIM-P14-B6-01',
    });
    expect(result).toBeDefined();
    expect(result.simulationCode).toBe('TWIN-SIM-P14-B6-01');
    expect(result.simulationStatus).toBe('CONVERGED');
    expect(
      mockPrismaService.digitalTwinSimulationBook6.create,
    ).toHaveBeenCalled();
  });

  it('should run compliance assessment', async () => {
    const result = await complianceService.runComplianceAssessment({
      complianceCode: 'COMPLY-GOV-P14-B6-01',
    });
    expect(result).toBeDefined();
    expect(result.complianceCode).toBe('COMPLY-GOV-P14-B6-01');
    expect(result.complianceStatus).toBe('FULLY_COMPLIANT');
    expect(
      mockPrismaService.predictiveComplianceGovernanceBook6.create,
    ).toHaveBeenCalled();
  });

  // Controller delegation tests
  it('should get simulations via controller', async () => {
    const result = await twinController.getSimulations();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should get assessments via controller', async () => {
    const result = await complianceController.getAssessments();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
