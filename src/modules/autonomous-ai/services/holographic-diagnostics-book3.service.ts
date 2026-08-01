import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface StartHolographicDiagnosticSessionDto {
  sessionCode: string;
  hologramResolution?: string;
  spatialTrackingFps?: number;
  thermalInfraredDeltaC?: number;
  diagnosticStatus?: string;
}

@Injectable()
export class HolographicDiagnosticsBook3Service {
  constructor(private readonly prisma: PrismaService) {}

  async startDiagnosticSession(dto: StartHolographicDiagnosticSessionDto) {
    return this.prisma.holographicDiagnosticsBook3.upsert({
      where: { sessionCode: dto.sessionCode },
      update: {
        hologramResolution: dto.hologramResolution ?? '8K_SPATIAL_VOXEL',
        spatialTrackingFps: dto.spatialTrackingFps ?? 120,
        thermalInfraredDeltaC: dto.thermalInfraredDeltaC ?? 4.2,
        diagnosticStatus: dto.diagnosticStatus ?? 'ACTIVE_STREAMING',
        sessionStartedAt: new Date(),
      },
      create: {
        sessionCode: dto.sessionCode,
        hologramResolution: dto.hologramResolution ?? '8K_SPATIAL_VOXEL',
        spatialTrackingFps: dto.spatialTrackingFps ?? 120,
        thermalInfraredDeltaC: dto.thermalInfraredDeltaC ?? 4.2,
        diagnosticStatus: dto.diagnosticStatus ?? 'ACTIVE_STREAMING',
        sessionStartedAt: new Date(),
      },
    });
  }

  async getDiagnosticSessions() {
    return this.prisma.holographicDiagnosticsBook3.findMany({
      orderBy: { sessionStartedAt: 'desc' },
    });
  }
}
