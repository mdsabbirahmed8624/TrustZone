import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterSwarmGridDto {
  swarmGridCode: string;
  activeRoboticUnits?: number;
  swarmDiagnosticPrecisionPercent?: number;
  autonomousFleetCollisionRate?: number;
  gridStatus?: string;
}

@Injectable()
export class AutonomousSwarmRoboticsGridBook6Service {
  private readonly logger = new Logger(
    AutonomousSwarmRoboticsGridBook6Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or optimize autonomous swarm robotics diagnostics grid node.
   */
  async registerSwarmGrid(dto: RegisterSwarmGridDto) {
    this.logger.log(
      `Registering autonomous swarm robotics diagnostics grid: ${dto.swarmGridCode}`,
    );

    return this.prisma.autonomousSwarmRoboticsGridBook6.upsert({
      where: { swarmGridCode: dto.swarmGridCode },
      update: {
        activeRoboticUnits: dto.activeRoboticUnits ?? 128,
        swarmDiagnosticPrecisionPercent:
          dto.swarmDiagnosticPrecisionPercent ?? 99.99,
        autonomousFleetCollisionRate: dto.autonomousFleetCollisionRate ?? 0.0,
        gridStatus: dto.gridStatus ?? 'SWARM_ACTIVE_OPTIMAL',
        lastSwarmSyncAt: new Date(),
      },
      create: {
        swarmGridCode: dto.swarmGridCode,
        activeRoboticUnits: dto.activeRoboticUnits ?? 128,
        swarmDiagnosticPrecisionPercent:
          dto.swarmDiagnosticPrecisionPercent ?? 99.99,
        autonomousFleetCollisionRate: dto.autonomousFleetCollisionRate ?? 0.0,
        gridStatus: dto.gridStatus ?? 'SWARM_ACTIVE_OPTIMAL',
        lastSwarmSyncAt: new Date(),
      },
    });
  }

  /**
   * List all autonomous swarm robotics diagnostics grids.
   */
  async getSwarmGrids() {
    return this.prisma.autonomousSwarmRoboticsGridBook6.findMany({
      orderBy: { lastSwarmSyncAt: 'desc' },
    });
  }
}
