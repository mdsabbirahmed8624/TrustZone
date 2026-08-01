import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BackgroundJobService {
  private readonly logger = new Logger(BackgroundJobService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enqueues a background job with priority and optional delay
   */
  async enqueueJob(
    jobType: string,
    payload: any,
    queueName = 'DEFAULT',
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
    delaySeconds = 0,
    maxRetries = 3,
  ) {
    const scheduledAt = new Date(Date.now() + delaySeconds * 1000);

    const job = await this.prisma.backgroundJob.create({
      data: {
        queueName,
        jobType,
        payload: payload || {},
        priority,
        status: 'PENDING',
        scheduledAt,
        maxRetries,
      },
    });

    this.logger.log(
      `Enqueued Job '${job.id}' [Type: ${jobType}, Priority: ${priority}, Queue: ${queueName}]`,
    );
    return job;
  }

  /**
   * Processes pending background jobs in order of priority & scheduled time
   */
  async processNextJob(queueName = 'DEFAULT', workerId = 'worker-node-1') {
    const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    const pendingJobs = await this.prisma.backgroundJob.findMany({
      where: {
        queueName,
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
        isDeleted: false,
      },
      take: 10,
    });

    if (pendingJobs.length === 0) {
      return null;
    }

    // Sort in-memory by priority score
    pendingJobs.sort(
      (a, b) =>
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 2) -
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 2),
    );

    const targetJob = pendingJobs[0];
    const startTime = Date.now();

    // Mark job as PROCESSING
    await this.prisma.backgroundJob.update({
      where: { id: targetJob.id },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    try {
      // Execute dummy job work payload processing
      const latencyMs = Date.now() - startTime;

      await this.prisma.jobExecution.create({
        data: {
          jobId: targetJob.id,
          workerId,
          status: 'SUCCESS',
          executionTimeMs: latencyMs,
        },
      });

      const completed = await this.prisma.backgroundJob.update({
        where: { id: targetJob.id },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date(),
        },
      });

      this.logger.log(
        `Job '${targetJob.id}' completed successfully in ${latencyMs}ms`,
      );
      return completed;
    } catch (err: any) {
      const isDLQ = targetJob.retryCount + 1 >= targetJob.maxRetries;
      const nextStatus = isDLQ ? 'DLQ' : 'PENDING';

      await this.prisma.jobExecution.create({
        data: {
          jobId: targetJob.id,
          workerId,
          status: 'FAILED',
          executionTimeMs: Date.now() - startTime,
          errorStack: err.message,
        },
      });

      const failedJob = await this.prisma.backgroundJob.update({
        where: { id: targetJob.id },
        data: {
          status: nextStatus,
          retryCount: targetJob.retryCount + 1,
          errorDetails: err.message,
          scheduledAt: new Date(
            Date.now() + Math.pow(2, targetJob.retryCount + 1) * 1000,
          ), // Exponential backoff
        },
      });

      this.logger.error(
        `Job '${targetJob.id}' failed attempt ${failedJob.retryCount}. Status: ${nextStatus}`,
      );
      return failedJob;
    }
  }

  /**
   * Fetches Dead Letter Queue (DLQ) jobs for manual retry or inspection
   */
  async getDlqJobs() {
    return this.prisma.backgroundJob.findMany({
      where: { status: 'DLQ' },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Worker health and Queue statistics summary
   */
  async getWorkerHealthMetrics() {
    const totalJobs = await this.prisma.backgroundJob.count();
    const pendingJobs = await this.prisma.backgroundJob.count({
      where: { status: 'PENDING' },
    });
    const processingJobs = await this.prisma.backgroundJob.count({
      where: { status: 'PROCESSING' },
    });
    const completedJobs = await this.prisma.backgroundJob.count({
      where: { status: 'COMPLETED' },
    });
    const dlqJobs = await this.prisma.backgroundJob.count({
      where: { status: 'DLQ' },
    });

    return {
      workerNodeStatus: 'HEALTHY',
      totalJobs,
      pendingJobs,
      processingJobs,
      completedJobs,
      dlqJobs,
      queuesSupported: ['DEFAULT', 'HIGH_PRIORITY', 'REPORTS', 'EMAILS'],
    };
  }
}
