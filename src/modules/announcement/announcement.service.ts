import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createAnnouncement(
    createdById: string,
    dto: {
      title: string;
      content: string;
      targetType: 'ALL' | 'BRANCH' | 'ROLE';
      targetValue?: string;
      scheduledFor?: string;
    },
  ) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        targetType: dto.targetType,
        targetValue: dto.targetValue || null,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        createdById,
      },
    });

    // If it's NOT scheduled for future, send immediately to users
    if (!dto.scheduledFor) {
      await this.dispatchAnnouncement(announcement);
    }

    return announcement;
  }

  async dispatchAnnouncement(announcement: any) {
    // Resolve targeted users
    const where: any = {};
    if (announcement.targetType === 'BRANCH') {
      where.branchId = announcement.targetValue;
    } else if (announcement.targetType === 'ROLE') {
      where.role = announcement.targetValue;
    }

    const targetUsers = await this.prisma.user.findMany({ where });

    for (const u of targetUsers) {
      await this.notificationService.sendNotification({
        userId: u.id,
        title: `Announcement: ${announcement.title}`,
        message: announcement.content,
        type: 'INFORMATION',
        priority: 'HIGH',
        channel: 'IN_APP',
        category: 'announcement',
      });
    }
  }

  async listAnnouncements(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const now = new Date();

    // Fetch announcements that have already been scheduled or are immediate,
    // and match the user's branch or role or ALL.
    const announcements = await this.prisma.announcement.findMany({
      where: {
        OR: [
          { targetType: 'ALL' },
          { targetType: 'BRANCH', targetValue: user.branchId },
          { targetType: 'ROLE', targetValue: user.role },
        ],
        AND: [
          {
            OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return announcements;
  }

  async deleteAnnouncement(id: string) {
    const ann = await this.prisma.announcement.findUnique({ where: { id } });
    if (!ann) throw new NotFoundException('Announcement not found.');
    await this.prisma.announcement.delete({ where: { id } });
    return { success: true };
  }
}
