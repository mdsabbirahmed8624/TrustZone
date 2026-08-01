import { Test, TestingModule } from '@nestjs/testing';
import { GlobalMultiCloudSovereignMeshBook1Service } from './services/global-multicloud-mesh-book1.service';
import { GlobalMultiCloudSovereignMeshBook1Controller } from './controllers/global-multicloud-mesh-book1.controller';
import { AutonomousLoadBalancingGridBook1Service } from './services/autonomous-load-balancing-book1.service';
import { AutonomousLoadBalancingGridBook1Controller } from './controllers/autonomous-load-balancing-book1.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 15 Book 1 — Global Multi-Cloud Sovereign Mesh & Autonomous Load-Balancing Grid', () => {
  let meshService: GlobalMultiCloudSovereignMeshBook1Service;
  let meshController: GlobalMultiCloudSovereignMeshBook1Controller;
  let gridService: AutonomousLoadBalancingGridBook1Service;
  let gridController: AutonomousLoadBalancingGridBook1Controller;

  const mockPrismaService = {
    globalMultiCloudSovereignMeshBook1: {
      upsert: jest.fn().mockResolvedValue({
        id: 'mesh-uuid-001',
        meshCode: 'GRID-MESH-P15-B1-01',
        cloudProvider: 'AWS_GCP_AZURE_HYBRID',
        sovereigntyRegion: 'EU_GDPR_SOVEREIGN',
        activeNodesCount: 64,
        healthScorePercent: 99.99,
        meshStatus: 'ONLINE_HEALTHY',
        lastSyncedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'mesh-uuid-001',
          meshCode: 'GRID-MESH-P15-B1-01',
          cloudProvider: 'AWS_GCP_AZURE_HYBRID',
          sovereigntyRegion: 'EU_GDPR_SOVEREIGN',
          activeNodesCount: 64,
          healthScorePercent: 99.99,
          meshStatus: 'ONLINE_HEALTHY',
          lastSyncedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    autonomousLoadBalancingGridBook1: {
      upsert: jest.fn().mockResolvedValue({
        id: 'grid-uuid-001',
        gridCode: 'GRID-BALANCER-P15-B1-01',
        trafficRps: 25000,
        latencyMs: 1.8,
        routingStrategy: 'GEO_LATENCY_SOVEREIGN_OPTIMIZED',
        balancedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'grid-uuid-001',
          gridCode: 'GRID-BALANCER-P15-B1-01',
          trafficRps: 25000,
          latencyMs: 1.8,
          routingStrategy: 'GEO_LATENCY_SOVEREIGN_OPTIMIZED',
          balancedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        GlobalMultiCloudSovereignMeshBook1Controller,
        AutonomousLoadBalancingGridBook1Controller,
      ],
      providers: [
        GlobalMultiCloudSovereignMeshBook1Service,
        AutonomousLoadBalancingGridBook1Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    meshService = module.get<GlobalMultiCloudSovereignMeshBook1Service>(
      GlobalMultiCloudSovereignMeshBook1Service,
    );
    meshController = module.get<GlobalMultiCloudSovereignMeshBook1Controller>(
      GlobalMultiCloudSovereignMeshBook1Controller,
    );
    gridService = module.get<AutonomousLoadBalancingGridBook1Service>(
      AutonomousLoadBalancingGridBook1Service,
    );
    gridController = module.get<AutonomousLoadBalancingGridBook1Controller>(
      AutonomousLoadBalancingGridBook1Controller,
    );
  });

  // Instantiation tests
  it('should be defined — GlobalMultiCloudSovereignMeshBook1Service', () => {
    expect(meshService).toBeDefined();
  });

  it('should be defined — GlobalMultiCloudSovereignMeshBook1Controller', () => {
    expect(meshController).toBeDefined();
  });

  it('should be defined — AutonomousLoadBalancingGridBook1Service', () => {
    expect(gridService).toBeDefined();
  });

  it('should be defined — AutonomousLoadBalancingGridBook1Controller', () => {
    expect(gridController).toBeDefined();
  });

  // Service method tests
  it('should register global multi-cloud sovereign mesh node network', async () => {
    const result = await meshService.registerMeshNode({
      meshCode: 'GRID-MESH-P15-B1-01',
    });
    expect(result).toBeDefined();
    expect(result.meshCode).toBe('GRID-MESH-P15-B1-01');
    expect(result.meshStatus).toBe('ONLINE_HEALTHY');
  });

  it('should execute autonomous load-balancing optimization', async () => {
    const result = await gridService.executeLoadBalancing({
      gridCode: 'GRID-BALANCER-P15-B1-01',
    });
    expect(result).toBeDefined();
    expect(result.gridCode).toBe('GRID-BALANCER-P15-B1-01');
    expect(result.trafficRps).toBe(25000);
  });

  // Controller list delegation tests
  it('should list sovereign meshes via controller', async () => {
    const result = await meshController.getMeshes();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list load-balancing grids via controller', async () => {
    const result = await gridController.getGrids();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
