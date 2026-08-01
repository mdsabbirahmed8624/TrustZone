import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterHyperTuningEngineDto {
  hyperTuningEngineCode: string;
  llmModelParametersBillion?: number;
  tuningInferenceLatencyMs?: number;
  modelAccuracyBenchmark?: number;
  engineStatus?: string;
}

@Injectable()
export class GenerativeAIHyperTuningEngineBook6Service {
  private readonly logger = new Logger(
    GenerativeAIHyperTuningEngineBook6Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or execute hyper-tuning on Generative AI model engine.
   */
  async registerHyperTuningEngine(dto: RegisterHyperTuningEngineDto) {
    this.logger.log(
      `Registering generative AI hyper-tuning engine: ${dto.hyperTuningEngineCode}`,
    );

    return this.prisma.generativeAIHyperTuningEngineBook6.upsert({
      where: { hyperTuningEngineCode: dto.hyperTuningEngineCode },
      update: {
        llmModelParametersBillion: dto.llmModelParametersBillion ?? 175.0,
        tuningInferenceLatencyMs: dto.tuningInferenceLatencyMs ?? 1.15,
        modelAccuracyBenchmark: dto.modelAccuracyBenchmark ?? 99.98,
        engineStatus: dto.engineStatus ?? 'HYPERTUNING_ACTIVE_OPTIMAL',
        lastTunedAt: new Date(),
      },
      create: {
        hyperTuningEngineCode: dto.hyperTuningEngineCode,
        llmModelParametersBillion: dto.llmModelParametersBillion ?? 175.0,
        tuningInferenceLatencyMs: dto.tuningInferenceLatencyMs ?? 1.15,
        modelAccuracyBenchmark: dto.modelAccuracyBenchmark ?? 99.98,
        engineStatus: dto.engineStatus ?? 'HYPERTUNING_ACTIVE_OPTIMAL',
        lastTunedAt: new Date(),
      },
    });
  }

  /**
   * List all generative AI hyper-tuning engines.
   */
  async getHyperTuningEngines() {
    return this.prisma.generativeAIHyperTuningEngineBook6.findMany({
      orderBy: { lastTunedAt: 'desc' },
    });
  }
}
