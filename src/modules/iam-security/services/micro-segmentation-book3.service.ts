import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateMicroSegmentationPolicyDto {
  policyId: string;
  workloadGroup: string;
  sourceSegment: string;
  targetSegment: string;
  allowedPorts?: number[];
  enforcementMode?: string;
}

@Injectable()
export class MicroSegmentationBook3Service {
  constructor(private readonly prisma: PrismaService) {}

  async createMicroSegmentationPolicy(dto: CreateMicroSegmentationPolicyDto) {
    return this.prisma.zeroTrustMicroSegmentationPolicy.upsert({
      where: { policyId: dto.policyId },
      update: {
        workloadGroup: dto.workloadGroup,
        sourceSegment: dto.sourceSegment,
        targetSegment: dto.targetSegment,
        allowedPortsJson: JSON.stringify(dto.allowedPorts || [5432, 6379]),
        enforcementMode: dto.enforcementMode ?? 'STRICT_ENFORCE',
        status: 'ACTIVE',
      },
      create: {
        policyId: dto.policyId,
        workloadGroup: dto.workloadGroup,
        sourceSegment: dto.sourceSegment,
        targetSegment: dto.targetSegment,
        allowedPortsJson: JSON.stringify(dto.allowedPorts || [5432, 6379]),
        enforcementMode: dto.enforcementMode ?? 'STRICT_ENFORCE',
        status: 'ACTIVE',
      },
    });
  }

  async getMicroSegmentationPolicies() {
    return this.prisma.zeroTrustMicroSegmentationPolicy.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
