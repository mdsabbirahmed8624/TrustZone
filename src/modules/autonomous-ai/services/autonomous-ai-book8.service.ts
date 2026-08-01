import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface VerifyBoundaryDto {
  ruleId: string;
  safetyCheckCode: string;
  maxActionThreshold: number;
  evaluatedValue: number;
}

@Injectable()
export class AutonomousAIBook8Service {
  constructor(private readonly prisma: PrismaService) {}

  async verifySafetyBoundary(dto: VerifyBoundaryDto) {
    const safetyStatus =
      dto.evaluatedValue <= dto.maxActionThreshold
        ? 'PASSED'
        : 'BOUNDARY_EXCEEDED';

    return this.prisma.aISafetyBoundaryVerification.create({
      data: {
        ruleId: dto.ruleId,
        safetyCheckCode: dto.safetyCheckCode,
        maxActionThreshold: dto.maxActionThreshold,
        evaluatedValue: dto.evaluatedValue,
        safetyStatus,
      },
    });
  }

  async getSafetyVerifications() {
    return this.prisma.aISafetyBoundaryVerification.findMany({
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
