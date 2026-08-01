import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFranchiseDto {
  name: string;
  code: string;
  ownerEmail: string;
  royaltyRate?: number;
  territory: string;
}

export interface CreateAgreementDto {
  franchiseId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  royaltyRate: number;
}

@Injectable()
export class FranchiseService {
  constructor(private readonly prisma: PrismaService) {}

  async createFranchise(dto: CreateFranchiseDto) {
    const existing = await this.prisma.franchise.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(
        `Franchise code '${dto.code}' is already registered.`,
      );
    }

    return this.prisma.franchise.create({
      data: {
        name: dto.name,
        code: dto.code,
        ownerEmail: dto.ownerEmail,
        royaltyRate: dto.royaltyRate ?? 0.05,
        territory: dto.territory,
        status: 'ACTIVE',
      },
    });
  }

  async getAllFranchises() {
    return this.prisma.franchise.findMany({
      include: {
        agreements: true,
        settlements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async getFranchiseById(id: string) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id },
      include: {
        agreements: true,
        settlements: true,
      },
    });

    if (!franchise) {
      throw new NotFoundException(`Franchise with ID '${id}' not found.`);
    }
    return franchise;
  }

  async createAgreement(dto: CreateAgreementDto) {
    await this.getFranchiseById(dto.franchiseId);

    return this.prisma.franchiseAgreement.create({
      data: {
        franchiseId: dto.franchiseId,
        contractNumber: dto.contractNumber,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        royaltyRate: dto.royaltyRate,
        status: 'ACTIVE',
      },
    });
  }

  async calculateSettlement(
    franchiseId: string,
    period: string,
    grossRevenue: number,
  ) {
    const franchise = await this.getFranchiseById(franchiseId);

    const royaltyAmount = grossRevenue * franchise.royaltyRate;
    const netPayout = grossRevenue - royaltyAmount;

    return this.prisma.franchiseSettlement.create({
      data: {
        franchiseId,
        period,
        grossRevenue,
        royaltyAmount,
        netPayout,
        status: 'SETTLED',
        settledAt: new Date(),
      },
    });
  }

  async getSettlements(franchiseId: string) {
    return this.prisma.franchiseSettlement.findMany({
      where: { franchiseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFranchiseKPIs() {
    const totalFranchises = await this.prisma.franchise.count({
      where: { status: 'ACTIVE' },
    });

    const settlements = await this.prisma.franchiseSettlement.aggregate({
      _sum: {
        grossRevenue: true,
        royaltyAmount: true,
        netPayout: true,
      },
    });

    return {
      activeFranchises: totalFranchises,
      totalGrossRevenue: settlements._sum.grossRevenue ?? 0,
      totalRoyaltiesCollected: settlements._sum.royaltyAmount ?? 0,
      totalNetPayouts: settlements._sum.netPayout ?? 0,
    };
  }
}
