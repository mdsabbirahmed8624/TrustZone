import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterSpatialMeshDto {
  spatialMeshCode: string;
  edgeNodeLatencyMs?: number;
  spatialTelemetryBandwidthGbps?: number;
  meshGeoRegions?: number;
  meshStatus?: string;
}

@Injectable()
export class AutonomousSpatialTelemetryEdgeMeshBook5Service {
  private readonly logger = new Logger(
    AutonomousSpatialTelemetryEdgeMeshBook5Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or calibrate autonomous spatial telemetry edge mesh node.
   */
  async registerSpatialMesh(dto: RegisterSpatialMeshDto) {
    this.logger.log(
      `Registering autonomous spatial telemetry edge mesh: ${dto.spatialMeshCode}`,
    );

    return this.prisma.autonomousSpatialTelemetryEdgeMeshBook5.upsert({
      where: { spatialMeshCode: dto.spatialMeshCode },
      update: {
        edgeNodeLatencyMs: dto.edgeNodeLatencyMs ?? 0.18,
        spatialTelemetryBandwidthGbps:
          dto.spatialTelemetryBandwidthGbps ?? 100.0,
        meshGeoRegions: dto.meshGeoRegions ?? 64,
        meshStatus: dto.meshStatus ?? 'SPATIAL_ACTIVE_OPTIMAL',
        lastTelemetryAt: new Date(),
      },
      create: {
        spatialMeshCode: dto.spatialMeshCode,
        edgeNodeLatencyMs: dto.edgeNodeLatencyMs ?? 0.18,
        spatialTelemetryBandwidthGbps:
          dto.spatialTelemetryBandwidthGbps ?? 100.0,
        meshGeoRegions: dto.meshGeoRegions ?? 64,
        meshStatus: dto.meshStatus ?? 'SPATIAL_ACTIVE_OPTIMAL',
        lastTelemetryAt: new Date(),
      },
    });
  }

  /**
   * List all autonomous spatial telemetry edge meshes.
   */
  async getSpatialMeshes() {
    return this.prisma.autonomousSpatialTelemetryEdgeMeshBook5.findMany({
      orderBy: { lastTelemetryAt: 'desc' },
    });
  }
}
