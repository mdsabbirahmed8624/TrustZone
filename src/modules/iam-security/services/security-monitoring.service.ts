import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private readonly maxFailedAttempts = 5;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a Login Audit record and evaluates brute force lockout threshold
   */
  async logLoginAttempt(
    emailAttempted: string,
    authMethod: string,
    status: 'SUCCESS' | 'FAILED' | 'LOCKED_OUT' | 'MFA_REQUIRED',
    userId?: string,
    failureReason?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const audit = await this.prisma.loginAudit.create({
      data: {
        userId: userId || null,
        emailAttempted,
        authMethod,
        status,
        failureReason: failureReason || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    // Check brute force threshold if failed
    if (status === 'FAILED' && userId) {
      const recentFailures = await this.prisma.loginAudit.count({
        where: {
          userId,
          status: 'FAILED',
          createdAt: { gte: new Date(Date.now() - 15 * 60000) },
        },
      });

      if (recentFailures >= this.maxFailedAttempts) {
        await this.prisma.securityEvent.create({
          data: {
            userId,
            eventType: 'BRUTE_FORCE_DETECTED',
            severity: 'HIGH',
            ipAddress: ipAddress || null,
            details: { failedAttempts: recentFailures, emailAttempted },
          },
        });

        this.logger.warn(
          `Brute force lockout triggered for User '${userId}' after ${recentFailures} failed attempts`,
        );
      }
    }

    return audit;
  }

  /**
   * Security Threat & Monitoring Dashboard Metrics
   */
  async getSecurityDashboardMetrics() {
    const totalLoginAttempts = await this.prisma.loginAudit.count();
    const failedLogins = await this.prisma.loginAudit.count({
      where: { status: 'FAILED' },
    });
    const activeThreatEvents = await this.prisma.securityEvent.count({
      where: { resolved: false },
    });
    const totalTrustedDevices = await this.prisma.trustedDevice.count({
      where: { isTrusted: true },
    });
    const activeSessions = await this.prisma.authSession.count({
      where: { isRevoked: false, expiresAt: { gt: new Date() } },
    });

    return {
      systemStatus: 'PROTECTED',
      totalLoginAttempts,
      failedLogins,
      activeThreatEvents,
      totalTrustedDevices,
      activeSessions,
      lastThreatCheckAt: new Date().toISOString(),
    };
  }
}
