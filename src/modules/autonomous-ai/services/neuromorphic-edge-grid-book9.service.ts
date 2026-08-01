import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterNeuromorphicGridDto {
  neuromorphicGridCode: string;
  spikeNeuralNetworkSpikeRateHz?: number;
  energyEfficiencyTeraOpsPerWatt?: number;
  activeSpikeCoreCount?: number;
  gridStatus?: string;
}

@Injectable()
export class NeuromorphicAIEdgeGridBook9Service {
  private readonly logger = new Logger(NeuromorphicAIEdgeGridBook9Service.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or optimize neuromorphic AI edge grid node.
   */
  async registerNeuromorphicGrid(dto: RegisterNeuromorphicGridDto) {
    this.logger.log(
      `Registering neuromorphic AI edge grid: ${dto.neuromorphicGridCode}`,
    );

    return this.prisma.neuromorphicAIEdgeGridBook9.upsert({
      where: { neuromorphicGridCode: dto.neuromorphicGridCode },
      update: {
        spikeNeuralNetworkSpikeRateHz:
          dto.spikeNeuralNetworkSpikeRateHz ?? 10000.0,
        energyEfficiencyTeraOpsPerWatt:
          dto.energyEfficiencyTeraOpsPerWatt ?? 120.5,
        activeSpikeCoreCount: dto.activeSpikeCoreCount ?? 4096,
        gridStatus: dto.gridStatus ?? 'NEUROMORPHIC_SPIKING_ACTIVE',
        lastSpikeOptimizationAt: new Date(),
      },
      create: {
        neuromorphicGridCode: dto.neuromorphicGridCode,
        spikeNeuralNetworkSpikeRateHz:
          dto.spikeNeuralNetworkSpikeRateHz ?? 10000.0,
        energyEfficiencyTeraOpsPerWatt:
          dto.energyEfficiencyTeraOpsPerWatt ?? 120.5,
        activeSpikeCoreCount: dto.activeSpikeCoreCount ?? 4096,
        gridStatus: dto.gridStatus ?? 'NEUROMORPHIC_SPIKING_ACTIVE',
        lastSpikeOptimizationAt: new Date(),
      },
    });
  }

  /**
   * List all neuromorphic AI edge grids.
   */
  async getNeuromorphicGrids() {
    return this.prisma.neuromorphicAIEdgeGridBook9.findMany({
      orderBy: { lastSpikeOptimizationAt: 'desc' },
    });
  }
}
