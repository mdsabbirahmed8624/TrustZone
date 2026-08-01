import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExecuteTuningJobDto {
  jobCode: string;
  evaluatedComponent: string;
  targetCluster?: string;
  optimizationGainPercent?: number;
}

@Injectable()
export class GaPerformanceTuningBook5Service {
  constructor(private readonly prisma: PrismaService) {}

  async executeTuningJob(dto: ExecuteTuningJobDto) {
    return this.prisma.autonomousGaPerformanceTuningJob.upsert({
      where: { jobCode: dto.jobCode },
      update: {
        evaluatedComponent: dto.evaluatedComponent,
        targetCluster: dto.targetCluster ?? 'GLOBAL_PROD_CLUSTER',
        optimizationGainPercent: dto.optimizationGainPercent ?? 18.5,
        status: 'OPTIMIZED',
        executedAt: new Date(),
      },
      create: {
        jobCode: dto.jobCode,
        evaluatedComponent: dto.evaluatedComponent,
        targetCluster: dto.targetCluster ?? 'GLOBAL_PROD_CLUSTER',
        optimizationGainPercent: dto.optimizationGainPercent ?? 18.5,
        status: 'OPTIMIZED',
        executedAt: new Date(),
      },
    });
  }

  async getTuningJobs() {
    return this.prisma.autonomousGaPerformanceTuningJob.findMany({
      orderBy: { executedAt: 'desc' },
    });
  }
}
