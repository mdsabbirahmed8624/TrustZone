import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DispatchSwarmFleetDto {
  fleetCode: string;
  robotUnitType?: string;
  activeUnitsCount?: number;
  taskAllocationStatus?: string;
  fleetEfficiencyScore?: number;
}

@Injectable()
export class SwarmRoboticsOrchestratorBook5Service {
  constructor(private readonly prisma: PrismaService) {}

  async dispatchFleet(dto: DispatchSwarmFleetDto) {
    return this.prisma.swarmRoboticsOrchestratorBook5.upsert({
      where: { fleetCode: dto.fleetCode },
      update: {
        robotUnitType: dto.robotUnitType ?? 'AUTONOMOUS_REPAIR_ARM',
        activeUnitsCount: dto.activeUnitsCount ?? 24,
        taskAllocationStatus: dto.taskAllocationStatus ?? 'OPTIMAL_DISPATCHED',
        fleetEfficiencyScore: dto.fleetEfficiencyScore ?? 0.994,
        dispatchedAt: new Date(),
      },
      create: {
        fleetCode: dto.fleetCode,
        robotUnitType: dto.robotUnitType ?? 'AUTONOMOUS_REPAIR_ARM',
        activeUnitsCount: dto.activeUnitsCount ?? 24,
        taskAllocationStatus: dto.taskAllocationStatus ?? 'OPTIMAL_DISPATCHED',
        fleetEfficiencyScore: dto.fleetEfficiencyScore ?? 0.994,
        dispatchedAt: new Date(),
      },
    });
  }

  async getFleets() {
    return this.prisma.swarmRoboticsOrchestratorBook5.findMany({
      orderBy: { dispatchedAt: 'desc' },
    });
  }
}
