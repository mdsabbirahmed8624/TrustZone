import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepreciationService {
  private readonly logger = new Logger(DepreciationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates & records monthly depreciation schedule (Straight-Line)
   */
  async calculateDepreciation(assetId: string, period = '2026-07') {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset '${assetId}' not found.`);
    }

    const cost = Number(asset.purchaseCost);
    const salvage = Number(asset.salvageValue);
    const lifeMonths = asset.usefulLifeMonths || 60;

    const monthlyDepr = (cost - salvage) / lifeMonths;
    const currentAccumulated = Number(asset.accumulatedDepr);

    const startingValue = cost - currentAccumulated;
    const endingValue = Math.max(salvage, startingValue - monthlyDepr);
    const actualDepr = startingValue - endingValue;

    const record = await this.prisma.assetDepreciation.create({
      data: {
        assetId,
        period,
        startingValue,
        deprAmount: actualDepr,
        endingValue,
      },
    });

    const newAccumulated = currentAccumulated + actualDepr;
    await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        accumulatedDepr: newAccumulated,
        netBookValue: endingValue,
      },
    });

    this.logger.log(
      `Calculated Depreciation for Asset '${asset.assetTag}' [Period: ${period}] - Net Book Value: $${endingValue.toFixed(2)}`,
    );
    return record;
  }
}
