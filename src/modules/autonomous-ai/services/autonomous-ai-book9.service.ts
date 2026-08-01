import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordDriftDto {
  modelId: string;
  modelName: string;
  conceptDriftScore: number;
  featureAttribution: Record<string, number>;
}

@Injectable()
export class AutonomousAIBook9Service {
  constructor(private readonly prisma: PrismaService) {}

  async recordModelDrift(dto: RecordDriftDto) {
    const retrainingStatus =
      dto.conceptDriftScore > 0.35
        ? 'RETRAINING_SCHEDULED'
        : dto.conceptDriftScore > 0.2
          ? 'RETRAINING_RECOMMENDED'
          : 'STABLE';

    return this.prisma.aIModelDriftMonitoring.create({
      data: {
        modelId: dto.modelId,
        modelName: dto.modelName,
        conceptDriftScore: dto.conceptDriftScore,
        featureAttributionJson: JSON.stringify(dto.featureAttribution || {}),
        retrainingStatus,
      },
    });
  }

  async getModelDrifts(modelId?: string) {
    return this.prisma.aIModelDriftMonitoring.findMany({
      where: modelId ? { modelId } : undefined,
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
