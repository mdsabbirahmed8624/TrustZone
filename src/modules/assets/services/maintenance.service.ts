import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs maintenance performed on asset
   */
  async logMaintenance(data: {
    assetId: string;
    description: string;
    maintenanceType?: string;
    cost?: number;
    downtimeHours?: number;
    performedBy: string;
  }) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: data.assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset '${data.assetId}' not found.`);
    }

    const record = await this.prisma.assetMaintenance.create({
      data: {
        assetId: data.assetId,
        description: data.description,
        maintenanceType: data.maintenanceType || 'PREVENTIVE',
        cost: Number(data.cost || 0),
        downtimeHours: Number(data.downtimeHours || 0),
        performedBy: data.performedBy,
        status: 'COMPLETED',
      },
    });

    await this.prisma.maintenanceHistory.create({
      data: {
        assetTag: asset.assetTag,
        action: data.maintenanceType || 'PREVENTIVE',
        details: data.description,
        technician: data.performedBy,
        cost: Number(data.cost || 0),
      },
    });

    this.logger.log(
      `Logged Maintenance for Asset '${asset.assetTag}' [Cost: $${data.cost || 0}]`,
    );
    return record;
  }

  /**
   * Configures recurring maintenance schedule
   */
  async createSchedule(assetId: string, taskName: string, frequencyDays = 30) {
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + frequencyDays);

    const schedule = await this.prisma.maintenanceSchedule.create({
      data: {
        assetId,
        taskName,
        frequencyDays,
        nextDueDate,
        status: 'ACTIVE',
      },
    });

    this.logger.log(
      `Created MaintenanceSchedule '${taskName}' for Asset '${assetId}' (Every ${frequencyDays} days)`,
    );
    return schedule;
  }
}
