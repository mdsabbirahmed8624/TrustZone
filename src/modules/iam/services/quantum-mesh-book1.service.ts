import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterMeshKeyDto {
  keyId: string;
  meshNodeId: string;
  algorithm?: string;
  keyLengthBits?: number;
  expiresInDays?: number;
}

@Injectable()
export class QuantumMeshBook1Service {
  constructor(private readonly prisma: PrismaService) {}

  async registerMeshKey(dto: RegisterMeshKeyDto) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.expiresInDays || 30));

    return this.prisma.quantumResistantMeshKey.upsert({
      where: { keyId: dto.keyId },
      update: {
        algorithm: dto.algorithm ?? 'CRYSTALS-Kyber-1024',
        keyLengthBits: dto.keyLengthBits ?? 1024,
        meshNodeId: dto.meshNodeId,
        status: 'ACTIVE',
        expiresAt,
      },
      create: {
        keyId: dto.keyId,
        algorithm: dto.algorithm ?? 'CRYSTALS-Kyber-1024',
        keyLengthBits: dto.keyLengthBits ?? 1024,
        meshNodeId: dto.meshNodeId,
        status: 'ACTIVE',
        expiresAt,
      },
    });
  }

  async getMeshKeys() {
    return this.prisma.quantumResistantMeshKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
