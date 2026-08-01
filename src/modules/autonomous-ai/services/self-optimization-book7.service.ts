import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordOptimizationAnalyticsDto {
  optimizationCode: string;
  targetModel: string;
  hyperParameterConfigJson?: string;
  efficiencyGainPercent?: number;
  evaluationStatus?: string;
}

@Injectable()
export class SelfOptimizationBook7Service {
  constructor(private readonly prisma: PrismaService) {}

  async recordOptimizationAnalytics(dto: RecordOptimizationAnalyticsDto) {
    return this.prisma.autonomousSelfOptimizationAnalyticsBook7.upsert({
      where: { optimizationCode: dto.optimizationCode },
      update: {
        targetModel: dto.targetModel,
        hyperParameterConfigJson:
          dto.hyperParameterConfigJson ??
          '{"learningRate": 0.001, "batchSize": 64}',
        efficiencyGainPercent: dto.efficiencyGainPercent ?? 21.4,
        evaluationStatus: dto.evaluationStatus ?? 'PASSED',
        evaluatedAt: new Date(),
      },
      create: {
        optimizationCode: dto.optimizationCode,
        targetModel: dto.targetModel,
        hyperParameterConfigJson:
          dto.hyperParameterConfigJson ??
          '{"learningRate": 0.001, "batchSize": 64}',
        efficiencyGainPercent: dto.efficiencyGainPercent ?? 21.4,
        evaluationStatus: dto.evaluationStatus ?? 'PASSED',
        evaluatedAt: new Date(),
      },
    });
  }

  async getOptimizationAnalytics() {
    return this.prisma.autonomousSelfOptimizationAnalyticsBook7.findMany({
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
