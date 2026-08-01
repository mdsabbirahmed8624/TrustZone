import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SalesAutomationService {
  private readonly logger = new Logger(SalesAutomationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a SalesTask for an opportunity or lead
   */
  async createSalesTask(data: {
    opportunityId?: string;
    title: string;
    description?: string;
    taskType?: string;
    priority?: string;
    dueDate?: Date;
    assignedToId?: string;
  }) {
    const task = await this.prisma.salesTask.create({
      data: {
        opportunityId: data.opportunityId || null,
        title: data.title,
        description: data.description || null,
        taskType: data.taskType || 'CALL',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate || null,
        assignedToId: data.assignedToId || null,
        status: 'PENDING',
      },
    });

    this.logger.log(`Created SalesTask '${task.id}' (${task.title})`);
    return task;
  }

  /**
   * Updates task status to COMPLETED
   */
  async completeTask(taskId: string) {
    const task = await this.prisma.salesTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    this.logger.log(`Completed SalesTask '${taskId}'`);
    return task;
  }

  /**
   * Automation Trigger: Auto-generates follow-up sales tasks when an opportunity moves stage
   */
  async triggerStageAutomation(opportunityId: string, stageName: string) {
    let taskTitle = `Follow up on Opportunity`;
    let priority = 'MEDIUM';

    if (stageName.toLowerCase().includes('quote')) {
      taskTitle = 'Confirm Quote Receipt & Customer Decision';
      priority = 'HIGH';
    } else if (stageName.toLowerCase().includes('approval')) {
      taskTitle = 'Obtain Final Repair Authorization Signature';
      priority = 'URGENT';
    }

    const task = await this.createSalesTask({
      opportunityId,
      title: taskTitle,
      priority,
      taskType: 'CALL',
      dueDate: new Date(Date.now() + 48 * 3600000), // Due in 48h
    });

    this.logger.log(
      `Triggered Stage Automation: Created task '${task.id}' for Stage '${stageName}'`,
    );
    return task;
  }
}
