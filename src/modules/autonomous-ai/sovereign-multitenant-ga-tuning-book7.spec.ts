import { Test, TestingModule } from '@nestjs/testing';
import { SovereignMultiTenantMicrosegmentationBook7Service } from './services/sovereign-multitenant-book7.service';
import { SovereignMultiTenantMicrosegmentationBook7Controller } from './controllers/sovereign-multitenant-book7.controller';
import { GlobalCrossCloudGATuningGridBook7Service } from './services/ga-tuning-crosscloud-book7.service';
import { GlobalCrossCloudGATuningGridBook7Controller } from './controllers/ga-tuning-crosscloud-book7.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 15 Book 7 — Sovereign Multi-Tenant Microsegmentation & Global Cross-Cloud GA Tuning Grid', () => {
  let tenantService: SovereignMultiTenantMicrosegmentationBook7Service;
  let tenantController: SovereignMultiTenantMicrosegmentationBook7Controller;
  let gaService: GlobalCrossCloudGATuningGridBook7Service;
  let gaController: GlobalCrossCloudGATuningGridBook7Controller;

  const mockPrismaService = {
    sovereignMultiTenantMicrosegmentationBook7: {
      upsert: jest.fn().mockResolvedValue({
        id: 'tenant-uuid-001',
        tenantSegmentCode: 'TENANT-SEGMENT-P15-B7-01',
        tenantEnclaveIsolationScore: 100.0,
        tenantCrossNoiseLeakagePercent: 0.0,
        tenantActiveCount: 256,
        segmentStatus: 'TENANT_ISOLATED_STRICT',
        lastIsolatedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'tenant-uuid-001',
          tenantSegmentCode: 'TENANT-SEGMENT-P15-B7-01',
          tenantEnclaveIsolationScore: 100.0,
          tenantCrossNoiseLeakagePercent: 0.0,
          tenantActiveCount: 256,
          segmentStatus: 'TENANT_ISOLATED_STRICT',
          lastIsolatedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    globalCrossCloudGATuningGridBook7: {
      upsert: jest.fn().mockResolvedValue({
        id: 'crosscloud-uuid-001',
        crossCloudTuningCode: 'CROSSCLOUD-GA-P15-B7-01',
        crossCloudSyncLatencyMs: 0.95,
        geneticAlgorithmFitnessScore: 99.97,
        supportedCloudProviders: 5,
        gridStatus: 'CROSSCLOUD_OPTIMAL_ACTIVE',
        lastGAOptimizationAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'crosscloud-uuid-001',
          crossCloudTuningCode: 'CROSSCLOUD-GA-P15-B7-01',
          crossCloudSyncLatencyMs: 0.95,
          geneticAlgorithmFitnessScore: 99.97,
          supportedCloudProviders: 5,
          gridStatus: 'CROSSCLOUD_OPTIMAL_ACTIVE',
          lastGAOptimizationAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        SovereignMultiTenantMicrosegmentationBook7Controller,
        GlobalCrossCloudGATuningGridBook7Controller,
      ],
      providers: [
        SovereignMultiTenantMicrosegmentationBook7Service,
        GlobalCrossCloudGATuningGridBook7Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    tenantService =
      module.get<SovereignMultiTenantMicrosegmentationBook7Service>(
        SovereignMultiTenantMicrosegmentationBook7Service,
      );
    tenantController =
      module.get<SovereignMultiTenantMicrosegmentationBook7Controller>(
        SovereignMultiTenantMicrosegmentationBook7Controller,
      );
    gaService = module.get<GlobalCrossCloudGATuningGridBook7Service>(
      GlobalCrossCloudGATuningGridBook7Service,
    );
    gaController = module.get<GlobalCrossCloudGATuningGridBook7Controller>(
      GlobalCrossCloudGATuningGridBook7Controller,
    );
  });

  // Instantiation tests
  it('should be defined — SovereignMultiTenantMicrosegmentationBook7Service', () => {
    expect(tenantService).toBeDefined();
  });

  it('should be defined — SovereignMultiTenantMicrosegmentationBook7Controller', () => {
    expect(tenantController).toBeDefined();
  });

  it('should be defined — GlobalCrossCloudGATuningGridBook7Service', () => {
    expect(gaService).toBeDefined();
  });

  it('should be defined — GlobalCrossCloudGATuningGridBook7Controller', () => {
    expect(gaController).toBeDefined();
  });

  // Service method tests
  it('should register sovereign multi-tenant microsegmentation', async () => {
    const result = await tenantService.registerTenantSegment({
      tenantSegmentCode: 'TENANT-SEGMENT-P15-B7-01',
    });
    expect(result).toBeDefined();
    expect(result.tenantSegmentCode).toBe('TENANT-SEGMENT-P15-B7-01');
    expect(result.segmentStatus).toBe('TENANT_ISOLATED_STRICT');
  });

  it('should register global cross-cloud GA tuning grid', async () => {
    const result = await gaService.registerGATuningGrid({
      crossCloudTuningCode: 'CROSSCLOUD-GA-P15-B7-01',
    });
    expect(result).toBeDefined();
    expect(result.crossCloudTuningCode).toBe('CROSSCLOUD-GA-P15-B7-01');
    expect(result.geneticAlgorithmFitnessScore).toBe(99.97);
  });

  // Controller list delegation tests
  it('should list tenant segments via controller', async () => {
    const result = await tenantController.getTenantSegments();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list GA tuning grids via controller', async () => {
    const result = await gaController.getGATuningGrids();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
