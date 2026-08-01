import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SalesAnalyticsService {
  private readonly logger = new Logger(SalesAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executive Retail & POS Sales Dashboard
   */
  async getExecutiveDashboard() {
    const totalSales = await this.prisma.sale.count();
    const paidSales = await this.prisma.sale.findMany({
      where: { paymentStatus: 'PAID' },
      include: { items: true },
    });

    const grossRevenue = paidSales.reduce(
      (acc, s) => acc + Number(s.totalAmount),
      0,
    );
    const totalTaxCollected = paidSales.reduce(
      (acc, s) => acc + Number(s.taxAmount),
      0,
    );
    const totalDiscountsGranted = paidSales.reduce(
      (acc, s) => acc + Number(s.discountAmount),
      0,
    );

    const totalReturns = await this.prisma.returnOrder.count();
    const totalExchanges = await this.prisma.exchangeOrder.count();

    const activeCounters = await this.prisma.pOSCounter.count({
      where: { status: 'ACTIVE' },
    });
    const openShifts = await this.prisma.pOSShift.count({
      where: { status: 'OPEN' },
    });

    return {
      overview: {
        totalSalesCount: totalSales,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        totalTaxCollected: Number(totalTaxCollected.toFixed(2)),
        totalDiscountsGranted: Number(totalDiscountsGranted.toFixed(2)),
        totalReturnsCount: totalReturns,
        totalExchangesCount: totalExchanges,
        activeCountersCount: activeCounters,
        openShiftsCount: openShifts,
        averageOrderValue:
          totalSales > 0 ? Number((grossRevenue / totalSales).toFixed(2)) : 0,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
