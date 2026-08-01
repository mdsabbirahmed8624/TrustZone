import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recommendParts(partId: string, branchId?: string) {
    this.logger.log(`Generating AI recommendations for part ${partId}`);

    const part = await this.prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new Error(`Part ${partId} not found`);
    }

    // Heuristics: Find compatible parts in same category / brand compatibility
    const compatibleAlternatives = await this.prisma.part.findMany({
      where: {
        category: part.category,
        brandCompatibility: part.brandCompatibility,
        id: { not: part.id },
      },
      take: 3,
    });

    // Check stock availability in branch
    let stockLevel = 0;
    if (branchId) {
      const inventory = await this.prisma.inventoryItem.findFirst({
        where: {
          partId,
          warehouse: { branchId },
        },
      });
      stockLevel = inventory ? inventory.quantity : 0;
    }

    // Save history
    const recommendation = await this.prisma.recommendationHistory.create({
      data: {
        recommendationType: 'SPARE_PARTS',
        targetId: partId,
        recommendationData: {
          originalPartName: part.name,
          compatibleAlternatives: compatibleAlternatives.map((p) => p.name),
          frequentlyReplacedCombinations: [
            'Adhesive tape strip',
            'Microfiber cleaning pack',
          ],
          stockLevel,
          procurementSuggested: stockLevel < part.minimumStockBuffer,
        },
        confidenceLevel: 92.5,
      },
    });

    return recommendation;
  }
}
