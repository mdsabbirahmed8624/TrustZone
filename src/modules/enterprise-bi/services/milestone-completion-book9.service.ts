import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IssueCertificateDto {
  certificateCode: string;
  milestoneTitle?: string;
  certifiedByRole?: string;
  certificationStatus?: string;
}

@Injectable()
export class MilestoneCompletionBook9Service {
  constructor(private readonly prisma: PrismaService) {}

  async issueCertificate(dto: IssueCertificateDto) {
    return this.prisma.milestoneCompletionCertificateBook9.upsert({
      where: { certificateCode: dto.certificateCode },
      update: {
        milestoneTitle:
          dto.milestoneTitle ?? 'PHASE_13_QUANTUM_RESISTANT_ENTERPRISE_ERP',
        certifiedByRole: dto.certifiedByRole ?? 'CHIEF_ENTERPRISE_ARCHITECT',
        certificationStatus: dto.certificationStatus ?? 'PASSED_CERTIFIED',
        issuedAt: new Date(),
      },
      create: {
        certificateCode: dto.certificateCode,
        milestoneTitle:
          dto.milestoneTitle ?? 'PHASE_13_QUANTUM_RESISTANT_ENTERPRISE_ERP',
        certifiedByRole: dto.certifiedByRole ?? 'CHIEF_ENTERPRISE_ARCHITECT',
        certificationStatus: dto.certificationStatus ?? 'PASSED_CERTIFIED',
        issuedAt: new Date(),
      },
    });
  }

  async getCertificates() {
    return this.prisma.milestoneCompletionCertificateBook9.findMany({
      orderBy: { issuedAt: 'desc' },
    });
  }
}
