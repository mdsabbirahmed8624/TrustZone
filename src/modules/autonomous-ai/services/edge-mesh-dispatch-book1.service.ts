import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordEdgeDispatchDto {
  dispatchCode: string;
  edgeRegionCode: string;
  activeMeshNodes?: number;
  throughputGbps?: number;
  dispatchStrategy?: string;
  operationalStatus?: string;
}

@Injectable()
export class EdgeMeshDispatchBook1Service {
  constructor(private readonly prisma: PrismaService) {}

  async recordEdgeDispatch(dto: RecordEdgeDispatchDto) {
    return this.prisma.edgeMeshNodeDispatchBook1.upsert({
      where: { dispatchCode: dto.dispatchCode },
      update: {
        edgeRegionCode: dto.edgeRegionCode,
        activeMeshNodes: dto.activeMeshNodes ?? 64,
        throughputGbps: dto.throughputGbps ?? 120.5,
        dispatchStrategy: dto.dispatchStrategy ?? 'NEAREST_EDGE_LOW_LATENCY',
        operationalStatus: dto.operationalStatus ?? 'ACTIVE_OPTIMAL',
        dispatchedAt: new Date(),
      },
      create: {
        dispatchCode: dto.dispatchCode,
        edgeRegionCode: dto.edgeRegionCode,
        activeMeshNodes: dto.activeMeshNodes ?? 64,
        throughputGbps: dto.throughputGbps ?? 120.5,
        dispatchStrategy: dto.dispatchStrategy ?? 'NEAREST_EDGE_LOW_LATENCY',
        operationalStatus: dto.operationalStatus ?? 'ACTIVE_OPTIMAL',
        dispatchedAt: new Date(),
      },
    });
  }

  async getEdgeDispatches() {
    return this.prisma.edgeMeshNodeDispatchBook1.findMany({
      orderBy: { dispatchedAt: 'desc' },
    });
  }
}
