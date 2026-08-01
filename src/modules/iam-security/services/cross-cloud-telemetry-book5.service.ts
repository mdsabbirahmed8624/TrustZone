import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordTelemetryAuditDto {
  telemetryId: string;
  cloudProvider: string;
  clusterRegion: string;
  threatTelemetryScore?: number;
  securityPostureStatus?: string;
}

@Injectable()
export class CrossCloudTelemetryBook5Service {
  constructor(private readonly prisma: PrismaService) {}

  async recordTelemetryAudit(dto: RecordTelemetryAuditDto) {
    return this.prisma.crossCloudTelemetryAudit.upsert({
      where: { telemetryId: dto.telemetryId },
      update: {
        cloudProvider: dto.cloudProvider,
        clusterRegion: dto.clusterRegion,
        threatTelemetryScore: dto.threatTelemetryScore ?? 98,
        securityPostureStatus: dto.securityPostureStatus ?? 'COMPLIANT',
        auditedAt: new Date(),
      },
      create: {
        telemetryId: dto.telemetryId,
        cloudProvider: dto.cloudProvider,
        clusterRegion: dto.clusterRegion,
        threatTelemetryScore: dto.threatTelemetryScore ?? 98,
        securityPostureStatus: dto.securityPostureStatus ?? 'COMPLIANT',
        auditedAt: new Date(),
      },
    });
  }

  async getTelemetryAudits() {
    return this.prisma.crossCloudTelemetryAudit.findMany({
      orderBy: { auditedAt: 'desc' },
    });
  }
}
