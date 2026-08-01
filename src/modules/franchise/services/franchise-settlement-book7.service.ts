import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProcessSettlementDto {
  settlementCode: string;
  franchiseOrgId: string;
  netRoyaltyAmount?: number;
  escrowStatus?: string;
}

@Injectable()
export class FranchiseSettlementBook7Service {
  constructor(private readonly prisma: PrismaService) {}

  async processSettlement(dto: ProcessSettlementDto) {
    return this.prisma.franchiseRoyaltySettlementBook7.upsert({
      where: { settlementCode: dto.settlementCode },
      update: {
        franchiseOrgId: dto.franchiseOrgId,
        netRoyaltyAmount: dto.netRoyaltyAmount ?? 12500.0,
        escrowStatus: dto.escrowStatus ?? 'ESCROW_RELEASED',
        settledAt: new Date(),
      },
      create: {
        settlementCode: dto.settlementCode,
        franchiseOrgId: dto.franchiseOrgId,
        netRoyaltyAmount: dto.netRoyaltyAmount ?? 12500.0,
        escrowStatus: dto.escrowStatus ?? 'ESCROW_RELEASED',
        settledAt: new Date(),
      },
    });
  }

  async getSettlements() {
    return this.prisma.franchiseRoyaltySettlementBook7.findMany({
      orderBy: { settledAt: 'desc' },
    });
  }
}
