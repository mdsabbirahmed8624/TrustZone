import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IssueCertificateDto {
  certificateCode: string;
  milestoneTitle?: string;
  signoffOfficer?: string;
}

@Injectable()
export class MilestoneBook9Service {
  constructor(private readonly prisma: PrismaService) {}

  async issueMilestoneCertificate(dto: IssueCertificateDto) {
    return this.prisma.milestoneCompletionCertificate.upsert({
      where: { certificateCode: dto.certificateCode },
      update: {
        milestoneTitle:
          dto.milestoneTitle ??
          'PHASE 12 ENTERPRISE PLATFORM MILESTONE COMPLETE',
        completedBooksCount: 9,
        completionStatus: 'MILESTONE_SUCCESSFULLY_COMPLETED',
        signoffOfficer: dto.signoffOfficer ?? 'CHIEF_ARCHITECT',
        certifiedAt: new Date(),
      },
      create: {
        certificateCode: dto.certificateCode,
        milestoneTitle:
          dto.milestoneTitle ??
          'PHASE 12 ENTERPRISE PLATFORM MILESTONE COMPLETE',
        completedBooksCount: 9,
        completionStatus: 'MILESTONE_SUCCESSFULLY_COMPLETED',
        signoffOfficer: dto.signoffOfficer ?? 'CHIEF_ARCHITECT',
        certifiedAt: new Date(),
      },
    });
  }

  async getMilestoneCertificates() {
    return this.prisma.milestoneCompletionCertificate.findMany({
      orderBy: { certifiedAt: 'desc' },
    });
  }
}
