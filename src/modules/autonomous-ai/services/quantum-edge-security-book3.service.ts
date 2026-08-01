import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface EnforceQuantumEdgeSecurityPolicyDto {
  policyCode: string;
  encryptionAlgorithm?: string;
  enforcementScope?: string;
  zeroTrustStatus?: string;
}

@Injectable()
export class QuantumEdgeSecurityBook3Service {
  constructor(private readonly prisma: PrismaService) {}

  async enforceSecurityPolicy(dto: EnforceQuantumEdgeSecurityPolicyDto) {
    return this.prisma.quantumEdgeSecurityPolicyBook3.upsert({
      where: { policyCode: dto.policyCode },
      update: {
        encryptionAlgorithm:
          dto.encryptionAlgorithm ?? 'CRYPTONIGHT_LITHIUM_ML_KEM',
        enforcementScope: dto.enforcementScope ?? 'GLOBAL_EDGE_MESH_NODES',
        zeroTrustStatus: dto.zeroTrustStatus ?? 'STRICT_ENFORCED',
        lastKeyRotationAt: new Date(),
      },
      create: {
        policyCode: dto.policyCode,
        encryptionAlgorithm:
          dto.encryptionAlgorithm ?? 'CRYPTONIGHT_LITHIUM_ML_KEM',
        enforcementScope: dto.enforcementScope ?? 'GLOBAL_EDGE_MESH_NODES',
        zeroTrustStatus: dto.zeroTrustStatus ?? 'STRICT_ENFORCED',
        lastKeyRotationAt: new Date(),
      },
    });
  }

  async getSecurityPolicies() {
    return this.prisma.quantumEdgeSecurityPolicyBook3.findMany({
      orderBy: { lastKeyRotationAt: 'desc' },
    });
  }
}
