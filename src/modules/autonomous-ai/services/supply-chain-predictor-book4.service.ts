import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PredictSupplyChainDemandDto {
  predictionCode: string;
  partCategory?: string;
  predictedDemandQuantity?: number;
  reorderConfidenceScore?: number;
  replenishmentStatus?: string;
}

@Injectable()
export class SupplyChainPredictorBook4Service {
  constructor(private readonly prisma: PrismaService) {}

  async predictDemand(dto: PredictSupplyChainDemandDto) {
    return this.prisma.supplyChainPredictorBook4.upsert({
      where: { predictionCode: dto.predictionCode },
      update: {
        partCategory: dto.partCategory ?? 'OLED_DISPLAY_ASSEMBLIES',
        predictedDemandQuantity: dto.predictedDemandQuantity ?? 450,
        reorderConfidenceScore: dto.reorderConfidenceScore ?? 0.985,
        replenishmentStatus:
          dto.replenishmentStatus ?? 'AUTO_REORDER_TRIGGERED',
        predictedAt: new Date(),
      },
      create: {
        predictionCode: dto.predictionCode,
        partCategory: dto.partCategory ?? 'OLED_DISPLAY_ASSEMBLIES',
        predictedDemandQuantity: dto.predictedDemandQuantity ?? 450,
        reorderConfidenceScore: dto.reorderConfidenceScore ?? 0.985,
        replenishmentStatus:
          dto.replenishmentStatus ?? 'AUTO_REORDER_TRIGGERED',
        predictedAt: new Date(),
      },
    });
  }

  async getPredictions() {
    return this.prisma.supplyChainPredictorBook4.findMany({
      orderBy: { predictedAt: 'desc' },
    });
  }
}
