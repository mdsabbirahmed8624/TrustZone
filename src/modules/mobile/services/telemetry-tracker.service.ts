import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordTelemetryDto {
  ticketId: string;
  action: string; // DIAGNOSTIC_START, DIAGNOSTIC_COMPLETE, REPAIR_START, REPAIR_COMPLETE
  durationMin?: number;
}

@Injectable()
export class TelemetryTrackerService {
  private readonly logger = new Logger(TelemetryTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordTelemetry(technicianId: string, dto: RecordTelemetryDto) {
    this.logger.log(
      `Recording technician telemetry: ${dto.action} for ticket ${dto.ticketId}`,
    );

    // If action is complete, check if there was a start log to calculate duration dynamically
    let calculatedDuration = dto.durationMin;
    if (
      !calculatedDuration &&
      (dto.action.endsWith('COMPLETE') || dto.action.endsWith('FINISHED'))
    ) {
      const prefix = dto.action.split('_')[0]; // e.g. DIAGNOSTIC or REPAIR
      const startLog = await this.prisma.technicianTelemetry.findFirst({
        where: {
          ticketId: dto.ticketId,
          technicianId,
          action: `${prefix}_START`,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (startLog) {
        const timeDiffMs = Date.now() - new Date(startLog.createdAt).getTime();
        calculatedDuration = Math.round(timeDiffMs / (1000 * 60));
      }
    }

    return this.prisma.technicianTelemetry.create({
      data: {
        technician: { connect: { id: technicianId } },
        ticket: { connect: { id: dto.ticketId } },
        action: dto.action,
        durationMin: calculatedDuration,
      },
    });
  }

  async getTechnicianPerformanceMetrics(technicianId: string) {
    const logs = await this.prisma.technicianTelemetry.findMany({
      where: { technicianId },
    });

    const completedRepairs = logs.filter((l) => l.action === 'REPAIR_COMPLETE');
    const durations = completedRepairs
      .map((r) => r.durationMin)
      .filter((d): d is number => d !== null && d !== undefined);
    const avgDurationMin =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    const SLA_THRESHOLD_MIN = 60; // 1 hour standard SLA
    const slaViolationsCount = durations.filter(
      (d) => d > SLA_THRESHOLD_MIN,
    ).length;

    return {
      technicianId,
      totalRepairsCompleted: completedRepairs.length,
      averageRepairDurationMinutes: Math.round(avgDurationMin),
      slaViolationsCount,
    };
  }
}
