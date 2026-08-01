import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TuneModelDto {
  modelName: string;
  hyperparameters: Record<string, any>;
  accuracyScore: number;
  latencyMs: number;
}

@Injectable()
export class AutonomousAIBook5Service {
  constructor(private readonly prisma: PrismaService) {}

  async tuneAiModel(dto: TuneModelDto) {
    return this.prisma.aIOptimizationTuning.upsert({
      where: { modelName: dto.modelName },
      update: {
        hyperparametersJson: JSON.stringify(dto.hyperparameters || {}),
        accuracyScore: dto.accuracyScore,
        latencyMs: dto.latencyMs,
        lastTunedAt: new Date(),
      },
      create: {
        modelName: dto.modelName,
        hyperparametersJson: JSON.stringify(dto.hyperparameters || {}),
        accuracyScore: dto.accuracyScore,
        latencyMs: dto.latencyMs,
        status: 'ACTIVE',
        lastTunedAt: new Date(),
      },
    });
  }

  async getTuningList() {
    return this.prisma.aIOptimizationTuning.findMany({
      orderBy: { lastTunedAt: 'desc' },
    });
  }
}
