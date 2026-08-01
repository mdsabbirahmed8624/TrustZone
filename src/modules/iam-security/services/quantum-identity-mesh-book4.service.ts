import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterIdentityLedgerDto {
  ledgerCode: string;
  identitySubject: string;
  verificationNodeId: string;
  meshSignatureAlgorithm?: string;
}

@Injectable()
export class QuantumIdentityMeshBook4Service {
  constructor(private readonly prisma: PrismaService) {}

  async registerIdentityLedger(dto: RegisterIdentityLedgerDto) {
    return this.prisma.quantumIdentityMeshLedger.upsert({
      where: { ledgerCode: dto.ledgerCode },
      update: {
        identitySubject: dto.identitySubject,
        verificationNodeId: dto.verificationNodeId,
        meshSignatureAlgorithm:
          dto.meshSignatureAlgorithm ?? 'Falcon-1024-Signature',
        verificationStatus: 'VERIFIED',
        signedAt: new Date(),
      },
      create: {
        ledgerCode: dto.ledgerCode,
        identitySubject: dto.identitySubject,
        verificationNodeId: dto.verificationNodeId,
        meshSignatureAlgorithm:
          dto.meshSignatureAlgorithm ?? 'Falcon-1024-Signature',
        verificationStatus: 'VERIFIED',
        signedAt: new Date(),
      },
    });
  }

  async getIdentityLedgers() {
    return this.prisma.quantumIdentityMeshLedger.findMany({
      orderBy: { signedAt: 'desc' },
    });
  }
}
