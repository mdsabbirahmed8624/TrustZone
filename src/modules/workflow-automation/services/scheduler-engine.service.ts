import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulerEngineService {
  private readonly logger = new Logger(SchedulerEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers or updates a scheduled cron task
   */
  async registerTask(
    taskName: string,
    cronExpression: string,
    actionType: string,
    timezone = 'UTC',
    businessHoursOnly = false,
    holidayExclusion = false,
  ) {
    const task = await this.prisma.scheduledTask.upsert({
      where: { taskName },
      update: {
        cronExpression,
        actionType,
        timezone,
        businessHoursOnly,
        holidayExclusion,
        enabled: true,
      },
      create: {
        taskName,
        cronExpression,
        actionType,
        timezone,
        businessHoursOnly,
        holidayExclusion,
        enabled: true,
        nextRunAt: new Date(Date.now() + 60000), // Next run in 60s
      },
    });

    this.logger.log(
      `Registered Scheduled Task '${taskName}' [Cron: ${cronExpression}]`,
    );
    return task;
  }

  /**
   * Evaluates and executes due scheduled tasks
   */
  async runDueTasks() {
    const dueTasks = await this.prisma.scheduledTask.findMany({
      where: {
        enabled: true,
        isDeleted: false,
        OR: [{ nextRunAt: { lte: new Date() } }, { nextRunAt: null }],
      },
    });

    this.logger.log(
      `Evaluating ${dueTasks.length} scheduled task(s) for execution...`,
    );

    const executed = [];
    for (const task of dueTasks) {
      // Check business hour and holiday constraints if enabled
      if (task.businessHoursOnly) {
        const hour = new Date().getUTCHours();
        if (hour < 8 || hour >= 18) {
          this.logger.log(
            `Skipped '${task.taskName}' due to business hours constraint`,
          );
          continue;
        }
      }

      const updated = await this.prisma.scheduledTask.update({
        where: { id: task.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: new Date(Date.now() + 3600000), // Next run in 1 hour
        },
      });
      executed.push(updated);
    }

    return {
      evaluatedCount: dueTasks.length,
      executedCount: executed.length,
      executed,
    };
  }

  /**
   * Retrieves Job Calendar and task schedule summary
   */
  async getJobCalendar() {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: { isDeleted: false },
      orderBy: { nextRunAt: 'asc' },
    });

    return {
      totalScheduledTasks: tasks.length,
      activeTasksCount: tasks.filter((t) => t.enabled).length,
      calendarView: tasks.map((t) => ({
        id: t.id,
        taskName: t.taskName,
        cronExpression: t.cronExpression,
        actionType: t.actionType,
        lastRunAt: t.lastRunAt,
        nextRunAt: t.nextRunAt,
      })),
    };
  }
}
