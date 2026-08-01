import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertAnalyticsService {
  private readonly logger = new Logger(AlertAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runAnomaliesSweep(branchId?: string) {
    this.logger.log(
      'Executing anomaly sweeps for Revenue, Backlog, and productivity thresholds',
    );

    const filter: any = {};
    if (branchId) {
      filter.branchId = branchId;
    }

    const alerts: any[] = [];

    // 1. Backlog check
    const pendingCount = await this.prisma.ticket.count({
      where: {
        ...filter,
        status: { in: ['booked', 'diagnosing'] },
      },
    });

    const BACKLOG_THRESHOLD = 50;
    if (pendingCount > BACKLOG_THRESHOLD) {
      const alert = await this.prisma.alertAnalytics.create({
        data: {
          alertType: 'BACKLOG_WARNING',
          severity: 'HIGH',
          message: `Ticket backlog has exceeded safe limits. Count: ${pendingCount} (threshold: ${BACKLOG_THRESHOLD})`,
        },
      });
      alerts.push(alert);
    }

    // 2. SLA compliance sweep (resolutions taking > 72 hours)
    const SLA_LIMIT_MS = 72 * 60 * 60 * 1000;
    const now = Date.now();
    const openTickets = await this.prisma.ticket.findMany({
      where: {
        ...filter,
        status: { in: ['booked', 'diagnosing'] },
      },
    });

    const violatedCount = openTickets.filter(
      (t) => now - t.createdAt.getTime() > SLA_LIMIT_MS,
    ).length;

    if (violatedCount > 0) {
      const alert = await this.prisma.alertAnalytics.create({
        data: {
          alertType: 'SLA_VIOLATION',
          severity: 'CRITICAL',
          message: `Found ${violatedCount} tickets violating resolution SLAs of 72 hours.`,
        },
      });
      alerts.push(alert);
    }

    return {
      ranSweepAt: new Date(),
      triggeredAlertsCount: alerts.length,
      alerts,
    };
  }

  async getAlerts() {
    return this.prisma.alertAnalytics.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}
