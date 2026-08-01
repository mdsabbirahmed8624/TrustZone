import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SLAMetrics {
  deliveredCount: number;
  slaMetCount: number;
  slaMetPercentage: number;
  averageLatencyMs: number;
}

@Injectable()
export class MonitoringDashboardService {
  private readonly logger = new Logger(MonitoringDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getLiveDeliveryMetrics() {
    const totalCount = await this.prisma.notification.count();
    const deliveredCount = await this.prisma.notification.count({
      where: { status: 'DELIVERED' },
    });
    const failedCount = await this.prisma.notification.count({
      where: { status: 'FAILED' },
    });
    const readCount = await this.prisma.notification.count({
      where: { status: 'READ' },
    });

    const openRate = totalCount > 0 ? (readCount / totalCount) * 100 : 0;
    const successRate =
      totalCount > 0 ? (deliveredCount / totalCount) * 100 : 100;

    return {
      totalSent: totalCount,
      delivered: deliveredCount,
      failed: failedCount,
      read: readCount,
      openRate: parseFloat(openRate.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(2)),
    };
  }

  async getSLAMetrics(targetLatencyMs = 2000): Promise<SLAMetrics> {
    const analytics = await this.prisma.notificationAnalytics.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' },
    });

    if (analytics.length === 0) {
      return {
        deliveredCount: 0,
        slaMetCount: 0,
        slaMetPercentage: 100,
        averageLatencyMs: 0,
      };
    }

    let totalLatency = 0;
    let slaMet = 0;

    analytics.forEach((record) => {
      totalLatency += record.deliveryLatency;
      if (record.deliveryLatency <= targetLatencyMs) {
        slaMet++;
      }
    });

    const averageLatency = totalLatency / analytics.length;
    const slaMetPercent = (slaMet / analytics.length) * 100;

    return {
      deliveredCount: analytics.length,
      slaMetCount: slaMet,
      slaMetPercentage: parseFloat(slaMetPercent.toFixed(2)),
      averageLatencyMs: parseFloat(averageLatency.toFixed(2)),
    };
  }

  async getQueueAndWorkerStatus() {
    // Simulated active queues status. In production, BullMQ client will query Redis directly.
    return {
      activeWorkersCount: 4,
      queues: [
        {
          name: 'high-priority',
          activeJobs: 0,
          waitingJobs: 0,
          completedJobs: 342,
          failedJobs: 1,
        },
        {
          name: 'default',
          activeJobs: 0,
          waitingJobs: 0,
          completedJobs: 1284,
          failedJobs: 12,
        },
        {
          name: 'low-priority',
          activeJobs: 0,
          waitingJobs: 0,
          completedJobs: 89,
          failedJobs: 0,
        },
      ],
    };
  }
}
