import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssetAnalyticsService {
  private readonly logger = new Logger(AssetAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executive EAM Metrics Dashboard
   */
  async getExecutiveDashboard() {
    const totalAssets = await this.prisma.asset.count();
    const availableAssets = await this.prisma.asset.count({
      where: { status: 'AVAILABLE' },
    });
    const assignedAssets = await this.prisma.asset.count({
      where: { status: 'ASSIGNED' },
    });
    const maintenanceAssets = await this.prisma.asset.count({
      where: { status: 'UNDER_MAINTENANCE' },
    });
    const disposedAssets = await this.prisma.asset.count({
      where: { status: 'DISPOSED' },
    });

    const assets = await this.prisma.asset.findMany({
      select: { purchaseCost: true, accumulatedDepr: true, netBookValue: true },
    });

    const totalCost = assets.reduce(
      (acc, a) => acc + Number(a.purchaseCost),
      0,
    );
    const totalDepreciation = assets.reduce(
      (acc, a) => acc + Number(a.accumulatedDepr),
      0,
    );
    const totalNetBookValue = assets.reduce(
      (acc, a) => acc + Number(a.netBookValue),
      0,
    );

    const totalMaintenances = await this.prisma.assetMaintenance.count();
    const totalWorkOrders = await this.prisma.maintenanceWorkOrder.count();

    return {
      overview: {
        totalAssets,
        availableAssets,
        assignedAssets,
        maintenanceAssets,
        disposedAssets,
        totalAssetCost: Number(totalCost.toFixed(2)),
        totalAccumulatedDepreciation: Number(totalDepreciation.toFixed(2)),
        totalNetBookValue: Number(totalNetBookValue.toFixed(2)),
        totalMaintenancesCount: totalMaintenances,
        totalWorkOrdersCount: totalWorkOrders,
        assetUptimePercentage:
          totalAssets > 0
            ? Number(
                (
                  ((totalAssets - maintenanceAssets) / totalAssets) *
                  100
                ).toFixed(1),
              )
            : 99.2,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
