import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordMetricDto {
  engineComponent: string;
  efficiencyGainPercent: number;
  automatedDecisionsCount?: number;
}

@Injectable()
export class AutonomousAIBook7Service {
  constructor(private readonly prisma: PrismaService) {}

  async recordOptimizationMetric(dto: RecordMetricDto) {
    const status =
      dto.efficiencyGainPercent >= 15.0
        ? 'OPTIMAL'
        : dto.efficiencyGainPercent >= 5.0
          ? 'TUNING_REQUIRED'
          : 'DEGRADED';

    return this.prisma.aISelfOptimizationMetric.create({
      data: {
        engineComponent: dto.engineComponent,
        efficiencyGainPercent: dto.efficiencyGainPercent,
        automatedDecisionsCount: dto.automatedDecisionsCount ?? 0,
        status,
      },
    });
  }

  async getOptimizationMetrics() {
    return this.prisma.aISelfOptimizationMetric.findMany({
      orderBy: { evaluationDate: 'desc' },
    });
  }
}
