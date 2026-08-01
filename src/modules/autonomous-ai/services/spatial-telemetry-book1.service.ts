import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterSpatialGridNodeDto {
  gridNodeCode: string;
  spatialCoordinates?: string;
  deviceDiagnosticMode?: string;
  latencyMs?: number;
  gridStatus?: string;
}

@Injectable()
export class SpatialTelemetryBook1Service {
  constructor(private readonly prisma: PrismaService) {}

  async registerSpatialGridNode(dto: RegisterSpatialGridNodeDto) {
    return this.prisma.spatialTelemetryGridBook1.upsert({
      where: { gridNodeCode: dto.gridNodeCode },
      update: {
        spatialCoordinates: dto.spatialCoordinates ?? 'X:120.4,Y:85.2,Z:44.1',
        deviceDiagnosticMode: dto.deviceDiagnosticMode ?? '3D_HOLOGRAM_OVERLAY',
        latencyMs: dto.latencyMs ?? 2.4,
        gridStatus: dto.gridStatus ?? 'SYNCHRONIZED',
        lastPingAt: new Date(),
      },
      create: {
        gridNodeCode: dto.gridNodeCode,
        spatialCoordinates: dto.spatialCoordinates ?? 'X:120.4,Y:85.2,Z:44.1',
        deviceDiagnosticMode: dto.deviceDiagnosticMode ?? '3D_HOLOGRAM_OVERLAY',
        latencyMs: dto.latencyMs ?? 2.4,
        gridStatus: dto.gridStatus ?? 'SYNCHRONIZED',
        lastPingAt: new Date(),
      },
    });
  }

  async getSpatialGridNodes() {
    return this.prisma.spatialTelemetryGridBook1.findMany({
      orderBy: { lastPingAt: 'desc' },
    });
  }
}
