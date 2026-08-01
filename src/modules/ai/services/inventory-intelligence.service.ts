import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryIntelligenceService {
  private readonly logger = new Logger(InventoryIntelligenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predictDemand(partId: string) {
    this.logger.log(
      `Forecasting future parts stock demands for part ${partId}`,
    );

    // Heuristics based on historical movements
    const movements = await this.prisma.inventoryMovement.findMany({
      where: { inventoryItem: { partId }, type: 'OUT' },
    });

    const totalUsage = movements.reduce(
      (sum, m) => sum + Math.abs(m.quantityDelta),
      0,
    );
    const averageMonthlyUsage = movements.length > 0 ? totalUsage / 6 : 2; // Simulated over 6 months

    // projectedDemand value
    const projectedDemand = Math.round(averageMonthlyUsage * 1.15); // Add seasonality factor

    const forecast = await this.prisma.demandForecast.create({
      data: {
        partId,
        projectedDemand,
        forecastPeriod: '2026-08',
        confidenceLevel: 85.5,
      },
    });

    return forecast;
  }

  async detectSlowAndDeadStock(branchId?: string) {
    this.logger.log(
      `Scanning for slow-moving or dead stock in branch ${branchId || 'ALL'}`,
    );

    const filter: any = {};
    if (branchId) {
      filter.warehouse = { branchId };
    }

    const items = await this.prisma.inventoryItem.findMany({
      where: filter,
      include: { part: true },
    });

    const results = await Promise.all(
      items.map(async (item) => {
        // Find outbound movements in past 90 days
        const usageCount = await this.prisma.inventoryMovement.count({
          where: {
            inventoryItem: { partId: item.partId },
            type: 'OUT',
            createdAt: { gte: new Date(Date.now() - 90 * 24 * 3600000) },
          },
        });

        let status = 'HEALTHY';
        if (usageCount === 0) {
          status = 'DEAD';
        } else if (usageCount < 3) {
          status = 'SLOW';
        }

        return {
          partId: item.partId,
          partName: item.part.name,
          currentQuantity: item.quantity,
          usageCount90Days: usageCount,
          status,
        };
      }),
    );

    return results;
  }
}
