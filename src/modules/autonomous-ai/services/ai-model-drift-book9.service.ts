import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordDriftAuditDto {
  monitoringCode: string;
  targetModel: string;
  driftScore?: number;
  anomalyStatus?: string;
}

@Injectable()
export class AiModelDriftBook9Service {
  private readonly logger = new Logger(AiModelDriftBook9Service.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordDriftAudit(dto: RecordDriftAuditDto) {
    this.logger.log(`Recording AI model drift audit: ${dto.monitoringCode}`);

    return this.prisma.aiModelDriftMonitoringBook9.upsert({
      where: { monitoringCode: dto.monitoringCode },
      update: {
        targetModel: dto.targetModel,
        driftScore: dto.driftScore ?? 0.012,
        anomalyStatus: dto.anomalyStatus ?? 'STABLE_NO_DRIFT',
        monitoredAt: new Date(),
      },
      create: {
        monitoringCode: dto.monitoringCode,
        targetModel: dto.targetModel,
        driftScore: dto.driftScore ?? 0.012,
        anomalyStatus: dto.anomalyStatus ?? 'STABLE_NO_DRIFT',
        monitoredAt: new Date(),
      },
    });
  }

  async getDriftAudits() {
    return this.prisma.aiModelDriftMonitoringBook9.findMany({
      orderBy: { monitoredAt: 'desc' },
    });
  }
}
