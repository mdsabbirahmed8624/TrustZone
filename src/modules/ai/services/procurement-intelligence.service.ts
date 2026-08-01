import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProcurementIntelligenceService {
  private readonly logger = new Logger(ProcurementIntelligenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recommendPreferredSupplier(partId: string) {
    this.logger.log(
      `Evaluating preferred supplier recommendations for part ${partId}`,
    );

    // Query historical PO items for this part
    const historyItems = await this.prisma.purchaseOrderItem.findMany({
      where: { partId },
      include: { purchaseOrder: { include: { supplier: true } } },
    });

    const suppliersMap = new Map<
      string,
      { id: string; name: string; count: number; totalCost: number }
    >();

    historyItems.forEach((item) => {
      const supplier = item.purchaseOrder.supplier;
      if (!supplier) return;

      const existing = suppliersMap.get(supplier.id) || {
        id: supplier.id,
        name: supplier.name,
        count: 0,
        totalCost: 0,
      };
      existing.count += 1;
      existing.totalCost += Number(item.unitCost) * item.quantity;
      suppliersMap.set(supplier.id, existing);
    });

    const sortedSuppliers = Array.from(suppliersMap.values()).map((s) => ({
      ...s,
      averageUnitCost: s.count > 0 ? s.totalCost / s.count : 0,
    }));

    sortedSuppliers.sort((a, b) => a.averageUnitCost - b.averageUnitCost);

    const recommendation = await this.prisma.recommendationHistory.create({
      data: {
        recommendationType: 'PROCUREMENT_QUANTITY',
        targetId: partId,
        recommendationData: {
          suppliersRankedByCost: sortedSuppliers,
          preferredSupplier: sortedSuppliers[0] || null,
          recommendedBuyQuantity: 20,
        },
        confidenceLevel: 87.0,
      },
    });

    return recommendation;
  }
}
