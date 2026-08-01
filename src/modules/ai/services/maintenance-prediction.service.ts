import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MaintenancePredictionService {
  private readonly logger = new Logger(MaintenancePredictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predictDeviceFailures(deviceId: string) {
    this.logger.log(
      `Evaluating predictive maintenance lifespans for device ${deviceId}`,
    );

    // Query historical diagnostics
    const diagnostics = await this.prisma.deviceDiagnostic.findMany({
      where: { ticket: { deviceId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    let batteryDegradationPercent = 0.0;
    let chargingICFailureRisk = 15.0;
    let displayFailureRisk = 10.0;

    if (diagnostics.length > 0) {
      const latest = diagnostics[0];
      batteryDegradationPercent = Math.max(0, 100 - latest.batteryHealth);
      if (latest.screenStatus === 'CRACKED') {
        displayFailureRisk = 92.5;
      }
      if (latest.batteryHealth < 75) {
        chargingICFailureRisk = 65.0;
      }
    }

    const prediction = await this.prisma.predictionHistory.create({
      data: {
        predictionType: 'BATTERY_DEGRADATION',
        targetId: deviceId,
        predictionData: {
          batteryDegradationPercent,
          chargingICFailureRiskPercent: chargingICFailureRisk,
          displayFailureRiskPercent: displayFailureRisk,
          waterDamageRiskPercent: 5.0,
          estimatedLifespanMonths: batteryDegradationPercent > 20 ? 12 : 24,
        },
        confidenceLevel: 88.4,
      },
    });

    return prediction;
  }
}
