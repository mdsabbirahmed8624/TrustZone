import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterCrossCloudGATuningDto {
  crossCloudTuningCode: string;
  crossCloudSyncLatencyMs?: number;
  geneticAlgorithmFitnessScore?: number;
  supportedCloudProviders?: number;
  gridStatus?: string;
}

@Injectable()
export class GlobalCrossCloudGATuningGridBook7Service {
  private readonly logger = new Logger(
    GlobalCrossCloudGATuningGridBook7Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or optimize global cross-cloud GA tuning grid node.
   */
  async registerGATuningGrid(dto: RegisterCrossCloudGATuningDto) {
    this.logger.log(
      `Registering global cross-cloud GA tuning grid: ${dto.crossCloudTuningCode}`,
    );

    return this.prisma.globalCrossCloudGATuningGridBook7.upsert({
      where: { crossCloudTuningCode: dto.crossCloudTuningCode },
      update: {
        crossCloudSyncLatencyMs: dto.crossCloudSyncLatencyMs ?? 0.95,
        geneticAlgorithmFitnessScore: dto.geneticAlgorithmFitnessScore ?? 99.97,
        supportedCloudProviders: dto.supportedCloudProviders ?? 5,
        gridStatus: dto.gridStatus ?? 'CROSSCLOUD_OPTIMAL_ACTIVE',
        lastGAOptimizationAt: new Date(),
      },
      create: {
        crossCloudTuningCode: dto.crossCloudTuningCode,
        crossCloudSyncLatencyMs: dto.crossCloudSyncLatencyMs ?? 0.95,
        geneticAlgorithmFitnessScore: dto.geneticAlgorithmFitnessScore ?? 99.97,
        supportedCloudProviders: dto.supportedCloudProviders ?? 5,
        gridStatus: dto.gridStatus ?? 'CROSSCLOUD_OPTIMAL_ACTIVE',
        lastGAOptimizationAt: new Date(),
      },
    });
  }

  /**
   * List all global cross-cloud GA tuning grids.
   */
  async getGATuningGrids() {
    return this.prisma.globalCrossCloudGATuningGridBook7.findMany({
      orderBy: { lastGAOptimizationAt: 'desc' },
    });
  }
}
