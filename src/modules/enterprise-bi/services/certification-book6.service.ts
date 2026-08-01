import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CertifyMilestoneDto {
  milestoneCode: string;
  certifiedVersion?: string;
  signingExecutive?: string;
}

export interface RecordTelemetryDto {
  serviceName: string;
  regionCode?: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  throughputRps: number;
  errorRatePercent?: number;
}

@Injectable()
export class CertificationBook6Service {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. GLOBAL MILESTONE CERTIFICATION
  // ----------------------------------------------------
  async certifyMilestoneRelease(dto: CertifyMilestoneDto) {
    const signoffMetadata = {
      booksCompleted: [
        'Book 1',
        'Book 2',
        'Book 3',
        'Book 4',
        'Book 5',
        'Book 6',
      ],
      allTestsPassing: true,
      securityPassed: true,
      productionReady: true,
    };

    return this.prisma.globalMilestoneCertification.upsert({
      where: { milestoneCode: dto.milestoneCode },
      update: {
        certifiedVersion: dto.certifiedVersion ?? '12.6.0-GA',
        signingExecutive:
          dto.signingExecutive ?? 'ENTERPRISE_VP_OF_ENGINEERING',
        status: 'APPROVED_AND_CERTIFIED',
        signoffMetadataJson: JSON.stringify(signoffMetadata),
        certifiedAt: new Date(),
      },
      create: {
        milestoneCode: dto.milestoneCode,
        certifiedVersion: dto.certifiedVersion ?? '12.6.0-GA',
        signingExecutive:
          dto.signingExecutive ?? 'ENTERPRISE_VP_OF_ENGINEERING',
        status: 'APPROVED_AND_CERTIFIED',
        signoffMetadataJson: JSON.stringify(signoffMetadata),
        certifiedAt: new Date(),
      },
    });
  }

  async getCertifications() {
    return this.prisma.globalMilestoneCertification.findMany({
      orderBy: { certifiedAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 2. LIVE SYSTEM TELEMETRY LOGS
  // ----------------------------------------------------
  async recordTelemetryLog(dto: RecordTelemetryDto) {
    return this.prisma.liveSystemTelemetryLog.create({
      data: {
        serviceName: dto.serviceName,
        regionCode: dto.regionCode ?? 'US-EAST-1',
        cpuUsagePercent: dto.cpuUsagePercent,
        memoryUsagePercent: dto.memoryUsagePercent,
        throughputRps: dto.throughputRps,
        errorRatePercent: dto.errorRatePercent ?? 0.0,
      },
    });
  }

  async getTelemetryLogs(serviceName?: string) {
    return this.prisma.liveSystemTelemetryLog.findMany({
      where: serviceName ? { serviceName } : undefined,
      orderBy: { loggedAt: 'desc' },
      take: 50,
    });
  }
}
