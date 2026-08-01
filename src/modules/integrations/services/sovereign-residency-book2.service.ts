import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateResidencyPolicyDto {
  policyCode: string;
  regionZone: string;
  jurisdictionCountry: string;
  cloudProvider?: string;
  encryptionMode?: string;
}

@Injectable()
export class SovereignResidencyBook2Service {
  constructor(private readonly prisma: PrismaService) {}

  async createResidencyPolicy(dto: CreateResidencyPolicyDto) {
    return this.prisma.sovereignDataResidencyPolicy.upsert({
      where: { policyCode: dto.policyCode },
      update: {
        regionZone: dto.regionZone,
        jurisdictionCountry: dto.jurisdictionCountry,
        cloudProvider: dto.cloudProvider ?? 'AWS_SOVEREIGN_EU',
        encryptionMode: dto.encryptionMode ?? 'HOMOMORPHIC_ENCRYPTED',
        complianceStatus: 'COMPLIANT',
      },
      create: {
        policyCode: dto.policyCode,
        regionZone: dto.regionZone,
        jurisdictionCountry: dto.jurisdictionCountry,
        cloudProvider: dto.cloudProvider ?? 'AWS_SOVEREIGN_EU',
        encryptionMode: dto.encryptionMode ?? 'HOMOMORPHIC_ENCRYPTED',
        complianceStatus: 'COMPLIANT',
      },
    });
  }

  async getResidencyPolicies() {
    return this.prisma.sovereignDataResidencyPolicy.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
