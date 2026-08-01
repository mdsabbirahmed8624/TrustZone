import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExecuteSignoffDto {
  signoffCode: string;
  releaseVersion?: string;
  signoffRole?: string;
  approvalStatus?: string;
}

@Injectable()
export class ExecutiveSignoffBook8Service {
  constructor(private readonly prisma: PrismaService) {}

  async executeSignoff(dto: ExecuteSignoffDto) {
    return this.prisma.executiveSignoffBook8.upsert({
      where: { signoffCode: dto.signoffCode },
      update: {
        releaseVersion: dto.releaseVersion ?? '13.8.0-GA',
        signoffRole: dto.signoffRole ?? 'CHIEF_TECHNOLOGY_OFFICER',
        approvalStatus: dto.approvalStatus ?? 'APPROVED',
        signedOffAt: new Date(),
      },
      create: {
        signoffCode: dto.signoffCode,
        releaseVersion: dto.releaseVersion ?? '13.8.0-GA',
        signoffRole: dto.signoffRole ?? 'CHIEF_TECHNOLOGY_OFFICER',
        approvalStatus: dto.approvalStatus ?? 'APPROVED',
        signedOffAt: new Date(),
      },
    });
  }

  async getSignoffs() {
    return this.prisma.executiveSignoffBook8.findMany({
      orderBy: { signedOffAt: 'desc' },
    });
  }
}
