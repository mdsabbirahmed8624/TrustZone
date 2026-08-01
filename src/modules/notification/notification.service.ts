import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private socketSubscribers: Map<
    string,
    ((event: string, data: any) => void)[]
  > = new Map();

  constructor(private readonly prisma: PrismaService) {}

  // 1. Socket Abstraction for Real-Time updates
  subscribeToUserEvents(
    userId: string,
    callback: (event: string, data: any) => void,
  ) {
    if (!this.socketSubscribers.has(userId)) {
      this.socketSubscribers.set(userId, []);
    }
    this.socketSubscribers.get(userId).push(callback);
  }

  unsubscribeFromUserEvents(
    userId: string,
    callback: (event: string, data: any) => void,
  ) {
    const list = this.socketSubscribers.get(userId);
    if (list) {
      this.socketSubscribers.set(
        userId,
        list.filter((cb) => cb !== callback),
      );
    }
  }

  emitRealtimeEvent(userId: string | 'all', event: string, data: any) {
    console.log(
      `[Realtime Socket Event] To: ${userId}, Event: ${event}, Data:`,
      data,
    );
    if (userId === 'all') {
      for (const [uid, callbacks] of this.socketSubscribers.entries()) {
        callbacks.forEach((cb) => cb(event, data));
      }
    } else {
      const callbacks = this.socketSubscribers.get(userId);
      if (callbacks) {
        callbacks.forEach((cb) => cb(event, data));
      }
    }
  }

  // 2. Variable Replacement Engine
  compileTemplate(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const key of Object.keys(variables)) {
      result = result.replace(
        new RegExp(`{{${key}}}`, 'g'),
        String(variables[key]),
      );
    }
    return result;
  }

  // 3. User Preferences Check
  async shouldSendNotification(
    userId: string,
    channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH',
    category?: string,
  ): Promise<boolean> {
    const pref = await this.prisma.userNotificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) return true; // Default to send if no preferences found

    // Check channels toggle
    if (channel === 'IN_APP' && !pref.inAppEnabled) return false;
    if (channel === 'EMAIL' && !pref.emailEnabled) return false;
    if (channel === 'SMS' && !pref.smsEnabled) return false;
    if (channel === 'WHATSAPP' && !pref.whatsappEnabled) return false;
    if (channel === 'PUSH' && !pref.pushEnabled) return false;

    // Check DND
    if (pref.dndEnabled) return false;

    // Check category mute
    if (category && pref.mutedCategories.includes(category)) return false;

    // Check working hours (HH:MM vs HH:MM)
    const now = new Date();
    const currentHrMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (pref.workingHoursStart && pref.workingHoursEnd) {
      if (pref.workingHoursStart <= pref.workingHoursEnd) {
        // Normal day interval
        if (
          currentHrMin < pref.workingHoursStart ||
          currentHrMin > pref.workingHoursEnd
        ) {
          return false;
        }
      } else {
        // Overnight interval
        if (
          currentHrMin < pref.workingHoursStart &&
          currentHrMin > pref.workingHoursEnd
        ) {
          return false;
        }
      }
    }

    return true;
  }

  // 4. Send Notification
  async sendNotification(dto: {
    userId?: string | null;
    title: string;
    message: string;
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFORMATION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
    category?: string;
    variables?: Record<string, any>;
  }) {
    let finalMessage = dto.message;
    if (dto.variables) {
      finalMessage = this.compileTemplate(dto.message, dto.variables);
    }

    if (dto.userId) {
      const allowed = await this.shouldSendNotification(
        dto.userId,
        dto.channel,
        dto.category,
      );
      if (!allowed) {
        console.log(
          `[Notification Muted] User: ${dto.userId}, Channel: ${dto.channel}`,
        );
        return null;
      }
    }

    // Always create in-app notification records for auditing if userId is present
    let inAppRecord = null;
    if (dto.userId && (dto.channel === 'IN_APP' || true)) {
      inAppRecord = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          title: dto.title,
          message: finalMessage,
          type: dto.type,
          priority: dto.priority,
          channel: dto.channel,
          isRead: false,
        },
      });

      // Emit live update
      this.emitRealtimeEvent(dto.userId, 'NOTIFICATION_CREATED', inAppRecord);
    }

    // Dispatch external channel
    if (dto.channel !== 'IN_APP') {
      console.log(
        `[MOCK DISPATCH] Channel: ${dto.channel}, Title: ${dto.title}, Msg: ${finalMessage}`,
      );
      // Record customer communication if applicable (if we can resolve user email or phone)
      if (dto.userId) {
        const u = await this.prisma.user.findUnique({
          where: { id: dto.userId },
        });
        if (u) {
          // If this corresponds to customer alerts or similar
          await this.prisma.customerCommunication.create({
            data: {
              customerId: 'd1111111-1111-1111-1111-111111111111', // System placeholder or resolve
              type:
                dto.channel === 'EMAIL'
                  ? 'Email'
                  : dto.channel === 'SMS'
                    ? 'SMS'
                    : 'WhatsApp',
              subject: dto.title,
              message: finalMessage,
              status: 'Sent',
              staffName: 'System Automation',
            },
          });
        }
      }
    }

    return inAppRecord;
  }

  // 5. In-App Notifications API
  async listUserNotifications(
    userId: string,
    filters: { read?: boolean; archived?: boolean; search?: string },
  ) {
    const where: any = { userId };
    if (filters.read !== undefined) where.isRead = filters.read;
    if (filters.archived !== undefined) where.isArchived = filters.archived;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found.');
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    this.emitRealtimeEvent(userId, 'NOTIFICATION_UPDATED', updated);
    return updated;
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    this.emitRealtimeEvent(userId, 'NOTIFICATION_ALL_READ', { userId });
    return { success: true };
  }

  async archiveNotification(id: string, userId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found.');
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isArchived: true },
    });
    this.emitRealtimeEvent(userId, 'NOTIFICATION_UPDATED', updated);
    return updated;
  }

  async deleteNotification(id: string, userId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found.');
    await this.prisma.notification.delete({
      where: { id },
    });
    this.emitRealtimeEvent(userId, 'NOTIFICATION_DELETED', { id });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false, isArchived: false },
    });
    return { count };
  }

  // 6. User Preferences API
  async getPreferences(userId: string) {
    let pref = await this.prisma.userNotificationPreference.findUnique({
      where: { userId },
    });
    if (!pref) {
      pref = await this.prisma.userNotificationPreference.create({
        data: { userId },
      });
    }
    return pref;
  }

  async updatePreferences(userId: string, data: any) {
    return this.prisma.userNotificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // 7. Templates CRUD API
  async listTemplates(type?: string) {
    return this.prisma.template.findMany({
      where: type ? { type } : {},
      orderBy: { name: 'asc' },
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found.');
    return template;
  }

  async createTemplate(data: {
    name: string;
    type: string;
    subject?: string;
    content: string;
    variables: string[];
  }) {
    const existing = await this.prisma.template.findUnique({
      where: { name: data.name },
    });
    if (existing)
      throw new BadRequestException('Template name already exists.');
    return this.prisma.template.create({ data });
  }

  async updateTemplate(id: string, data: any) {
    await this.getTemplate(id);
    return this.prisma.template.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string) {
    await this.getTemplate(id);
    await this.prisma.template.delete({ where: { id } });
    return { success: true };
  }
}
