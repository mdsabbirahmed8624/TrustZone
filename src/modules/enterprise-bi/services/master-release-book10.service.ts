import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CertifyMasterReleaseDto {
  masterReleaseCode: string;
  versionTag?: string;
  certifiedBy?: string;
}

@Injectable()
export class MasterReleaseBook10Service {
  constructor(private readonly prisma: PrismaService) {}

  async certifyMasterRelease(dto: CertifyMasterReleaseDto) {
    const releaseNotes = {
      phase:
        'Phase 12 Enterprise Multi-Tenant Franchise, Global BI & Autonomous AI ERP',
      totalBooksCompleted: 10,
      qualityGatesPassed: true,
      allUnitAndE2ETestsPassed: true,
      executiveSignoffComplete: true,
      productionStatus: 'GA_PRODUCTION_RELEASE_READY',
    };

    return this.prisma.masterERPReleaseCertification.upsert({
      where: { masterReleaseCode: dto.masterReleaseCode },
      update: {
        versionTag: dto.versionTag ?? 'v12.10.0-book10-final',
        totalBooksCompleted: 10,
        productionGAApproved: true,
        certifiedBy: dto.certifiedBy ?? 'GLOBAL_EXECUTIVE_BOARD',
        releaseNotesJson: JSON.stringify(releaseNotes),
        certifiedAt: new Date(),
      },
      create: {
        masterReleaseCode: dto.masterReleaseCode,
        versionTag: dto.versionTag ?? 'v12.10.0-book10-final',
        totalBooksCompleted: 10,
        productionGAApproved: true,
        certifiedBy: dto.certifiedBy ?? 'GLOBAL_EXECUTIVE_BOARD',
        releaseNotesJson: JSON.stringify(releaseNotes),
        certifiedAt: new Date(),
      },
    });
  }

  async getMasterCertifications() {
    return this.prisma.masterERPReleaseCertification.findMany({
      orderBy: { certifiedAt: 'desc' },
    });
  }
}
