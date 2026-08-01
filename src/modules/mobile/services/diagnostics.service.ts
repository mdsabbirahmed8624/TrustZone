import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateDiagnosticDto {
  ticketId: string;
  batteryHealth: number;
  storageRemainingGb: number;
  screenStatus: string;
  cameraStatus: string;
  sensorStatus: string;
  bandwidthDownMbps: number;
  diagnosticNotes?: string;
}

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createDiagnostic(technicianId: string, dto: CreateDiagnosticDto) {
    this.logger.log(
      `Recording device diagnostics for ticket ${dto.ticketId} by tech ${technicianId}`,
    );

    // Automated recommendation analysis
    const recommendations: string[] = [];
    if (dto.batteryHealth < 80) {
      recommendations.push('Recommend battery replacement (Health < 80%)');
    }
    if (dto.screenStatus.toUpperCase() !== 'OK') {
      recommendations.push(
        `Recommend screen module service (Screen status: ${dto.screenStatus})`,
      );
    }
    if (
      dto.cameraStatus.toUpperCase() !== 'OK' ||
      dto.sensorStatus.toUpperCase() !== 'OK'
    ) {
      recommendations.push('Recommend hardware component inspection');
    }

    const noteAddition =
      recommendations.length > 0
        ? `\nAuto Recommendations:\n- ${recommendations.join('\n- ')}`
        : '\nAuto Recommendations: Hardware components are performing optimally.';

    const diagnostic = await this.prisma.deviceDiagnostic.create({
      data: {
        ticket: { connect: { id: dto.ticketId } },
        technician: { connect: { id: technicianId } },
        batteryHealth: dto.batteryHealth,
        storageRemainingGb: dto.storageRemainingGb,
        screenStatus: dto.screenStatus,
        cameraStatus: dto.cameraStatus,
        sensorStatus: dto.sensorStatus,
        bandwidthDownMbps: dto.bandwidthDownMbps,
        diagnosticNotes: (dto.diagnosticNotes || '') + noteAddition,
      },
    });

    return {
      diagnostic,
      recommendations,
    };
  }

  async getDiagnosticsByTicket(ticketId: string) {
    return this.prisma.deviceDiagnostic.findMany({
      where: { ticketId },
      include: {
        pdfReports: true,
      },
    });
  }
}
