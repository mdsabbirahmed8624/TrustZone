import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupplierPerformanceService {
  private readonly logger = new Logger(SupplierPerformanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSupplierPerformance(supplierId: string) {
    this.logger.log(
      `Compiling performance scorecard for supplier ${supplierId}`,
    );

    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, isDeleted: false },
      include: {
        purchaseOrders: {
          include: {
            purchaseReceivings: true,
          },
        },
        supplierRmas: true,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier ${supplierId} not found.`);

    const totalOrders = supplier.purchaseOrders.length;
    const completedOrders = supplier.purchaseOrders.filter(
      (po) => po.status === 'RECEIVED',
    );

    // Calculate delivery times
    let totalDeliveryTimeHours = 0;
    let lateDeliveries = 0;
    const STANDARD_LEAD_TIME_HOURS = 7 * 24; // 7 days standard SLA

    completedOrders.forEach((po) => {
      if (po.purchaseReceivings && po.purchaseReceivings.length > 0) {
        const receivedAt = new Date(po.purchaseReceivings[0].createdAt);
        const createdAt = new Date(po.createdAt);
        const diffHours =
          (receivedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        totalDeliveryTimeHours += diffHours;

        if (diffHours > STANDARD_LEAD_TIME_HOURS) {
          lateDeliveries++;
        }
      }
    });

    const averageDeliveryTimeDays =
      completedOrders.length > 0
        ? Number(
            (totalDeliveryTimeHours / completedOrders.length / 24).toFixed(1),
          )
        : 0;

    const rmaCount = supplier.supplierRmas.length;
    const returnRatePercent =
      totalOrders > 0 ? Number(((rmaCount / totalOrders) * 100).toFixed(1)) : 0;

    const costPerformanceScore = 95.0; // Mock score out of 100 based on price matches

    return {
      supplierId: supplier.id,
      name: supplier.name,
      rating: supplier.rating,
      totalPurchaseOrders: totalOrders,
      completedOrdersCount: completedOrders.length,
      averageDeliveryTimeDays,
      lateDeliveriesCount: lateDeliveries,
      lateDeliveriesRatioPercent:
        completedOrders.length > 0
          ? Number(((lateDeliveries / completedOrders.length) * 100).toFixed(1))
          : 0,
      returnRatePercent,
      costPerformanceScore,
      performanceScore: Number(
        (
          supplier.rating * 10 + // max 50 points
          (100 - returnRatePercent) * 0.3 + // max 30 points
          (completedOrders.length > 0
            ? (1 - lateDeliveries / completedOrders.length) * 20
            : 20)
        ) // max 20 points
          .toFixed(1),
      ),
    };
  }
}
