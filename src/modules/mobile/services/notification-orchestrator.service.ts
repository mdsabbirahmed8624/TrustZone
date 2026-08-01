import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TemplateEngineService } from './template-engine.service';
import { RealtimeGateway } from '../gateways/realtime.gateway';
import { PushProviderFactory } from '../providers/push-provider.factory';
import { RedisService } from '../../redis/redis.service';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  PushProviderType,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class NotificationOrchestratorService {
  private readonly logger = new Logger(NotificationOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly templateEngine: TemplateEngineService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly pushFactory: PushProviderFactory,
    private readonly redis: RedisService,
  ) {}

  // Cryptographically sign payload for security
  private signPayload(payload: any): string {
    const secret = 'enterprise-notification-signing-key-2026';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  async sendNotification(
    recipientId: string,
    templateCode: string,
    variables: Record<string, any>,
    options?: { priority?: NotificationPriority; bypassPreferences?: boolean },
  ) {
    this.logger.log(
      `Orchestrating notification: Recipient=${recipientId}, Template=${templateCode}`,
    );

    // 1. Fetch template
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { code: templateCode },
    });

    if (!template) {
      throw new NotFoundException(
        `Notification template with code "${templateCode}" not found.`,
      );
    }

    // 2. Compile layout
    const title = this.templateEngine.compile(template.titleLayout, variables);
    const body = this.templateEngine.compile(template.bodyLayout, variables);

    // 3. Retrieve user preferences
    const preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId: recipientId },
    });

    // Check mute & category blocks
    if (preferences && !options?.bypassPreferences) {
      if (preferences.mutedCategories.includes(templateCode)) {
        this.logger.warn(
          `Notification category "${templateCode}" is muted by recipient ${recipientId}`,
        );
        return null;
      }
    }

    // 4. Decide Channel Fallback: WebSocket -> Push
    let targetChannel: NotificationChannel = template.channel;

    // Check if recipient is online for WebSockets
    const isOnline = await this.redis.get(`presence:${recipientId}`);
    if (
      targetChannel === NotificationChannel.WEBSOCKET &&
      isOnline !== 'online'
    ) {
      this.logger.log(
        `Recipient ${recipientId} is offline. Falling back from WEBSOCKET to PUSH.`,
      );
      targetChannel = NotificationChannel.PUSH;
    }

    // 5. Create Notification Record in DB
    const signature = this.signPayload({ recipientId, title, body, variables });
    const notification = await this.prisma.notification.create({
      data: {
        template: { connect: { id: template.id } },
        recipientId,
        title,
        body,
        message: body, // Keep message field populated for backward compatibility
        type: templateCode, // Keep type field populated for backward compatibility
        isRead: false,
        isArchived: false,
        channel: targetChannel, // Pass enum directly
        priority: options?.priority || NotificationPriority.MEDIUM, // Pass enum directly
        status: NotificationStatus.QUEUED,
        payload: variables,
        signature,
      },
    });

    // Write log entry
    await this.prisma.notificationLog.create({
      data: {
        notificationId: notification.id,
        status: NotificationStatus.QUEUED,
      },
    });

    // 6. Deliver notification
    try {
      if (targetChannel === NotificationChannel.WEBSOCKET) {
        await this.deliverViaWebSocket(recipientId, notification);
      } else if (targetChannel === NotificationChannel.PUSH) {
        await this.deliverViaPush(recipientId, notification);
      } else {
        // Fallback to In-App log
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: NotificationStatus.SENT, sentAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.error(
        `Notification delivery failed for ID ${notification.id}: ${error.message}`,
      );

      // Update retry state
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.FAILED },
      });

      await this.prisma.notificationRetry.create({
        data: {
          notificationId: notification.id,
          retryCount: 1,
          errorMessage: error.message,
          nextAttemptAt: new Date(Date.now() + 60000), // Retry in 1 minute
        },
      });

      await this.prisma.notificationLog.create({
        data: {
          notificationId: notification.id,
          status: NotificationStatus.FAILED,
          errorDetails: error.message,
        },
      });
    }

    return notification;
  }

  private async deliverViaWebSocket(recipientId: string, notification: any) {
    this.logger.log(`Delivering via WebSocket to Room user:${recipientId}`);
    this.realtimeGateway.server.to(`user:${recipientId}`).emit('notification', {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      payload: notification.payload,
      signature: notification.signature,
      createdAt: notification.createdAt,
    });

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.DELIVERED,
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    await this.prisma.notificationAnalytics.create({
      data: {
        notificationId: notification.id,
        delivered: true,
        deliveryLatency: 0,
      },
    });
  }

  private async deliverViaPush(recipientId: string, notification: any) {
    this.logger.log(`Delivering via Push to Recipient User=${recipientId}`);

    // Find active push devices for user
    const devices = await this.prisma.pushDevice.findMany({
      where: { userId: recipientId, isActive: true },
    });

    if (devices.length === 0) {
      throw new Error('No active push devices registered for this user.');
    }

    const start = Date.now();

    for (const device of devices) {
      const provider = this.pushFactory.getProvider(device.provider);
      const res = await provider.send(device.pushToken, {
        title: notification.title,
        body: notification.body,
        data: notification.payload as any,
      });

      if (!res.success) {
        this.logger.warn(
          `Push failed for token ${device.pushToken}: ${res.error}`,
        );
        // Handle invalid/expired tokens automatic cleanup
        if (res.error?.includes('invalid') || res.error?.includes('expired')) {
          await this.prisma.pushDevice.update({
            where: { id: device.id },
            data: { isActive: false },
          });
          this.logger.warn(
            `Token "${device.pushToken}" marked inactive due to invalid provider status.`,
          );
        }
      } else {
        await this.prisma.pushDevice.update({
          where: { id: device.id },
          data: { lastPushAt: new Date() },
        });

        // Log device events audit log
        await this.prisma.deviceEvent.create({
          data: {
            deviceId: device.id,
            eventType: 'PUSH_UPDATED',
            details: `Notification delivered successfully to ${device.deviceFingerprint}`,
          },
        });
      }
    }

    const latency = Date.now() - start;

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.DELIVERED,
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    await this.prisma.notificationAnalytics.create({
      data: {
        notificationId: notification.id,
        delivered: true,
        deliveryLatency: latency,
      },
    });
  }
}
