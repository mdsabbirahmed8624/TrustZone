import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cronParser = require('cron-parser');

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async scheduleNotification(
    recipientId: string,
    templateCode: string,
    variables: Record<string, any>,
    scheduleExpression: string, // cron or ISO Date string
    timezone = 'UTC',
  ) {
    this.logger.log(
      `Scheduling notification for user ${recipientId} using expression ${scheduleExpression} in timezone ${timezone}`,
    );

    let nextRun: Date;

    if (scheduleExpression.includes('*') || scheduleExpression.includes('?')) {
      // Cron expression
      const options = { tz: timezone };
      const interval = cronParser.parseExpression(scheduleExpression, options);
      nextRun = interval.next().toDate();
    } else {
      // ISO String date
      nextRun = new Date(scheduleExpression);
    }

    // Save scheduled job log
    const scheduledJob = await this.prisma.notification.create({
      data: {
        recipientId,
        title: 'Scheduled Alert',
        body: 'Pending delivery',
        message: 'Pending delivery',
        type: templateCode,
        status: 'PENDING',
        payload: variables,
        scheduledAt: nextRun,
      },
    });

    return scheduledJob;
  }

  async getScheduledJobsCalendar(start: Date, end: Date) {
    return this.prisma.notification.findMany({
      where: {
        scheduledAt: {
          gte: start,
          lte: end,
        },
        status: 'PENDING',
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
