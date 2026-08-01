import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateTierDto {
  tierName: string;
  minRevenueThreshold: number;
  royaltyDiscountRate?: number;
  marketingFundPercentage?: number;
  perks: string[];
}

export interface CreateTerritoryDto {
  zoneCode: string;
  zoneName: string;
  country?: string;
  stateRegion: string;
  exclusiveRights?: boolean;
}

export interface CreateComplianceAuditDto {
  franchiseId: string;
  auditorName: string;
  complianceScore: number;
  findings: Record<string, any>;
  actionRequired?: string;
}

@Injectable()
export class FranchiseBook1Service {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. FRANCHISE TIER MANAGEMENT
  // ----------------------------------------------------
  async upsertTier(dto: CreateTierDto) {
    return this.prisma.franchiseTier.upsert({
      where: { tierName: dto.tierName },
      update: {
        minRevenueThreshold: dto.minRevenueThreshold,
        royaltyDiscountRate: dto.royaltyDiscountRate ?? 0.0,
        marketingFundPercentage: dto.marketingFundPercentage ?? 0.02,
        perksJson: JSON.stringify(dto.perks || []),
      },
      create: {
        tierName: dto.tierName,
        minRevenueThreshold: dto.minRevenueThreshold,
        royaltyDiscountRate: dto.royaltyDiscountRate ?? 0.0,
        marketingFundPercentage: dto.marketingFundPercentage ?? 0.02,
        perksJson: JSON.stringify(dto.perks || []),
      },
    });
  }

  async getTiers() {
    return this.prisma.franchiseTier.findMany({
      orderBy: { minRevenueThreshold: 'desc' },
    });
  }

  async evaluateFranchiseTier(franchiseId: string) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
      include: { settlements: true },
    });

    if (!franchise) {
      throw new NotFoundException(
        `Franchise with ID '${franchiseId}' not found.`,
      );
    }

    const totalRevenue = franchise.settlements.reduce(
      (sum, s) => sum + Number(s.grossRevenue),
      0,
    );

    const tiers = await this.getTiers();
    let qualifiedTier = 'BRONZE';

    for (const tier of tiers) {
      if (totalRevenue >= tier.minRevenueThreshold) {
        qualifiedTier = tier.tierName;
        break;
      }
    }

    return {
      franchiseId,
      code: franchise.code,
      accumulatedGrossRevenue: totalRevenue,
      assignedTier: qualifiedTier,
    };
  }

  // ----------------------------------------------------
  // 2. TERRITORY ZONE MANAGEMENT
  // ----------------------------------------------------
  async createTerritoryZone(dto: CreateTerritoryDto) {
    const existing = await this.prisma.territoryZone.findUnique({
      where: { zoneCode: dto.zoneCode },
    });
    if (existing) {
      throw new BadRequestException(
        `Territory zone code '${dto.zoneCode}' already exists.`,
      );
    }

    return this.prisma.territoryZone.create({
      data: {
        zoneCode: dto.zoneCode,
        zoneName: dto.zoneName,
        country: dto.country ?? 'US',
        stateRegion: dto.stateRegion,
        exclusiveRights: dto.exclusiveRights ?? true,
        status: 'AVAILABLE',
      },
    });
  }

  async assignTerritoryZone(zoneId: string, franchiseId: string) {
    const zone = await this.prisma.territoryZone.findUnique({
      where: { id: zoneId },
    });
    if (!zone) {
      throw new NotFoundException(`Territory zone '${zoneId}' not found.`);
    }

    return this.prisma.territoryZone.update({
      where: { id: zoneId },
      data: {
        assignedFranchiseId: franchiseId,
        status: 'ASSIGNED',
      },
    });
  }

  async getTerritories() {
    return this.prisma.territoryZone.findMany();
  }

  // ----------------------------------------------------
  // 3. ROYALTY BILLING ENGINE
  // ----------------------------------------------------
  async generateRoyaltyInvoice(
    franchiseId: string,
    billingPeriod: string,
    grossSales: number,
    dueDate: Date,
  ) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });
    if (!franchise) {
      throw new NotFoundException(`Franchise '${franchiseId}' not found.`);
    }

    const tierEval = await this.evaluateFranchiseTier(franchiseId);
    const tier = await this.prisma.franchiseTier.findUnique({
      where: { tierName: tierEval.assignedTier },
    });

    const royaltyRate = franchise.royaltyRate;
    const baseRoyaltyFee = grossSales * royaltyRate;
    const marketingFeePercentage = tier?.marketingFundPercentage ?? 0.02;
    const marketingFee = grossSales * marketingFeePercentage;
    const tierDiscountPercentage = tier?.royaltyDiscountRate ?? 0.0;
    const tierDiscount = baseRoyaltyFee * tierDiscountPercentage;

    const totalDue = baseRoyaltyFee + marketingFee - tierDiscount;
    const invoiceNumber = `ROY-${billingPeriod}-${franchise.code}-${Date.now().toString().slice(-4)}`;

    return this.prisma.royaltyInvoice.create({
      data: {
        invoiceNumber,
        franchiseId,
        billingPeriod,
        grossSales,
        royaltyRate,
        baseRoyaltyFee,
        marketingFee,
        tierDiscount,
        totalDue,
        status: 'ISSUED',
        dueDate,
      },
    });
  }

  async payRoyaltyInvoice(invoiceId: string) {
    const invoice = await this.prisma.royaltyInvoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`Royalty invoice '${invoiceId}' not found.`);
    }

    return this.prisma.royaltyInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }

  async getRoyaltyInvoices(franchiseId?: string) {
    return this.prisma.royaltyInvoice.findMany({
      where: franchiseId ? { franchiseId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 4. PARTNER COMPLIANCE AUDIT
  // ----------------------------------------------------
  async createComplianceAudit(dto: CreateComplianceAuditDto) {
    const status =
      dto.complianceScore >= 85
        ? 'PASSED'
        : dto.complianceScore >= 70
          ? 'CONDITIONAL'
          : 'FAILED';

    return this.prisma.partnerComplianceAudit.create({
      data: {
        franchiseId: dto.franchiseId,
        auditorName: dto.auditorName,
        complianceScore: dto.complianceScore,
        complianceStatus: status,
        findingsJson: JSON.stringify(dto.findings || {}),
        actionRequired: dto.actionRequired,
      },
    });
  }

  async getFranchiseAudits(franchiseId: string) {
    return this.prisma.partnerComplianceAudit.findMany({
      where: { franchiseId },
      orderBy: { auditDate: 'desc' },
    });
  }
}
