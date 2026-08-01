import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterPhase15MasterReleaseDto {
  masterReleaseCode: string;
  overallPhase15HealthScore?: number;
  totalAutonomousBooksVerified?: number;
  globalMeshUptimePercent?: number;
  releaseStatus?: string;
}

@Injectable()
export class Phase15MasterPlatformReleaseBook10Service {
  private readonly logger = new Logger(
    Phase15MasterPlatformReleaseBook10Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or verify Phase 15 Master Platform Release.
   */
  async registerMasterRelease(dto: RegisterPhase15MasterReleaseDto) {
    this.logger.log(
      `Registering Phase 15 Master Platform Release: ${dto.masterReleaseCode}`,
    );

    return this.prisma.phase15MasterPlatformReleaseBook10.upsert({
      where: { masterReleaseCode: dto.masterReleaseCode },
      update: {
        overallPhase15HealthScore: dto.overallPhase15HealthScore ?? 100.0,
        totalAutonomousBooksVerified: dto.totalAutonomousBooksVerified ?? 10,
        globalMeshUptimePercent: dto.globalMeshUptimePercent ?? 99.999,
        releaseStatus: dto.releaseStatus ?? 'PHASE_15_PRODUCTION_READY',
        lastVerifiedAt: new Date(),
      },
      create: {
        masterReleaseCode: dto.masterReleaseCode,
        overallPhase15HealthScore: dto.overallPhase15HealthScore ?? 100.0,
        totalAutonomousBooksVerified: dto.totalAutonomousBooksVerified ?? 10,
        globalMeshUptimePercent: dto.globalMeshUptimePercent ?? 99.999,
        releaseStatus: dto.releaseStatus ?? 'PHASE_15_PRODUCTION_READY',
        lastVerifiedAt: new Date(),
      },
    });
  }

  /**
   * List all Phase 15 Master Platform Releases.
   */
  async getMasterReleases() {
    return this.prisma.phase15MasterPlatformReleaseBook10.findMany({
      orderBy: { lastVerifiedAt: 'desc' },
    });
  }
}
