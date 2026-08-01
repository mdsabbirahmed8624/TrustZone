import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateRoboticsDispatchDto {
  dispatchId: string;
  roboticsUnitCode: string;
  destinationWarehouseId: string;
  partsPayload: Record<string, any>;
}

@Injectable()
export class RoboticsDispatchBook1Service {
  constructor(private readonly prisma: PrismaService) {}

  async createRoboticsDispatch(dto: CreateRoboticsDispatchDto) {
    return this.prisma.autonomousRoboticsDispatch.upsert({
      where: { dispatchId: dto.dispatchId },
      update: {
        roboticsUnitCode: dto.roboticsUnitCode,
        destinationWarehouseId: dto.destinationWarehouseId,
        partsPayloadJson: JSON.stringify(dto.partsPayload || {}),
        dispatchStatus: 'IN_TRANSIT',
        dispatchedAt: new Date(),
      },
      create: {
        dispatchId: dto.dispatchId,
        roboticsUnitCode: dto.roboticsUnitCode,
        destinationWarehouseId: dto.destinationWarehouseId,
        partsPayloadJson: JSON.stringify(dto.partsPayload || {}),
        dispatchStatus: 'IN_TRANSIT',
        dispatchedAt: new Date(),
      },
    });
  }

  async getRoboticsDispatches() {
    return this.prisma.autonomousRoboticsDispatch.findMany({
      orderBy: { dispatchedAt: 'desc' },
    });
  }
}
