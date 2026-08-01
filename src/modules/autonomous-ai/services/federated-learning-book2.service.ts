import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateFederatedJobDto {
  jobId: string;
  modelName: string;
  participatingNodesCount?: number;
  privacyBudgetEpsilon?: number;
}

@Injectable()
export class FederatedLearningBook2Service {
  constructor(private readonly prisma: PrismaService) {}

  async createFederatedJob(dto: CreateFederatedJobDto) {
    return this.prisma.federatedLearningJob.upsert({
      where: { jobId: dto.jobId },
      update: {
        modelName: dto.modelName,
        participatingNodesCount: dto.participatingNodesCount ?? 12,
        privacyBudgetEpsilon: dto.privacyBudgetEpsilon ?? 0.5,
        status: 'AGGREGATING',
        aggregationRound: 1,
      },
      create: {
        jobId: dto.jobId,
        modelName: dto.modelName,
        participatingNodesCount: dto.participatingNodesCount ?? 12,
        privacyBudgetEpsilon: dto.privacyBudgetEpsilon ?? 0.5,
        status: 'AGGREGATING',
        aggregationRound: 1,
      },
    });
  }

  async getFederatedJobs() {
    return this.prisma.federatedLearningJob.findMany({
      orderBy: { startedAt: 'desc' },
    });
  }
}
