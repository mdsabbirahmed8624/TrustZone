import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterDigitalTwinDto {
  digitalTwinCode: string;
  realTimeSimulationFidelityPercent?: number;
  isoStandardComplianceScore?: number;
  activeTwinNodes?: number;
  matrixStatus?: string;
}

@Injectable()
export class DigitalTwinComplianceMatrixBook8Service {
  private readonly logger = new Logger(
    DigitalTwinComplianceMatrixBook8Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or simulate digital twin compliance matrix.
   */
  async registerDigitalTwin(dto: RegisterDigitalTwinDto) {
    this.logger.log(
      `Registering digital twin compliance matrix: ${dto.digitalTwinCode}`,
    );

    return this.prisma.digitalTwinComplianceMatrixBook8.upsert({
      where: { digitalTwinCode: dto.digitalTwinCode },
      update: {
        realTimeSimulationFidelityPercent:
          dto.realTimeSimulationFidelityPercent ?? 99.98,
        isoStandardComplianceScore: dto.isoStandardComplianceScore ?? 100.0,
        activeTwinNodes: dto.activeTwinNodes ?? 512,
        matrixStatus: dto.matrixStatus ?? 'SIMULATION_ACTIVE_SYNCHRONIZED',
        lastSimulatedAt: new Date(),
      },
      create: {
        digitalTwinCode: dto.digitalTwinCode,
        realTimeSimulationFidelityPercent:
          dto.realTimeSimulationFidelityPercent ?? 99.98,
        isoStandardComplianceScore: dto.isoStandardComplianceScore ?? 100.0,
        activeTwinNodes: dto.activeTwinNodes ?? 512,
        matrixStatus: dto.matrixStatus ?? 'SIMULATION_ACTIVE_SYNCHRONIZED',
        lastSimulatedAt: new Date(),
      },
    });
  }

  /**
   * List all digital twin compliance matrices.
   */
  async getDigitalTwins() {
    return this.prisma.digitalTwinComplianceMatrixBook8.findMany({
      orderBy: { lastSimulatedAt: 'desc' },
    });
  }
}
