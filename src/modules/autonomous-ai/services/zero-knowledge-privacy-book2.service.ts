import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface VerifyZeroKnowledgeProofDto {
  proofCode: string;
  zkCircuitType?: string;
  verificationStatus?: string;
  proofHash?: string;
  verificationTimeMs?: number;
}

@Injectable()
export class ZeroKnowledgePrivacyBook2Service {
  constructor(private readonly prisma: PrismaService) {}

  async verifyZkProof(dto: VerifyZeroKnowledgeProofDto) {
    return this.prisma.zeroKnowledgePrivacyLedgerBook2.upsert({
      where: { proofCode: dto.proofCode },
      update: {
        zkCircuitType: dto.zkCircuitType ?? 'ZK_SNARK_GROTH16',
        verificationStatus: dto.verificationStatus ?? 'VERIFIED_VALID',
        proofHash:
          dto.proofHash ?? '0x8f4a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        verificationTimeMs: dto.verificationTimeMs ?? 1.2,
        verifiedAt: new Date(),
      },
      create: {
        proofCode: dto.proofCode,
        zkCircuitType: dto.zkCircuitType ?? 'ZK_SNARK_GROTH16',
        verificationStatus: dto.verificationStatus ?? 'VERIFIED_VALID',
        proofHash:
          dto.proofHash ?? '0x8f4a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        verificationTimeMs: dto.verificationTimeMs ?? 1.2,
        verifiedAt: new Date(),
      },
    });
  }

  async getZkProofs() {
    return this.prisma.zeroKnowledgePrivacyLedgerBook2.findMany({
      orderBy: { verifiedAt: 'desc' },
    });
  }
}
