import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExecuteNeuromorphicAiJobDto {
  jobCode: string;
  snnArchitecture?: string;
  powerConsumptionWatts?: number;
  inferenceLatencyUs?: number;
  processingStatus?: string;
}

@Injectable()
export class NeuromorphicAiBook2Service {
  constructor(private readonly prisma: PrismaService) {}

  async executeNeuromorphicJob(dto: ExecuteNeuromorphicAiJobDto) {
    return this.prisma.neuromorphicAiProcessingBook2.upsert({
      where: { jobCode: dto.jobCode },
      update: {
        snnArchitecture: dto.snnArchitecture ?? 'LOIHI_SPIKING_NEURAL_MESH',
        powerConsumptionWatts: dto.powerConsumptionWatts ?? 0.45,
        inferenceLatencyUs: dto.inferenceLatencyUs ?? 85.0,
        processingStatus: dto.processingStatus ?? 'COMPLETED_OPTIMAL',
        executedAt: new Date(),
      },
      create: {
        jobCode: dto.jobCode,
        snnArchitecture: dto.snnArchitecture ?? 'LOIHI_SPIKING_NEURAL_MESH',
        powerConsumptionWatts: dto.powerConsumptionWatts ?? 0.45,
        inferenceLatencyUs: dto.inferenceLatencyUs ?? 85.0,
        processingStatus: dto.processingStatus ?? 'COMPLETED_OPTIMAL',
        executedAt: new Date(),
      },
    });
  }

  async getNeuromorphicJobs() {
    return this.prisma.neuromorphicAiProcessingBook2.findMany({
      orderBy: { executedAt: 'desc' },
    });
  }
}
