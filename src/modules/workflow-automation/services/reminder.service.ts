import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Schedules a multi-channel reminder
   */
  async scheduleReminder(
    recipient: string,
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH',
    message: string,
    sendAt: Date,
    subject?: string,
    userId?: string,
  ) {
    const reminder = await this.prisma.reminder.create({
      data: {
        userId: userId || null,
        recipient,
        channel,
        subject: subject || null,
        message,
        sendAt,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Scheduled [${channel}] Reminder '${reminder.id}' for ${recipient} at ${sendAt.toISOString()}`,
    );
    return reminder;
  }

  /**
   * Processes due pending reminders
   */
  async processDueReminders() {
    const dueReminders = await this.prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        sendAt: { lte: new Date() },
      },
      take: 20,
    });

    const processed = [];
    for (const rem of dueReminders) {
      const updated = await this.prisma.reminder.update({
        where: { id: rem.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      processed.push(updated);
    }

    this.logger.log(`Processed ${processed.length} due reminder(s)`);
    return { processedCount: processed.length, processed };
  }
}
