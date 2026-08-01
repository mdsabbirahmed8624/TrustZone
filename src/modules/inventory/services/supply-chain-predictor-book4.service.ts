import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateSupplyChainPredictionDto {
  predictionId: string;
  partCategory: string;
  warehouseId: string;
  predictedDepletionDays?: number;
  suggestedReorderQty?: number;
}

@Injectable()
export class SupplyChainPredictorBook4Service {
  constructor(private readonly prisma: PrismaService) {}

  async createSupplyChainPrediction(dto: CreateSupplyChainPredictionDto) {
    return this.prisma.autonomousSupplyChainPredictor.upsert({
      where: { predictionId: dto.predictionId },
      update: {
        partCategory: dto.partCategory,
        warehouseId: dto.warehouseId,
        predictedDepletionDays: dto.predictedDepletionDays ?? 5,
        suggestedReorderQty: dto.suggestedReorderQty ?? 250,
        automationStatus: 'REORDER_REQUISITIONED',
        predictedAt: new Date(),
      },
      create: {
        predictionId: dto.predictionId,
        partCategory: dto.partCategory,
        warehouseId: dto.warehouseId,
        predictedDepletionDays: dto.predictedDepletionDays ?? 5,
        suggestedReorderQty: dto.suggestedReorderQty ?? 250,
        automationStatus: 'REORDER_REQUISITIONED',
        predictedAt: new Date(),
      },
    });
  }

  async getSupplyChainPredictions() {
    return this.prisma.autonomousSupplyChainPredictor.findMany({
      orderBy: { predictedAt: 'desc' },
    });
  }
}
