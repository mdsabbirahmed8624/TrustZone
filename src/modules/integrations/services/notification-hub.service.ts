import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingConnectorService } from './messaging-connector.service';

@Injectable()
export class NotificationHubService {
  private readonly logger = new Logger(NotificationHubService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingConnector: MessagingConnectorService,
  ) {}

  /**
   * Creates or updates a cross-channel Notification Template
   */
  async upsertTemplate(
    code: string,
    name: string,
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP',
    bodyTemplate: string,
    subject?: string,
    placeholders: string[] = [],
  ) {
    const existing = await this.prisma.notificationTemplate.findUnique({
      where: { code },
    });

    if (existing) {
      return this.prisma.notificationTemplate.update({
        where: { id: existing.id },
        data: {
          name,
          bodyLayout: bodyTemplate,
          titleLayout: subject || name,
        },
      });
    }

    return this.prisma.notificationTemplate.create({
      data: {
        code,
        name,
        channel: channel as any,
        titleLayout: subject || name,
        bodyLayout: bodyTemplate,
      },
    });
  }

  /**
   * Renders a template body with key-value variable substitutions
   */
  renderTemplate(templateText: string, variables: Record<string, any>): string {
    let output = templateText;
    for (const [key, val] of Object.entries(variables)) {
      output = output.replace(
        new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
        String(val),
      );
    }
    return output;
  }

  /**
   * Dispatches a templated multi-channel notification
   */
  async sendNotification(
    templateCode: string,
    recipient: string,
    variables: Record<string, any> = {},
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
  ) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { code: templateCode },
    });

    if (!template) {
      throw new NotFoundException(
        `Notification Template '${templateCode}' not found.`,
      );
    }

    const renderedBody = this.renderTemplate(template.bodyLayout, variables);
    const renderedSubject = template.titleLayout
      ? this.renderTemplate(template.titleLayout, variables)
      : undefined;

    this.logger.log(
      `Dispatching Hub Notification [${template.channel}] via '${templateCode}'`,
    );

    let result: any;
    if (
      template.channel === 'EMAIL' ||
      template.channel.toString() === 'EMAIL'
    ) {
      result = await this.messagingConnector.sendEmail(
        recipient,
        renderedSubject || 'Notification',
        renderedBody,
        environment,
      );
    } else if (
      template.channel === 'SMS' ||
      template.channel.toString() === 'SMS'
    ) {
      result = await this.messagingConnector.sendSms(
        recipient,
        renderedBody,
        environment,
      );
    } else if (
      template.channel === 'WHATSAPP' ||
      template.channel.toString() === 'WHATSAPP'
    ) {
      result = await this.messagingConnector.sendWhatsApp(
        recipient,
        templateCode,
        [renderedBody],
        environment,
      );
    } else {
      result = {
        notificationId: 'inapp_' + Math.floor(Math.random() * 100000),
        recipient,
        status: 'DELIVERED',
      };
    }

    return {
      templateCode,
      channel: template.channel,
      recipient,
      renderedBody,
      renderedSubject,
      dispatchResult: result,
    };
  }

  /**
   * Returns delivery logs and statistics for notification hub
   */
  async getNotificationStats() {
    const totalTemplates = await this.prisma.notificationTemplate.count();
    const totalNotifications = await this.prisma.notification.count();

    return {
      totalTemplates,
      totalNotificationsDispatched: totalNotifications,
      channelsSupported: ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'],
      status: 'OPERATIONAL',
    };
  }
}
