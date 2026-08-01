import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterSupplyChainMeshDto {
  supplyChainCode: string;
  predictiveReorderAccuracyPercent?: number;
  supplierFulfillmentLatencyHours?: number;
  activeGlobalWarehouses?: number;
  meshStatus?: string;
}

@Injectable()
export class PredictiveAutonomousSupplyChainMeshBook4Service {
  private readonly logger = new Logger(
    PredictiveAutonomousSupplyChainMeshBook4Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or optimize a predictive autonomous supply chain mesh configuration.
   */
  async registerSupplyChain(dto: RegisterSupplyChainMeshDto) {
    this.logger.log(
      `Registering predictive autonomous supply chain mesh: ${dto.supplyChainCode}`,
    );

    return this.prisma.predictiveAutonomousSupplyChainMeshBook4.upsert({
      where: { supplyChainCode: dto.supplyChainCode },
      update: {
        predictiveReorderAccuracyPercent:
          dto.predictiveReorderAccuracyPercent ?? 99.95,
        supplierFulfillmentLatencyHours:
          dto.supplierFulfillmentLatencyHours ?? 1.2,
        activeGlobalWarehouses: dto.activeGlobalWarehouses ?? 48,
        meshStatus: dto.meshStatus ?? 'OPTIMAL_HEALTHY',
        lastPredictedAt: new Date(),
      },
      create: {
        supplyChainCode: dto.supplyChainCode,
        predictiveReorderAccuracyPercent:
          dto.predictiveReorderAccuracyPercent ?? 99.95,
        supplierFulfillmentLatencyHours:
          dto.supplierFulfillmentLatencyHours ?? 1.2,
        activeGlobalWarehouses: dto.activeGlobalWarehouses ?? 48,
        meshStatus: dto.meshStatus ?? 'OPTIMAL_HEALTHY',
        lastPredictedAt: new Date(),
      },
    });
  }

  /**
   * List all predictive autonomous supply chain meshes.
   */
  async getSupplyChains() {
    return this.prisma.predictiveAutonomousSupplyChainMeshBook4.findMany({
      orderBy: { lastPredictedAt: 'desc' },
    });
  }
}
