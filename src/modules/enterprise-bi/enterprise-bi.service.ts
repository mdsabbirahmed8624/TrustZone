import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnterpriseBIService {
  constructor(private readonly prisma: PrismaService) {}

  async generateGlobalRollup(period: string) {
    const activeBranches = await this.prisma.branch.count();
    const activeFranchises = await this.prisma.franchise.count({
      where: { status: 'ACTIVE' },
    });

    const incomeAgg = await this.prisma.income.aggregate({
      _sum: { amount: true },
    });

    const expenseAgg = await this.prisma.expense.aggregate({
      _sum: { amount: true },
    });

    const salesAgg = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
    });

    const servicesRevenue = Number(incomeAgg._sum.amount ?? 0);
    const retailRevenue = Number(salesAgg._sum.totalAmount ?? 0);
    const totalRevenue = servicesRevenue + retailRevenue;
    const totalExpense = Number(expenseAgg._sum.amount ?? 0);
    const netProfit = totalRevenue - totalExpense;

    const metricsData = {
      branches: activeBranches,
      franchises: activeFranchises,
      revenueBreakdown: {
        services: servicesRevenue,
        retailPOS: retailRevenue,
      },
      ebitdaMarginPercentage:
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };

    return this.prisma.enterpriseBIReport.create({
      data: {
        reportType: 'GLOBAL_ROLLUP',
        period,
        totalRevenue,
        totalExpense,
        netProfit,
        activeBranches,
        activeFranchises,
        metricsJson: JSON.stringify(metricsData),
      },
    });
  }

  async getFranchiseMatrix() {
    const franchises = await this.prisma.franchise.findMany({
      include: {
        settlements: true,
      },
    });

    return franchises.map((f) => {
      const gross = f.settlements.reduce(
        (acc, s) => acc + Number(s.grossRevenue),
        0,
      );
      const royalties = f.settlements.reduce(
        (acc, s) => acc + Number(s.royaltyAmount),
        0,
      );
      return {
        franchiseId: f.id,
        code: f.code,
        name: f.name,
        territory: f.territory,
        status: f.status,
        totalSettlements: f.settlements.length,
        accumulatedGrossRevenue: gross,
        accumulatedRoyalties: royalties,
      };
    });
  }

  async getExecutiveForecast(monthsAhead: number = 12) {
    const latestReport = await this.prisma.enterpriseBIReport.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const baseRevenue = latestReport?.totalRevenue ?? 100000;
    const baseExpense = latestReport?.totalExpense ?? 60000;

    const forecastTimeline = [];
    const monthlyGrowthRate = 0.04; // Projected 4% MoM growth

    for (let i = 1; i <= monthsAhead; i++) {
      const projectedRevenue = Math.round(
        baseRevenue * Math.pow(1 + monthlyGrowthRate, i),
      );
      const projectedExpense = Math.round(
        baseExpense * Math.pow(1 + monthlyGrowthRate * 0.5, i),
      );
      forecastTimeline.push({
        monthIndex: i,
        projectedRevenue,
        projectedExpense,
        projectedNetProfit: projectedRevenue - projectedExpense,
      });
    }

    return {
      forecastHorizonMonths: monthsAhead,
      growthAssumption: '4% MoM',
      baselineRevenue: baseRevenue,
      timeline: forecastTimeline,
    };
  }

  async getMultiRegionConfigs() {
    return this.prisma.multiRegionConfig.findMany();
  }

  async upsertRegionConfig(
    regionCode: string,
    regionName: string,
    primaryDbUrl: string,
    currency: string,
  ) {
    return this.prisma.multiRegionConfig.upsert({
      where: { regionCode },
      update: {
        regionName,
        primaryDbUrl,
        currency,
      },
      create: {
        regionCode,
        regionName,
        primaryDbUrl,
        readReplicaUrls: [],
        currency,
        status: 'ACTIVE',
      },
    });
  }
}
