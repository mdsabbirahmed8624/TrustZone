import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface VerifyQuantumIdentityMeshDto {
  didIdentifier: string;
  meshNodeRole?: string;
  cryptographicPublicKey?: string;
  verificationStatus?: string;
}

@Injectable()
export class QuantumIdentityMeshBook4Service {
  constructor(private readonly prisma: PrismaService) {}

  async verifyNodeIdentity(dto: VerifyQuantumIdentityMeshDto) {
    return this.prisma.quantumIdentityMeshBook4.upsert({
      where: { didIdentifier: dto.didIdentifier },
      update: {
        meshNodeRole: dto.meshNodeRole ?? 'EDGE_TELEMETRY_ROUTER',
        cryptographicPublicKey:
          dto.cryptographicPublicKey ??
          '0x04f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        verificationStatus: dto.verificationStatus ?? 'AUTHENTICATED_ACTIVE',
        lastVerifiedAt: new Date(),
      },
      create: {
        didIdentifier: dto.didIdentifier,
        meshNodeRole: dto.meshNodeRole ?? 'EDGE_TELEMETRY_ROUTER',
        cryptographicPublicKey:
          dto.cryptographicPublicKey ??
          '0x04f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        verificationStatus: dto.verificationStatus ?? 'AUTHENTICATED_ACTIVE',
        lastVerifiedAt: new Date(),
      },
    });
  }

  async getIdentities() {
    return this.prisma.quantumIdentityMeshBook4.findMany({
      orderBy: { lastVerifiedAt: 'desc' },
    });
  }
}
