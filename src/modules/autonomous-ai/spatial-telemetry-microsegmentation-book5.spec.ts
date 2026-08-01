import { Test, TestingModule } from '@nestjs/testing';
import { AutonomousSpatialTelemetryEdgeMeshBook5Service } from './services/spatial-telemetry-edgemesh-book5.service';
import { AutonomousSpatialTelemetryEdgeMeshBook5Controller } from './controllers/spatial-telemetry-edgemesh-book5.controller';
import { SelfOptimizingZeroTrustMicrosegmentationBook5Service } from './services/self-optimization-microsegmentation-book5.service';
import { SelfOptimizingZeroTrustMicrosegmentationBook5Controller } from './controllers/self-optimization-microsegmentation-book5.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 15 Book 5 — Autonomous Spatial Telemetry Edge Mesh & Self-Optimizing Zero-Trust Microsegmentation', () => {
  let spatialService: AutonomousSpatialTelemetryEdgeMeshBook5Service;
  let spatialController: AutonomousSpatialTelemetryEdgeMeshBook5Controller;
  let microsegmentService: SelfOptimizingZeroTrustMicrosegmentationBook5Service;
  let microsegmentController: SelfOptimizingZeroTrustMicrosegmentationBook5Controller;

  const mockPrismaService = {
    autonomousSpatialTelemetryEdgeMeshBook5: {
      upsert: jest.fn().mockResolvedValue({
        id: 'spatial-uuid-001',
        spatialMeshCode: 'SPATIAL-TELEMETRY-P15-B5-01',
        edgeNodeLatencyMs: 0.18,
        spatialTelemetryBandwidthGbps: 100.0,
        meshGeoRegions: 64,
        meshStatus: 'SPATIAL_ACTIVE_OPTIMAL',
        lastTelemetryAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'spatial-uuid-001',
          spatialMeshCode: 'SPATIAL-TELEMETRY-P15-B5-01',
          edgeNodeLatencyMs: 0.18,
          spatialTelemetryBandwidthGbps: 100.0,
          meshGeoRegions: 64,
          meshStatus: 'SPATIAL_ACTIVE_OPTIMAL',
          lastTelemetryAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    selfOptimizingZeroTrustMicrosegmentationBook5: {
      upsert: jest.fn().mockResolvedValue({
        id: 'microsegment-uuid-001',
        microsegmentCode: 'MICROSEGMENT-P15-B5-01',
        isolationSecurityPolicy: 'ZERO_TRUST_STRICT_ENCLAVE',
        threatMitigationSpeedMs: 45,
        complianceSecurityScore: 100.0,
        segmentStatus: 'ENCLAVE_ISOLATED_ACTIVE',
        lastPolicyEnforcedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'microsegment-uuid-001',
          microsegmentCode: 'MICROSEGMENT-P15-B5-01',
          isolationSecurityPolicy: 'ZERO_TRUST_STRICT_ENCLAVE',
          threatMitigationSpeedMs: 45,
          complianceSecurityScore: 100.0,
          segmentStatus: 'ENCLAVE_ISOLATED_ACTIVE',
          lastPolicyEnforcedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        AutonomousSpatialTelemetryEdgeMeshBook5Controller,
        SelfOptimizingZeroTrustMicrosegmentationBook5Controller,
      ],
      providers: [
        AutonomousSpatialTelemetryEdgeMeshBook5Service,
        SelfOptimizingZeroTrustMicrosegmentationBook5Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    spatialService = module.get<AutonomousSpatialTelemetryEdgeMeshBook5Service>(
      AutonomousSpatialTelemetryEdgeMeshBook5Service,
    );
    spatialController =
      module.get<AutonomousSpatialTelemetryEdgeMeshBook5Controller>(
        AutonomousSpatialTelemetryEdgeMeshBook5Controller,
      );
    microsegmentService =
      module.get<SelfOptimizingZeroTrustMicrosegmentationBook5Service>(
        SelfOptimizingZeroTrustMicrosegmentationBook5Service,
      );
    microsegmentController =
      module.get<SelfOptimizingZeroTrustMicrosegmentationBook5Controller>(
        SelfOptimizingZeroTrustMicrosegmentationBook5Controller,
      );
  });

  // Instantiation tests
  it('should be defined — AutonomousSpatialTelemetryEdgeMeshBook5Service', () => {
    expect(spatialService).toBeDefined();
  });

  it('should be defined — AutonomousSpatialTelemetryEdgeMeshBook5Controller', () => {
    expect(spatialController).toBeDefined();
  });

  it('should be defined — SelfOptimizingZeroTrustMicrosegmentationBook5Service', () => {
    expect(microsegmentService).toBeDefined();
  });

  it('should be defined — SelfOptimizingZeroTrustMicrosegmentationBook5Controller', () => {
    expect(microsegmentController).toBeDefined();
  });

  // Service method tests
  it('should register autonomous spatial telemetry edge mesh', async () => {
    const result = await spatialService.registerSpatialMesh({
      spatialMeshCode: 'SPATIAL-TELEMETRY-P15-B5-01',
    });
    expect(result).toBeDefined();
    expect(result.spatialMeshCode).toBe('SPATIAL-TELEMETRY-P15-B5-01');
    expect(result.meshStatus).toBe('SPATIAL_ACTIVE_OPTIMAL');
  });

  it('should register self-optimizing zero-trust microsegmentation', async () => {
    const result = await microsegmentService.registerMicrosegment({
      microsegmentCode: 'MICROSEGMENT-P15-B5-01',
    });
    expect(result).toBeDefined();
    expect(result.microsegmentCode).toBe('MICROSEGMENT-P15-B5-01');
    expect(result.complianceSecurityScore).toBe(100.0);
  });

  // Controller list delegation tests
  it('should list spatial meshes via controller', async () => {
    const result = await spatialController.getSpatialMeshes();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list microsegments via controller', async () => {
    const result = await microsegmentController.getMicrosegments();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
