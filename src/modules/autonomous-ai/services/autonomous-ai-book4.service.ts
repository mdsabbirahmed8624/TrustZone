import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ScheduleMaintenanceDto {
  assetId: string;
  branchId: string;
  predictedFailureRiskScore: number;
  recommendedAction: string;
  scheduledMaintenanceDate: Date;
}

@Injectable()
export class AutonomousAIBook4Service {
  constructor(private readonly prisma: PrismaService) {}

  async schedulePredictiveMaintenance(dto: ScheduleMaintenanceDto) {
    return this.prisma.predictiveMaintenanceSchedule.create({
      data: {
        assetId: dto.assetId,
        branchId: dto.branchId,
        predictedFailureRiskScore: dto.predictedFailureRiskScore,
        recommendedAction: dto.recommendedAction,
        scheduledMaintenanceDate: dto.scheduledMaintenanceDate,
        status: 'SCHEDULED',
      },
    });
  }

  async getMaintenanceSchedules(branchId?: string) {
    return this.prisma.predictiveMaintenanceSchedule.findMany({
      where: branchId ? { branchId } : undefined,
      orderBy: { scheduledMaintenanceDate: 'asc' },
    });
  }

  async completeMaintenance(id: string) {
    const schedule = await this.prisma.predictiveMaintenanceSchedule.findUnique(
      { where: { id } },
    );
    if (!schedule) {
      throw new NotFoundException(
        `Predictive maintenance schedule '${id}' not found.`,
      );
    }

    return this.prisma.predictiveMaintenanceSchedule.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}
