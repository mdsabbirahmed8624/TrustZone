import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a multi-channel communication entry (Email, SMS, WhatsApp, Call, Meeting)
   */
  async logCommunication(data: {
    customerId?: string;
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'CALL' | 'MEETING';
    direction?: 'INBOUND' | 'OUTBOUND';
    subject?: string;
    content: string;
    staffName?: string;
  }) {
    const record = await this.prisma.communicationHistory.create({
      data: {
        customerId: data.customerId || null,
        channel: data.channel,
        direction: data.direction || 'OUTBOUND',
        subject: data.subject || null,
        content: data.content,
        status: 'SENT',
        staffName: data.staffName || 'System',
      },
    });

    this.logger.log(
      `Logged Communication [${record.channel}] for Customer '${record.customerId || 'GLOBAL'}'`,
    );
    return record;
  }

  /**
   * Retrieves communication history for a customer or overall
   */
  async getHistory(customerId?: string, channel?: string) {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (channel) where.channel = channel;

    return this.prisma.communicationHistory.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
