import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a Follow-Up Reminder
   */
  async createReminder(data: {
    customerId?: string;
    title: string;
    remindAt: Date;
    channel?: string;
  }) {
    const reminder = await this.prisma.followUpReminder.create({
      data: {
        customerId: data.customerId || null,
        title: data.title,
        remindAt: data.remindAt,
        channel: data.channel || 'IN_APP',
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Created FollowUpReminder '${reminder.id}' (${reminder.title}) at ${reminder.remindAt}`,
    );
    return reminder;
  }

  /**
   * Retrieves pending follow-up reminders
   */
  async getPendingReminders(customerId?: string) {
    const where: any = { status: 'PENDING' };
    if (customerId) where.customerId = customerId;

    return this.prisma.followUpReminder.findMany({
      where,
      include: { customer: true },
      orderBy: { remindAt: 'asc' },
    });
  }

  /**
   * Completes a reminder
   */
  async completeReminder(reminderId: string) {
    const reminder = await this.prisma.followUpReminder.update({
      where: { id: reminderId },
      data: { status: 'SENT' },
    });

    this.logger.log(`Completed FollowUpReminder '${reminderId}'`);
    return reminder;
  }
}
