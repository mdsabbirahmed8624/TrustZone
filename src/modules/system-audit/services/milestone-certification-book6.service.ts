import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IssueCertificationDto {
  certCode: string;
  phaseBookTitle: string;
  auditorRole?: string;
  certificationStatus?: string;
}

@Injectable()
export class MilestoneCertificationBook6Service {
  constructor(private readonly prisma: PrismaService) {}

  async issueCertification(dto: IssueCertificationDto) {
    return this.prisma.globalMilestoneCertificationBook6.upsert({
      where: { certCode: dto.certCode },
      update: {
        phaseBookTitle: dto.phaseBookTitle,
        auditorRole: dto.auditorRole ?? 'CHIEF_ENTERPRISE_ARCHITECT',
        certificationStatus: dto.certificationStatus ?? 'CERTIFIED',
        certifiedAt: new Date(),
      },
      create: {
        certCode: dto.certCode,
        phaseBookTitle: dto.phaseBookTitle,
        auditorRole: dto.auditorRole ?? 'CHIEF_ENTERPRISE_ARCHITECT',
        certificationStatus: dto.certificationStatus ?? 'CERTIFIED',
        certifiedAt: new Date(),
      },
    });
  }

  async getCertifications() {
    return this.prisma.globalMilestoneCertificationBook6.findMany({
      orderBy: { certifiedAt: 'desc' },
    });
  }
}
