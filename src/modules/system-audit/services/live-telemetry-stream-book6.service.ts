import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordStreamAuditDto {
  streamId: string;
  sourceService: string;
  eventTopic: string;
  throughputPerSec?: number;
  telemetryHealth?: string;
}

@Injectable()
export class LiveTelemetryStreamBook6Service {
  constructor(private readonly prisma: PrismaService) {}

  async recordStreamAudit(dto: RecordStreamAuditDto) {
    return this.prisma.liveTelemetryStreamAuditBook6.upsert({
      where: { streamId: dto.streamId },
      update: {
        sourceService: dto.sourceService,
        eventTopic: dto.eventTopic,
        throughputPerSec: dto.throughputPerSec ?? 14500,
        telemetryHealth: dto.telemetryHealth ?? 'HEALTHY',
        recordedAt: new Date(),
      },
      create: {
        streamId: dto.streamId,
        sourceService: dto.sourceService,
        eventTopic: dto.eventTopic,
        throughputPerSec: dto.throughputPerSec ?? 14500,
        telemetryHealth: dto.telemetryHealth ?? 'HEALTHY',
        recordedAt: new Date(),
      },
    });
  }

  async getStreamAudits() {
    return this.prisma.liveTelemetryStreamAuditBook6.findMany({
      orderBy: { recordedAt: 'desc' },
    });
  }
}
