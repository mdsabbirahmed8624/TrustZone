import { Test, TestingModule } from '@nestjs/testing';
import { HolographicDiagnosticsBook3Service } from './services/holographic-diagnostics-book3.service';
import { HolographicDiagnosticsBook3Controller } from './controllers/holographic-diagnostics-book3.controller';
import { QuantumEdgeSecurityBook3Service } from './services/quantum-edge-security-book3.service';
import { QuantumEdgeSecurityBook3Controller } from './controllers/quantum-edge-security-book3.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 3 — Holographic Diagnostics & Quantum Edge Security Policy', () => {
  let holoService: HolographicDiagnosticsBook3Service;
  let holoController: HolographicDiagnosticsBook3Controller;
  let securityService: QuantumEdgeSecurityBook3Service;
  let securityController: QuantumEdgeSecurityBook3Controller;

  const mockPrismaService = {
    holographicDiagnosticsBook3: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-holo-01',
        sessionCode: 'HOLO-DIAG-P14-B3-01',
        hologramResolution: '8K_SPATIAL_VOXEL',
        spatialTrackingFps: 120,
        thermalInfraredDeltaC: 4.2,
        diagnosticStatus: 'ACTIVE_STREAMING',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    quantumEdgeSecurityPolicyBook3: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-qedge-01',
        policyCode: 'Q-EDGE-POL-1403',
        encryptionAlgorithm: 'CRYPTONIGHT_LITHIUM_ML_KEM',
        enforcementScope: 'GLOBAL_EDGE_MESH_NODES',
        zeroTrustStatus: 'STRICT_ENFORCED',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        HolographicDiagnosticsBook3Controller,
        QuantumEdgeSecurityBook3Controller,
      ],
      providers: [
        HolographicDiagnosticsBook3Service,
        QuantumEdgeSecurityBook3Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    holoService = module.get(HolographicDiagnosticsBook3Service);
    holoController = module.get(HolographicDiagnosticsBook3Controller);
    securityService = module.get(QuantumEdgeSecurityBook3Service);
    securityController = module.get(QuantumEdgeSecurityBook3Controller);
  });

  it('should be defined — HolographicDiagnosticsBook3Service', () => {
    expect(holoService).toBeDefined();
  });

  it('should be defined — HolographicDiagnosticsBook3Controller', () => {
    expect(holoController).toBeDefined();
  });

  it('should be defined — QuantumEdgeSecurityBook3Service', () => {
    expect(securityService).toBeDefined();
  });

  it('should be defined — QuantumEdgeSecurityBook3Controller', () => {
    expect(securityController).toBeDefined();
  });

  it('should start holographic diagnostic session', async () => {
    const result = await holoService.startDiagnosticSession({
      sessionCode: 'HOLO-DIAG-P14-B3-01',
    });
    expect(result).toBeDefined();
    expect(result.sessionCode).toBe('HOLO-DIAG-P14-B3-01');
    expect(
      mockPrismaService.holographicDiagnosticsBook3.upsert,
    ).toHaveBeenCalled();
  });

  it('should enforce quantum edge security policy', async () => {
    const result = await securityService.enforceSecurityPolicy({
      policyCode: 'Q-EDGE-POL-1403',
    });
    expect(result).toBeDefined();
    expect(result.policyCode).toBe('Q-EDGE-POL-1403');
    expect(
      mockPrismaService.quantumEdgeSecurityPolicyBook3.upsert,
    ).toHaveBeenCalled();
  });

  it('should get diagnostic sessions via controller', async () => {
    await holoController.findAll();
    expect(
      mockPrismaService.holographicDiagnosticsBook3.findMany,
    ).toHaveBeenCalled();
  });

  it('should get security policies via controller', async () => {
    await securityController.findAll();
    expect(
      mockPrismaService.quantumEdgeSecurityPolicyBook3.findMany,
    ).toHaveBeenCalled();
  });
});
