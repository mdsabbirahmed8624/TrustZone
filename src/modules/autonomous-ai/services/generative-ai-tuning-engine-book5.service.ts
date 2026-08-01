import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExecuteGenAiTuningJobDto {
  tuningJobCode: string;
  targetModelArchitecture?: string;
  executionCloudTarget?: string;
  hyperparameterScore?: number;
  jobExecutionStatus?: string;
}

@Injectable()
export class GenerativeAiTuningEngineBook5Service {
  constructor(private readonly prisma: PrismaService) {}

  async executeTuningJob(dto: ExecuteGenAiTuningJobDto) {
    return this.prisma.generativeAiTuningEngineBook5.upsert({
      where: { tuningJobCode: dto.tuningJobCode },
      update: {
        targetModelArchitecture:
          dto.targetModelArchitecture ?? 'TRUSTZONE_LLM_70B_QUANTIZED',
        executionCloudTarget:
          dto.executionCloudTarget ?? 'HYBRID_GCP_AWS_QUANTUM',
        hyperparameterScore: dto.hyperparameterScore ?? 0.989,
        jobExecutionStatus: dto.jobExecutionStatus ?? 'TRAINING_CONVERGED',
        completedAt: new Date(),
      },
      create: {
        tuningJobCode: dto.tuningJobCode,
        targetModelArchitecture:
          dto.targetModelArchitecture ?? 'TRUSTZONE_LLM_70B_QUANTIZED',
        executionCloudTarget:
          dto.executionCloudTarget ?? 'HYBRID_GCP_AWS_QUANTUM',
        hyperparameterScore: dto.hyperparameterScore ?? 0.989,
        jobExecutionStatus: dto.jobExecutionStatus ?? 'TRAINING_CONVERGED',
        completedAt: new Date(),
      },
    });
  }

  async getTuningJobs() {
    return this.prisma.generativeAiTuningEngineBook5.findMany({
      orderBy: { completedAt: 'desc' },
    });
  }
}
