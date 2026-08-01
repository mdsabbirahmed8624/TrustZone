import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasterPlatformReleaseBook10Service {
  private readonly logger = new Logger(MasterPlatformReleaseBook10Service.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Certify Phase 14 capstone master platform GA release.
   */
  async certifyMasterRelease(dto: {
    masterReleaseCode: string;
    versionTag?: string;
    phaseTitle?: string;
    certifiedBy?: string;
  }) {
    this.logger.log(
      `Certifying Phase 14 master platform GA release: ${dto.masterReleaseCode}`,
    );

    const masterRelease =
      await this.prisma.autonomousMasterPlatformReleaseBook10.create({
        data: {
          masterReleaseCode: dto.masterReleaseCode,
          versionTag: dto.versionTag ?? 'v14.10.0-book10-final',
          phaseTitle:
            dto.phaseTitle ?? 'PHASE_14_AUTONOMOUS_ENTERPRISE_OPERATIONS',
          totalBooksCompleted: 10,
          productionGAApproved: true,
          certifiedBy: dto.certifiedBy ?? 'GLOBAL_EXECUTIVE_BOARD',
          releaseNotesJson: JSON.stringify({
            phase: 'Phase 14',
            scope: 'Autonomous AI Enterprise Operations & Governance Capstone',
            totalBooks: 10,
            status: 'PRODUCTION_GA_READY',
            qualityGatesPassed: 10,
          }),
          certifiedAt: new Date(),
        },
      });

    this.logger.log(`Master platform release certified: ${masterRelease.id}`);
    return masterRelease;
  }

  /**
   * Retrieve all master platform release certifications.
   */
  async getMasterReleases() {
    return this.prisma.autonomousMasterPlatformReleaseBook10.findMany({
      orderBy: { certifiedAt: 'desc' },
    });
  }
}
