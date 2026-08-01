import { Test, TestingModule } from '@nestjs/testing';
import { SpatialTelemetryBook1Service } from './services/spatial-telemetry-book1.service';
import { SpatialTelemetryBook1Controller } from './controllers/spatial-telemetry-book1.controller';
import { EdgeMeshDispatchBook1Service } from './services/edge-mesh-dispatch-book1.service';
import { EdgeMeshDispatchBook1Controller } from './controllers/edge-mesh-dispatch-book1.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 1 — Spatial Telemetry Grid & Edge Mesh Node Dispatch', () => {
  let spatialService: SpatialTelemetryBook1Service;
  let spatialController: SpatialTelemetryBook1Controller;
  let edgeService: EdgeMeshDispatchBook1Service;
  let edgeController: EdgeMeshDispatchBook1Controller;

  const mockPrismaService = {
    spatialTelemetryGridBook1: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-spatial-01',
        gridNodeCode: 'GRID-NODE-SPATIAL-01',
        spatialCoordinates: 'X:120.4,Y:85.2,Z:44.1',
        deviceDiagnosticMode: '3D_HOLOGRAM_OVERLAY',
        latencyMs: 2.4,
        gridStatus: 'SYNCHRONIZED',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    edgeMeshNodeDispatchBook1: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-edge-01',
        dispatchCode: 'EDGE-DISPATCH-NODE-8801',
        edgeRegionCode: 'EDGE-US-EAST-01',
        activeMeshNodes: 64,
        throughputGbps: 120.5,
        dispatchStrategy: 'NEAREST_EDGE_LOW_LATENCY',
        operationalStatus: 'ACTIVE_OPTIMAL',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        SpatialTelemetryBook1Controller,
        EdgeMeshDispatchBook1Controller,
      ],
      providers: [
        SpatialTelemetryBook1Service,
        EdgeMeshDispatchBook1Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    spatialService = module.get(SpatialTelemetryBook1Service);
    spatialController = module.get(SpatialTelemetryBook1Controller);
    edgeService = module.get(EdgeMeshDispatchBook1Service);
    edgeController = module.get(EdgeMeshDispatchBook1Controller);
  });

  it('should be defined — SpatialTelemetryBook1Service', () => {
    expect(spatialService).toBeDefined();
  });

  it('should be defined — SpatialTelemetryBook1Controller', () => {
    expect(spatialController).toBeDefined();
  });

  it('should be defined — EdgeMeshDispatchBook1Service', () => {
    expect(edgeService).toBeDefined();
  });

  it('should be defined — EdgeMeshDispatchBook1Controller', () => {
    expect(edgeController).toBeDefined();
  });

  it('should register spatial telemetry grid node', async () => {
    const result = await spatialService.registerSpatialGridNode({
      gridNodeCode: 'GRID-NODE-SPATIAL-01',
    });
    expect(result).toBeDefined();
    expect(result.gridNodeCode).toBe('GRID-NODE-SPATIAL-01');
    expect(
      mockPrismaService.spatialTelemetryGridBook1.upsert,
    ).toHaveBeenCalled();
  });

  it('should record edge mesh node dispatch', async () => {
    const result = await edgeService.recordEdgeDispatch({
      dispatchCode: 'EDGE-DISPATCH-NODE-8801',
      edgeRegionCode: 'EDGE-US-EAST-01',
    });
    expect(result).toBeDefined();
    expect(result.dispatchCode).toBe('EDGE-DISPATCH-NODE-8801');
    expect(
      mockPrismaService.edgeMeshNodeDispatchBook1.upsert,
    ).toHaveBeenCalled();
  });

  it('should get spatial grid nodes via controller', async () => {
    await spatialController.findAll();
    expect(
      mockPrismaService.spatialTelemetryGridBook1.findMany,
    ).toHaveBeenCalled();
  });

  it('should get edge dispatches via controller', async () => {
    await edgeController.findAll();
    expect(
      mockPrismaService.edgeMeshNodeDispatchBook1.findMany,
    ).toHaveBeenCalled();
  });
});
