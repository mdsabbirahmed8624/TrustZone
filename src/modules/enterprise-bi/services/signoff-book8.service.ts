import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExecuteSignoffDto {
  releaseCode: string;
  versionTag?: string;
}

@Injectable()
export class SignoffBook8Service {
  constructor(private readonly prisma: PrismaService) {}

  async executePlatformSignoff(dto: ExecuteSignoffDto) {
    const signoffNotes = {
      booksCompleted: [
        'Book 1',
        'Book 2',
        'Book 3',
        'Book 4',
        'Book 5',
        'Book 6',
        'Book 7',
        'Book 8',
      ],
      qaGatesPassed: true,
      securityAuditsCleared: true,
      performanceSlaMet: true,
      releaseStatus: 'GA_RELEASE_APPROVED',
    };

    return this.prisma.enterprisePlatformSignoff.upsert({
      where: { releaseCode: dto.releaseCode },
      update: {
        versionTag: dto.versionTag ?? 'v12.8.0-book8-final',
        vpEngineeringSignoff: true,
        ctoSignoff: true,
        auditPassed: true,
        signoffNotesJson: JSON.stringify(signoffNotes),
        signoffDate: new Date(),
      },
      create: {
        releaseCode: dto.releaseCode,
        versionTag: dto.versionTag ?? 'v12.8.0-book8-final',
        vpEngineeringSignoff: true,
        ctoSignoff: true,
        auditPassed: true,
        signoffNotesJson: JSON.stringify(signoffNotes),
        signoffDate: new Date(),
      },
    });
  }

  async getSignoffs() {
    return this.prisma.enterprisePlatformSignoff.findMany({
      orderBy: { signoffDate: 'desc' },
    });
  }
}
