import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeviceTrustService } from './device-trust.service';

@Injectable()
export class RiskEngineService {
  private readonly logger = new Logger(RiskEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceTrustService: DeviceTrustService,
  ) {}

  /**
   * Calculates Zero-Trust risk assessment for a authentication request
   */
  async evaluateLoginRisk(
    userId: string,
    ipAddress: string,
    deviceFingerprint: string,
  ) {
    let riskScore = 10; // Base score
    const triggers: string[] = [];

    // Check device trust
    const deviceCheck = await this.deviceTrustService.isDeviceTrusted(
      userId,
      deviceFingerprint,
    );
    if (!deviceCheck.isKnownDevice) {
      riskScore += 30;
      triggers.push('UNKNOWN_DEVICE');
    } else if (!deviceCheck.isTrusted) {
      riskScore += 40;
      triggers.push('UNTRUSTED_DEVICE');
    }

    // Check failed login history
    const recentFailures = await this.prisma.loginAudit.count({
      where: {
        userId,
        status: 'FAILED',
        createdAt: { gte: new Date(Date.now() - 15 * 60000) }, // Last 15m
      },
    });

    if (recentFailures > 0) {
      riskScore += recentFailures * 15;
      triggers.push(`RECENT_FAILED_LOGINS_${recentFailures}`);
    }

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    const assessment = await this.prisma.riskAssessment.create({
      data: {
        userId,
        ipAddress,
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        flaggedTriggers: triggers,
      },
    });

    this.logger.log(
      `Evaluated Risk Assessment for User '${userId}': Score ${assessment.riskScore} [Level: ${riskLevel}]`,
    );

    return assessment;
  }
}
