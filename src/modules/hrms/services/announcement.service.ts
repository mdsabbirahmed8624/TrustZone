import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Publishes an HR Announcement
   */
  async createAnnouncement(
    title: string,
    content: string,
    department?: string,
    priority = 'NORMAL',
  ) {
    const announcement = await this.prisma.hRAnnouncement.create({
      data: {
        title,
        content,
        department: department || null,
        priority,
      },
    });

    this.logger.log(
      `Published HR Announcement '${announcement.title}' [Target: ${department || 'ALL'}]`,
    );
    return announcement;
  }

  /**
   * Retrieves published announcements for an employee's department
   */
  async getAnnouncements(department?: string) {
    const where: any = {};
    if (department) {
      where.OR = [{ department: null }, { department }];
    }

    return this.prisma.hRAnnouncement.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }
}
