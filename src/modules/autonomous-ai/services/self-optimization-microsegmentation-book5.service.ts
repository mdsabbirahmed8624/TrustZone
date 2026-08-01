import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterMicrosegmentDto {
  microsegmentCode: string;
  isolationSecurityPolicy?: string;
  threatMitigationSpeedMs?: number;
  complianceSecurityScore?: number;
  segmentStatus?: string;
}

@Injectable()
export class SelfOptimizingZeroTrustMicrosegmentationBook5Service {
  private readonly logger = new Logger(
    SelfOptimizingZeroTrustMicrosegmentationBook5Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or enforce zero-trust microsegmentation policy.
   */
  async registerMicrosegment(dto: RegisterMicrosegmentDto) {
    this.logger.log(
      `Registering self-optimizing zero-trust microsegmentation: ${dto.microsegmentCode}`,
    );

    return this.prisma.selfOptimizingZeroTrustMicrosegmentationBook5.upsert({
      where: { microsegmentCode: dto.microsegmentCode },
      update: {
        isolationSecurityPolicy:
          dto.isolationSecurityPolicy ?? 'ZERO_TRUST_STRICT_ENCLAVE',
        threatMitigationSpeedMs: dto.threatMitigationSpeedMs ?? 45,
        complianceSecurityScore: dto.complianceSecurityScore ?? 100.0,
        segmentStatus: dto.segmentStatus ?? 'ENCLAVE_ISOLATED_ACTIVE',
        lastPolicyEnforcedAt: new Date(),
      },
      create: {
        microsegmentCode: dto.microsegmentCode,
        isolationSecurityPolicy:
          dto.isolationSecurityPolicy ?? 'ZERO_TRUST_STRICT_ENCLAVE',
        threatMitigationSpeedMs: dto.threatMitigationSpeedMs ?? 45,
        complianceSecurityScore: dto.complianceSecurityScore ?? 100.0,
        segmentStatus: dto.segmentStatus ?? 'ENCLAVE_ISOLATED_ACTIVE',
        lastPolicyEnforcedAt: new Date(),
      },
    });
  }

  /**
   * List all self-optimizing zero-trust microsegmentations.
   */
  async getMicrosegments() {
    return this.prisma.selfOptimizingZeroTrustMicrosegmentationBook5.findMany({
      orderBy: { lastPolicyEnforcedAt: 'desc' },
    });
  }
}
