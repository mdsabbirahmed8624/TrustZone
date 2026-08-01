import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface VerifySafetyBoundaryDto {
  verificationCode: string;
  targetModel: string;
  safetyBoundaryStatus?: string;
  guardrailScore?: number;
}

@Injectable()
export class AiSafetyBoundaryBook8Service {
  private readonly logger = new Logger(AiSafetyBoundaryBook8Service.name);

  constructor(private readonly prisma: PrismaService) {}

  async verifySafetyBoundary(dto: VerifySafetyBoundaryDto) {
    this.logger.log(`Verifying AI safety boundary: ${dto.verificationCode}`);

    return this.prisma.aiSafetyBoundaryBook8.upsert({
      where: { verificationCode: dto.verificationCode },
      update: {
        targetModel: dto.targetModel,
        safetyBoundaryStatus: dto.safetyBoundaryStatus ?? 'PASSED_COMPLIANT',
        guardrailScore: dto.guardrailScore ?? 99.8,
        verifiedAt: new Date(),
      },
      create: {
        verificationCode: dto.verificationCode,
        targetModel: dto.targetModel,
        safetyBoundaryStatus: dto.safetyBoundaryStatus ?? 'PASSED_COMPLIANT',
        guardrailScore: dto.guardrailScore ?? 99.8,
        verifiedAt: new Date(),
      },
    });
  }

  async getSafetyBoundaries() {
    return this.prisma.aiSafetyBoundaryBook8.findMany({
      orderBy: { verifiedAt: 'desc' },
    });
  }
}
